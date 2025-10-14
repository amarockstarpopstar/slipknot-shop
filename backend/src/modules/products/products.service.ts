import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { SizeEntity } from '../sizes/entities/size.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

// service with product management logic
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(SizeEntity)
    private readonly sizesRepository: Repository<SizeEntity>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const sku = createProductDto.sku.trim();

    const existingSku = await this.productsRepository.findOne({
      where: { sku },
    });

    if (existingSku) {
      throw new ConflictException('Товар с таким артикулом уже существует');
    }

    const category = await this.findCategoryById(createProductDto.categoryId);

    const size =
      createProductDto.sizeId !== undefined && createProductDto.sizeId !== null
        ? await this.findSizeById(createProductDto.sizeId)
        : null;

    const product = this.productsRepository.create({
      title: createProductDto.title.trim(),
      description: createProductDto.description?.trim() ?? null,
      price: createProductDto.price.toFixed(2),
      sku,
      stockCount: createProductDto.stockCount,
      imageUrl: createProductDto.imageUrl?.trim() ?? null,
      category,
      size: size ?? null,
    });

    const saved = await this.productsRepository.save(product);
    return this.findById(saved.id);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    this.logger.log('Запрос каталога товаров');
    try {
      const products = await this.productsRepository.find({
        relations: { category: true, size: true },
        order: { id: 'ASC' },
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
      relations: { category: true, size: true },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return this.toProductResponse(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true, size: true },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    if (updateProductDto.sku) {
      const sku = updateProductDto.sku.trim();
      if (sku !== product.sku) {
        const existingSku = await this.productsRepository.findOne({
          where: { sku },
        });
        if (existingSku && existingSku.id !== product.id) {
          throw new ConflictException('Товар с таким артикулом уже существует');
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

    if (updateProductDto.stockCount !== undefined) {
      product.stockCount = updateProductDto.stockCount;
    }

    if (updateProductDto.imageUrl !== undefined) {
      product.imageUrl = updateProductDto.imageUrl?.trim() ?? null;
    }

    if (updateProductDto.categoryId !== undefined) {
      product.category = await this.findCategoryById(updateProductDto.categoryId);
    }

    if (updateProductDto.sizeId !== undefined) {
      product.size =
        updateProductDto.sizeId === null
          ? null
          : await this.findSizeById(updateProductDto.sizeId);
    }

    const saved = await this.productsRepository.save(product);
    return this.findById(saved.id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    await this.productsRepository.remove(product);
  }

  private async findCategoryById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  private async findSizeById(id: number): Promise<SizeEntity> {
    const size = await this.sizesRepository.findOne({ where: { id } });

    if (!size) {
      throw new NotFoundException('Размер не найден');
    }

    return size;
  }

  private toProductResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      title: product.title,
      description: product.description ?? null,
      price: Number(product.price),
      sku: product.sku,
      stockCount: product.stockCount,
      imageUrl: product.imageUrl ?? null,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
          }
        : null,
      size: product.size
        ? {
            id: product.size.id,
            name: product.size.name,
          }
        : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
