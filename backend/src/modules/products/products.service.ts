import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

// service with product management logic
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
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

    const product = this.productsRepository.create({
      title: createProductDto.title.trim(),
      description: createProductDto.description?.trim() ?? null,
      price: createProductDto.price.toFixed(2),
      sku,
      stock: createProductDto.stock,
      mainImageUrl: createProductDto.mainImageUrl?.trim() ?? null,
      category,
    });

    const saved = await this.productsRepository.save(product);
    return this.findById(saved.id);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.find({
      relations: { category: true },
      order: { id: 'ASC' },
    });

    return products.map((product) => this.toProductResponse(product));
  }

  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return this.toProductResponse(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true },
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

    if (updateProductDto.stock !== undefined) {
      product.stock = updateProductDto.stock;
    }

    if (updateProductDto.mainImageUrl !== undefined) {
      product.mainImageUrl = updateProductDto.mainImageUrl?.trim() ?? null;
    }

    if (updateProductDto.categoryId !== undefined) {
      product.category = await this.findCategoryById(updateProductDto.categoryId);
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

  private toProductResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      title: product.title,
      description: product.description ?? null,
      price: Number(product.price),
      sku: product.sku,
      stock: product.stock,
      mainImageUrl: product.mainImageUrl ?? null,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
          }
        : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
