import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { UploadProductImageResponseDto } from './dto/upload-product-image-response.dto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import imageSize from 'image-size';
import type { Express } from 'express';
import {
  extractPublicOrigin,
  resolvePublicBaseUrl,
  resolvePublicImageUrl,
} from '../../common/utils/public-url.util';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const PRODUCT_IMAGES_DIR = join(UPLOADS_ROOT, 'products');
const UPLOADS_PUBLIC_PATH = '/uploads';
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_IMAGE_WIDTH = 600;
const MIN_IMAGE_HEIGHT = 600;
const MAX_IMAGE_WIDTH = 4000;
const MAX_IMAGE_HEIGHT = 4000;

interface NormalizedProductSize {
  size: string;
  price: number;
  stock: number;
}

// service with product management logic
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly publicBaseUrl: string;
  private readonly publicBaseOrigin: string;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.publicBaseUrl = resolvePublicBaseUrl(this.configService, this.logger);
    this.publicBaseOrigin = extractPublicOrigin(this.publicBaseUrl);
  }

  private normalizeImageUrl(imageUrl?: string | null): string | null {
    const trimmed = imageUrl?.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('//')) {
      return trimmed;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.origin === this.publicBaseOrigin) {
        const pathWithQuery = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        return pathWithQuery || UPLOADS_PUBLIC_PATH;
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  private resolvePublicImageUrl(imageUrl?: string | null): string | null {
    return resolvePublicImageUrl(imageUrl, this.publicBaseUrl);
  }

  private async ensureProductImageDirectory(): Promise<void> {
    await fs.mkdir(PRODUCT_IMAGES_DIR, { recursive: true });
  }

  private resolveImageExtension(
    file: Express.Multer.File,
    detectedType?: string,
  ): string {
    const candidates = [
      detectedType,
      file.mimetype.split('/').pop(),
      file.originalname.split('.').pop(),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      const normalized = candidate.toLowerCase();
      if (SUPPORTED_IMAGE_EXTENSIONS.has(normalized)) {
        return normalized === 'jpeg' ? 'jpg' : normalized;
      }
    }

    return 'jpg';
  }

  private buildImageFilename(extension: string): string {
    const normalized = extension.toLowerCase() === 'jpeg'
      ? 'jpg'
      : extension.toLowerCase();
    return `${Date.now()}-${randomUUID().slice(0, 12)}.${normalized}`;
  }

  async uploadProductImage(
    file: Express.Multer.File,
  ): Promise<UploadProductImageResponseDto> {
    if (!file) {
      throw new BadRequestException('Файл изображения не получен.');
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Поддерживаются только изображения в форматах JPEG, PNG или WebP.',
      );
    }

    if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
      throw new BadRequestException(
        'Размер изображения не должен превышать 5 МБ.',
      );
    }

    let dimensions: ReturnType<typeof imageSize>;
    try {
      dimensions = imageSize(file.buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Ошибка чтения изображения: ${message}`);
      throw new BadRequestException(
        'Не удалось прочитать файл изображения. Проверьте его и попробуйте снова.',
      );
    }

    const { width, height, type } = dimensions;

    if (!width || !height) {
      throw new BadRequestException(
        'Не удалось определить размеры изображения. Загрузите другой файл.',
      );
    }

    if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
      throw new BadRequestException(
        `Минимальное разрешение изображения — ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} пикселей.`,
      );
    }

    if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
      throw new BadRequestException(
        `Максимальное разрешение изображения — ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT} пикселей.`,
      );
    }

    const extension = this.resolveImageExtension(file, type);
    const filename = this.buildImageFilename(extension);

    try {
      await this.ensureProductImageDirectory();
      await fs.writeFile(join(PRODUCT_IMAGES_DIR, filename), file.buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Не удалось сохранить изображение товара: ${message}`, stack);
      throw new InternalServerErrorException(
        'Не удалось сохранить изображение. Попробуйте ещё раз.',
      );
    }

    return {
      url: `/uploads/products/${filename}`,
      filename,
      width,
      height,
      size: file.size,
    };
  }

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

      const normalizedImageUrl = this.normalizeImageUrl(
        createProductDto.imageUrl,
      );

      const product = productsRepo.create({
        title: createProductDto.title.trim(),
        description: createProductDto.description?.trim() ?? null,
        price: basePrice.toFixed(2),
        sku,
        imageUrl: normalizedImageUrl,
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
        product.imageUrl = this.normalizeImageUrl(
          updateProductDto.imageUrl,
        );
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
      imageUrl: this.resolvePublicImageUrl(product.imageUrl),
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
    requestedPrice: number,
    sizes: NormalizedProductSize[],
  ): number {
    if (!sizes.length) {
      return requestedPrice;
    }

    const sizePrices = sizes
      .map((size) => size.price)
      .filter((price) => Number.isFinite(price) && price > 0);

    if (!sizePrices.length) {
      return requestedPrice;
    }

    return Math.min(...sizePrices);
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
