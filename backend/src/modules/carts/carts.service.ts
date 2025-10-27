import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryFailedError } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductSize } from '../products/entities/product-size.entity';
import { SizeStock } from '../products/entities/size-stock.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';
import { User } from '../users/entities/user.entity';
import { DEFAULT_SHIPPING_STATUS } from '../orders/orders.constants';
import {
  resolvePublicBaseUrl,
  resolvePublicImageUrl,
} from '../../common/utils/public-url.util';

// service encapsulating cart logic
@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name);
  private readonly publicBaseUrl: string;

  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductSize)
    private readonly productSizesRepository: Repository<ProductSize>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusesRepository: Repository<OrderStatus>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.publicBaseUrl = resolvePublicBaseUrl(this.configService, this.logger);
  }

  async getCart(userId: number): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productsRepository.findOne({
      where: { id: dto.productId },
      relations: { productSizes: { stock: true } },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const quantityToAdd = dto.quantity ?? 1;
    const requiresSizeSelection = (product.productSizes?.length ?? 0) > 0;

    let productSize: ProductSize | null = null;

    if (dto.productSizeId !== undefined && dto.productSizeId !== null) {
      productSize = await this.productSizesRepository.findOne({
        where: { id: dto.productSizeId },
        relations: { product: true, stock: true },
      });

      if (!productSize || productSize.product?.id !== product.id) {
        throw new BadRequestException('Указанный размер не принадлежит товару');
      }
    } else if (requiresSizeSelection) {
      throw new BadRequestException('Для товара необходимо выбрать размер');
    }

    let cartItem = cart.items?.find(
      (item) =>
        item.product?.id === product.id &&
        (item.productSize?.id ?? null) === (productSize?.id ?? null),
    );

    if (cartItem) {
      if (productSize) {
        const availableStock = productSize.stock?.stock ?? 0;
        const desiredQuantity = cartItem.quantity + quantityToAdd;

        if (availableStock <= 0) {
          throw new BadRequestException(
            'Выбранный размер закончился на складе',
          );
        }

        if (desiredQuantity > availableStock) {
          throw new BadRequestException(
            'Недостаточно товара выбранного размера на складе',
          );
        }
      }

      cartItem.quantity += quantityToAdd;
    } else {
      if (productSize) {
        const availableStock = productSize.stock?.stock ?? 0;

        if (availableStock <= 0) {
          throw new BadRequestException(
            'Выбранный размер закончился на складе',
          );
        }

        if (quantityToAdd > availableStock) {
          throw new BadRequestException(
            'Недостаточно товара выбранного размера на складе',
          );
        }
      }

      cartItem = this.cartItemsRepository.create({
        cart,
        product,
        productSize: productSize ?? null,
        quantity: quantityToAdd,
        unitPrice: this.resolveUnitPrice(product, productSize ?? null),
      });
    }

    cartItem.unitPrice = this.resolveUnitPrice(
      product,
      productSize ?? cartItem.productSize ?? null,
    );

    await this.cartItemsRepository.save(cartItem);

    return this.getCart(userId);
  }

  async updateItem(
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: {
        id: itemId,
        cart: { user: { id: userId } },
      },
      relations: {
        cart: {
          items: { product: true, productSize: { stock: true } },
          user: true,
        },
        product: true,
        productSize: { stock: true },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Товар в корзине не найден');
    }

    if (cartItem.productSize) {
      const availableStock = cartItem.productSize.stock?.stock ?? 0;

      if (availableStock <= 0) {
        throw new BadRequestException('Выбранный размер закончился на складе');
      }

      if (dto.quantity > availableStock) {
        throw new BadRequestException(
          'Недостаточно товара выбранного размера на складе',
        );
      }
    }

    cartItem.quantity = dto.quantity;
    cartItem.unitPrice = this.resolveUnitPrice(
      cartItem.product,
      cartItem.productSize ?? null,
    );
    await this.cartItemsRepository.save(cartItem);

    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number): Promise<CartResponseDto> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: {
        id: itemId,
        cart: { user: { id: userId } },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Товар в корзине не найден');
    }

    await this.cartItemsRepository.remove(cartItem);

    return this.getCart(userId);
  }

  async checkout(userId: number): Promise<CheckoutResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Корзина пуста');
    }

    const user = cart.user;

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const normalizedCountry = user.country?.trim();
    if (normalizedCountry && normalizedCountry.toLowerCase() !== 'россия') {
      throw new BadRequestException(
        'Оформление заказов доступно только пользователям из России.',
      );
    }

    const hasAddress = Boolean(
      normalizedCountry && user.city?.trim() && user.address?.trim(),
    );

    if (!hasAddress) {
      throw new BadRequestException('Укажите адрес доставки в профиле');
    }

    const status = await this.orderStatusesRepository.findOne({
      where: { name: 'Новый' },
    });

    if (!status) {
      throw new NotFoundException('Статус заказа не найден');
    }

    const unavailableItem = cart.items.find((item) => !item.product);
    if (unavailableItem) {
      throw new NotFoundException(
        'Некоторые товары в корзине больше не доступны',
      );
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    const result = await this.dataSource.transaction(async (manager) => {
      const ordersRepo = manager.getRepository(Order);
      const orderItemsRepo = manager.getRepository(OrderItem);
      const cartItemsRepo = manager.getRepository(CartItem);
      const cartsRepo = manager.getRepository(Cart);
      const shippingUpdatedAt = new Date();

      const order = ordersRepo.create({
        user: cart.user,
        status,
        totalAmount: totalAmount.toFixed(2),
        shippingStatus: DEFAULT_SHIPPING_STATUS,
        shippingUpdatedAt,
      });

      const savedOrder = await ordersRepo.save(order);

      const sizeStockRepo = manager.getRepository(SizeStock);

      for (const item of cart.items) {
        if (!item.productSize) {
          continue;
        }

        const stockEntity = await sizeStockRepo
          .createQueryBuilder('stock')
          .setLock('pessimistic_write')
          .innerJoinAndSelect('stock.size', 'size')
          .where('stock.size_id = :sizeId', { sizeId: item.productSize.id })
          .getOne();

        if (!stockEntity) {
          throw new BadRequestException(
            `Не найден остаток для выбранного размера ${item.productSize.size}`,
          );
        }

        if (stockEntity.stock < item.quantity) {
          throw new BadRequestException(
            `Недостаточно товара размера ${item.productSize.size} на складе`,
          );
        }

        stockEntity.stock -= item.quantity;
        await sizeStockRepo.save(stockEntity);
      }

      const orderItems = cart.items.map((item) =>
        orderItemsRepo.create({
          order: savedOrder,
          product: item.product,
          productSize: item.productSize ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }),
      );

      if (orderItems.length > 0) {
        await orderItemsRepo.save(orderItems);
      }

      await cartItemsRepo.delete({ cart: { id: cart.id } });
      await cartsRepo.update({ id: cart.id }, { updatedAt: new Date() });

      return savedOrder;
    });

    return {
      orderId: result.id,
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingStatus: result.shippingStatus,
      shippingUpdatedAt: result.shippingUpdatedAt,
    };
  }

  private async getOrCreateCart(userId: number): Promise<Cart> {
    const existing = await this.findCartByUser(userId);
    if (existing) {
      return existing;
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const newCart = this.cartsRepository.create({ user });
    try {
      const saved = await this.cartsRepository.save(newCart);
      const cartWithRelations = await this.cartsRepository.findOne({
        where: { id: saved.id },
        relations: {
          user: true,
          items: { product: true, productSize: { stock: true } },
        },
        order: { items: { id: 'ASC' } },
      });

      if (!cartWithRelations) {
        throw new NotFoundException('Не удалось создать корзину');
      }

      return cartWithRelations;
    } catch (error) {
      const driverError =
        error instanceof QueryFailedError
          ? error.driverError
          : (error as { driverError?: { code?: string } }).driverError;

      if (driverError?.code === '23505') {
        const existingCart = await this.findCartByUser(userId);
        if (existingCart) {
          return existingCart;
        }
        console.error('Cart unique violation without existing cart', error);
      } else {
        console.error('Failed to create cart', error);
      }
      throw error;
    }
  }

  private resolveUnitPrice(product: Product, size: ProductSize | null): string {
    if (size) {
      const sizePrice = Number(size.price);
      if (Number.isFinite(sizePrice)) {
        return sizePrice.toFixed(2);
      }
    }

    const basePrice = Number(product.price);
    if (Number.isFinite(basePrice)) {
      return basePrice.toFixed(2);
    }

    return '0.00';
  }

  private async findCartByUser(userId: number): Promise<Cart | null> {
    return this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        items: { product: true, productSize: { stock: true } },
      },
      order: { items: { id: 'ASC' } },
    });
  }

  private toCartResponse(cart: Cart): CartResponseDto {
    const items: CartItemResponseDto[] = (cart.items ?? []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      product: {
        id: item.product?.id ?? 0,
        title: item.product?.title ?? 'Товар недоступен',
        price: Number(item.unitPrice),
        imageUrl: this.toPublicImageUrl(item.product?.imageUrl),
      },
      size: item.productSize
        ? {
            id: item.productSize.id,
            size: item.productSize.size,
            price: Number(item.productSize.price ?? item.unitPrice),
            stock: item.productSize.stock?.stock ?? 0,
          }
        : null,
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return {
      id: cart.id,
      items,
      totalQuantity,
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }

  private toPublicImageUrl(imageUrl?: string | null): string | null {
    return resolvePublicImageUrl(imageUrl, this.publicBaseUrl);
  }
}
