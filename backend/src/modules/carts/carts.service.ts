import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';
import { User } from '../users/entities/user.entity';

// service encapsulating cart logic
@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusesRepository: Repository<OrderStatus>,
    private readonly dataSource: DataSource,
  ) {}

  async getCart(userId: number): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productsRepository.findOne({ where: { id: dto.productId } });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const quantityToAdd = dto.quantity ?? 1;
    let cartItem = cart.items?.find((item) => item.product?.id === product.id);

    if (cartItem) {
      cartItem.quantity += quantityToAdd;
    } else {
      cartItem = this.cartItemsRepository.create({
        cart,
        product,
        quantity: quantityToAdd,
        unitPrice: product.price,
      });
    }

    await this.cartItemsRepository.save(cartItem);

    return this.getCart(userId);
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto): Promise<CartResponseDto> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: {
        id: itemId,
        cart: { user: { id: userId } },
      },
      relations: {
        cart: { items: { product: true }, user: true },
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Товар в корзине не найден');
    }

    cartItem.quantity = dto.quantity;
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

    const status = await this.orderStatusesRepository.findOne({ where: { name: 'Новый' } });

    if (!status) {
      throw new NotFoundException('Статус заказа не найден');
    }

    const unavailableItem = cart.items.find((item) => !item.product);
    if (unavailableItem) {
      throw new NotFoundException('Некоторые товары в корзине больше не доступны');
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

      const order = ordersRepo.create({
        user: cart.user,
        status,
        totalAmount: totalAmount.toFixed(2),
      });

      const savedOrder = await ordersRepo.save(order);

      const orderItems = cart.items.map((item) =>
        orderItemsRepo.create({
          order: savedOrder,
          product: item.product,
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
    await this.cartsRepository.save(newCart);

    const createdCart = await this.findCartByUser(userId);

    if (!createdCart) {
      throw new NotFoundException('Не удалось создать корзину');
    }

    return createdCart;
  }

  private async findCartByUser(userId: number): Promise<Cart | null> {
    return this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        items: { product: true },
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
        price: Number(item.product?.price ?? item.unitPrice),
        imageUrl: item.product?.imageUrl ?? null,
      },
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return {
      id: cart.id,
      items,
      totalQuantity,
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }
}
