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

      const product = productsRepo.create({
        title: createProductDto.title.trim(),
        description: createProductDto.description?.trim() ?? null,
        price: createProductDto.price.toFixed(2),
        sku,
        imageUrl: createProductDto.imageUrl?.trim() ?? null,
        category,
      });

      const saved = await productsRepo.save(product);

      const normalizedSizes = this.normalizeSizePayload(createProductDto.sizes);
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

  async findAll(): Promise<ProductResponseDto[]> {
    this.logger.log('Запрос каталога товаров');
    try {
      const products = await this.productsRepository.find({
        relations: {
          category: true,
          productSizes: { stock: true },
        },
        order: {
          id: 'ASC',
          productSizes: { size: 'ASC' },
        },
      });

      this.logger.log(`Каталог успешно загружен (${products.length} позиций)`);
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

      if (updateProductDto.price !== undefined) {
        product.price = updateProductDto.price.toFixed(2);
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

      await this.replaceProductSizes(manager, product, updateProductDto.sizes);

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
      price: Number(product.price),
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
      stock: productSize.stock?.stock ?? 0,
      stockId: productSize.stock?.id ?? null,
      stockUpdatedAt: productSize.stock?.updatedAt ?? null,
    };
  }

  private normalizeSizePayload(
    sizes?: ProductSizeWithStockDto[],
  ): { size: string; stock: number }[] {
    if (!sizes || sizes.length === 0) {
      return [];
    }

    const normalized: { size: string; stock: number }[] = [];
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

      seen.add(key);
      normalized.push({ size: trimmed, stock: size.stock });
    }

    return normalized;
  }

  private async createProductSizes(
    manager: EntityManager,
    product: Product,
    sizes: { size: string; stock: number }[],
  ): Promise<void> {
    if (!sizes.length) {
      return;
    }

    const productSizesRepo = manager.getRepository(ProductSize);
    const sizeStockRepo = manager.getRepository(SizeStock);

    for (const { size, stock } of sizes) {
      const productSize = productSizesRepo.create({
        product,
        size,
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
    sizes?: ProductSizeWithStockDto[],
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

    const normalized = this.normalizeSizePayload(sizes);
    await this.createProductSizes(manager, product, normalized);
  }
}
