import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import {
  ProductSizeStockResponseDto,
  ProductSizeWithStockDto,
} from './dto/product-size.dto';
import { ProductSize } from './entities/product-size.entity';
import { SizeStock } from './entities/size-stock.entity';
import { UpdateProductSizeStockDto } from './dto/update-size-stock.dto';

interface NormalizedProductSize {
  size: string;
  price: number;
  stock: number;
}

// service with product management logic
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const sku = createProductDto.sku.trim();

    return this.dataSource.transaction(async (manager) => {
      const productsRepo = manager.getRepository(Product);

      const existingSku = await productsRepo.findOne({ where: { sku } });

      if (existingSku) {
        throw new ConflictException('Товар с таким артикулом уже существует');
      }

      const category = await this.findCategoryById(
        createProductDto.categoryId,
        manager,
      );

      const normalizedSizes = this.normalizeSizePayload(createProductDto.sizes);

      const basePrice = this.determineBasePrice(
        createProductDto.price,
        normalizedSizes,
      );

      const product = productsRepo.create({
        title: createProductDto.title.trim(),
        description: createProductDto.description?.trim() ?? null,
        price: basePrice.toFixed(2),
        sku,
        imageUrl: createProductDto.imageUrl?.trim() ?? null,
        category,
      });

      const saved = await productsRepo.save(product);

      await this.createProductSizes(manager, saved, normalizedSizes);

      const productWithRelations = await productsRepo.findOne({
        where: { id: saved.id },
        relations: {
          category: true,
          productSizes: { stock: true },
        },
        order: {
          productSizes: { size: 'ASC' },
        },
      });

      if (!productWithRelations) {
        throw new NotFoundException('Товар не найден после сохранения');
      }

      return this.toProductResponse(productWithRelations);
    });
  }

  async findAll(search?: string): Promise<ProductResponseDto[]> {
    const normalizedSearch = search?.trim();
    const logSuffix = normalizedSearch ? ` (поиск: "${normalizedSearch}")` : '';

    this.logger.log(`Запрос каталога товаров${logSuffix}`);
    try {
      const queryBuilder = this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.productSizes', 'productSize')
        .leftJoinAndSelect('productSize.stock', 'stock')
        .orderBy('product.id', 'ASC')
        .addOrderBy('productSize.size', 'ASC');

      if (normalizedSearch) {
        const term = `%${normalizedSearch.toLowerCase()}%`;
        queryBuilder.andWhere(
          '(LOWER(product.title) LIKE :term OR LOWER(product.sku) LIKE :term)',
          { term },
        );
      }

      const products = await queryBuilder.getMany();

      this.logger.log(
        `Каталог успешно загружен (${products.length} позиций${
          normalizedSearch ? `, поиск: "${normalizedSearch}"` : ''
        })`,
      );
      return products.map((product) => this.toProductResponse(product));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Ошибка при загрузке каталога: ${message}`, stack);
      throw error;
    }
  }

  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        productSizes: { stock: true },
      },
      order: {
        productSizes: { size: 'ASC' },
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return this.toProductResponse(product);
  }

  async findSizes(id: number): Promise<ProductSizeStockResponseDto[]> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        productSizes: { stock: true },
      },
      order: {
        productSizes: { size: 'ASC' },
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return (product.productSizes ?? []).map((size) =>
      this.toProductSizeResponse(size),
    );
  }

  async updateSizeStock(
    productId: number,
    sizeId: number,
    dto: UpdateProductSizeStockDto,
  ): Promise<ProductSizeStockResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const productSizesRepo = manager.getRepository(ProductSize);
      const sizeStockRepo = manager.getRepository(SizeStock);

      const productSize = await productSizesRepo.findOne({
        where: { id: sizeId },
        relations: { product: true, stock: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!productSize || productSize.product?.id !== productId) {
        throw new NotFoundException('Размер не найден для выбранного товара');
      }

      const stockEntity = productSize.stock
        ? sizeStockRepo.merge(productSize.stock, { stock: dto.stock })
        : sizeStockRepo.create({ size: productSize, stock: dto.stock });

      const savedStock = await sizeStockRepo.save(stockEntity);

      productSize.stock = savedStock;

      return this.toProductSizeResponse(productSize);
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const productsRepo = manager.getRepository(Product);

      const product = await productsRepo.findOne({
        where: { id },
        relations: {
          category: true,
          productSizes: { stock: true },
        },
      });

      if (!product) {
        throw new NotFoundException('Товар не найден');
      }

      let normalizedSizes: NormalizedProductSize[] | undefined;

      if (updateProductDto.sizes !== undefined) {
        normalizedSizes = this.normalizeSizePayload(updateProductDto.sizes);
      }

      if (updateProductDto.sku) {
        const sku = updateProductDto.sku.trim();
        if (sku !== product.sku) {
          const existingSku = await productsRepo.findOne({ where: { sku } });
          if (existingSku && existingSku.id !== product.id) {
            throw new ConflictException(
              'Товар с таким артикулом уже существует',
            );
          }
          product.sku = sku;
        }
      }

      if (updateProductDto.title) {
        product.title = updateProductDto.title.trim();
      }

      if (updateProductDto.description !== undefined) {
        product.description = updateProductDto.description?.trim() ?? null;
      }

      let priceToPersist: number | undefined;

      if (normalizedSizes !== undefined) {
        const fallbackPrice =
          updateProductDto.price !== undefined
            ? updateProductDto.price
            : Number(product.price);
        priceToPersist = this.determineBasePrice(
          fallbackPrice,
          normalizedSizes,
        );
      } else if (updateProductDto.price !== undefined) {
        priceToPersist = updateProductDto.price;
      }

      if (priceToPersist !== undefined) {
        product.price = priceToPersist.toFixed(2);
      }

      if (updateProductDto.imageUrl !== undefined) {
        product.imageUrl = updateProductDto.imageUrl?.trim() ?? null;
      }

      if (updateProductDto.categoryId !== undefined) {
        product.category = await this.findCategoryById(
          updateProductDto.categoryId,
          manager,
        );
      }

      await productsRepo.save(product);

      await this.replaceProductSizes(manager, product, normalizedSizes);

      const reloaded = await productsRepo.findOne({
        where: { id: product.id },
        relations: {
          category: true,
          productSizes: { stock: true },
        },
        order: {
          productSizes: { size: 'ASC' },
        },
      });

      if (!reloaded) {
        throw new NotFoundException('Товар не найден после обновления');
      }

      return this.toProductResponse(reloaded);
    });
  }

  async remove(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    await this.productsRepository.remove(product);
  }

  private async findCategoryById(
    id: number,
    manager?: EntityManager,
  ): Promise<Category> {
    const repository = manager
      ? manager.getRepository(Category)
      : this.categoriesRepository;

    const category = await repository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  private toProductResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      title: product.title,
      description: product.description ?? null,
      price: this.resolveBasePriceFromEntity(product),
      sku: product.sku,
      imageUrl: product.imageUrl ?? null,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
          }
        : null,
      sizes: (product.productSizes ?? []).map((size) =>
        this.toProductSizeResponse(size),
      ),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toProductSizeResponse(
    productSize: ProductSize,
  ): ProductSizeStockResponseDto {
    return {
      id: productSize.id,
      size: productSize.size,
      price: Number(productSize.price),
      stock: productSize.stock?.stock ?? 0,
      stockId: productSize.stock?.id ?? null,
      stockUpdatedAt: productSize.stock?.updatedAt ?? null,
    };
  }

  private normalizeSizePayload(
    sizes?: ProductSizeWithStockDto[],
  ): NormalizedProductSize[] {
    if (!sizes || sizes.length === 0) {
      return [];
    }

    const normalized: NormalizedProductSize[] = [];
    const seen = new Set<string>();

    for (const size of sizes) {
      const trimmed = size.size.trim();
      if (!trimmed) {
        throw new BadRequestException('Название размера не может быть пустым');
      }

      const key = trimmed.toLowerCase();
      if (seen.has(key)) {
        throw new BadRequestException('Размеры не должны повторяться');
      }

      const priceValue = Number(size.price);
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        throw new BadRequestException(
          `Некорректная цена для размера "${trimmed}"`,
        );
      }

      const stockValue = Number(size.stock);
      if (!Number.isFinite(stockValue) || stockValue < 0) {
        throw new BadRequestException(
          `Некорректный остаток для размера "${trimmed}"`,
        );
      }

      seen.add(key);
      normalized.push({
        size: trimmed,
        price: Number(priceValue.toFixed(2)),
        stock: Math.floor(stockValue),
      });
    }

    return normalized;
  }

  private async createProductSizes(
    manager: EntityManager,
    product: Product,
    sizes: NormalizedProductSize[],
  ): Promise<void> {
    if (!sizes.length) {
      return;
    }

    const productSizesRepo = manager.getRepository(ProductSize);
    const sizeStockRepo = manager.getRepository(SizeStock);

    for (const { size, stock, price } of sizes) {
      const productSize = productSizesRepo.create({
        product,
        size,
        price: price.toFixed(2),
      });
      const savedSize = await productSizesRepo.save(productSize);

      const stockEntity = sizeStockRepo.create({
        size: savedSize,
        stock,
      });
      await sizeStockRepo.save(stockEntity);
    }
  }

  private async replaceProductSizes(
    manager: EntityManager,
    product: Product,
    sizes?: NormalizedProductSize[],
  ): Promise<void> {
    if (sizes === undefined) {
      return;
    }

    const productSizesRepo = manager.getRepository(ProductSize);

    await productSizesRepo
      .createQueryBuilder()
      .delete()
      .where('product_id = :productId', { productId: product.id })
      .execute();

    await this.createProductSizes(manager, product, sizes);
  }

  private determineBasePrice(
    requestedPrice: number | undefined,
    sizes: NormalizedProductSize[],
  ): number {
    if (sizes.length) {
      const sizePrices = sizes
        .map((size) => size.price)
        .filter((price) => Number.isFinite(price) && price > 0);

      if (sizePrices.length) {
        return Math.min(...sizePrices);
      }
    }

    if (
      requestedPrice === undefined ||
      !Number.isFinite(requestedPrice) ||
      requestedPrice <= 0
    ) {
      throw new BadRequestException(
        'Для товара без размеров необходимо указать корректную цену',
      );
    }

    return requestedPrice;
  }

  private resolveBasePriceFromEntity(product: Product): number {
    const sizePrices = (product.productSizes ?? [])
      .map((size) => Number(size.price))
      .filter((price) => Number.isFinite(price) && price > 0);

    if (sizePrices.length) {
      return Math.min(...sizePrices);
    }

    return Number(product.price);
  }
}
