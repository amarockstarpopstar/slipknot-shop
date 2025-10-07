import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ProductSummaryDto } from '../products/dto/product-summary.dto';

// service with category management logic
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const name = createCategoryDto.name.trim();

    const existing = await this.categoriesRepository.findOne({
      where: { name },
    });

    if (existing) {
      throw new ConflictException('Категория с таким названием уже существует');
    }

    const category = this.categoriesRepository.create({
      name,
      description: createCategoryDto.description?.trim() ?? null,
    });

    if (createCategoryDto.parentId !== undefined) {
      category.parent = await this.findEntityById(createCategoryDto.parentId);
    }

    const saved = await this.categoriesRepository.save(category);
    return this.findById(saved.id);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesRepository.find({
      relations: { parent: true, products: true },
      order: { id: 'ASC' },
    });

    return categories.map((category) => this.toCategoryResponse(category));
  }

  async findById(id: number): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { parent: true, products: true },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return this.toCategoryResponse(category);
  }

  async findEntityById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { parent: true },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.findEntityById(id);

    if (updateCategoryDto.name) {
      const name = updateCategoryDto.name.trim();
      if (name !== category.name) {
        const existing = await this.categoriesRepository.findOne({
          where: { name },
        });
        if (existing && existing.id !== category.id) {
          throw new ConflictException('Категория с таким названием уже существует');
        }
        category.name = name;
      }
    }

    if (updateCategoryDto.description !== undefined) {
      category.description = updateCategoryDto.description?.trim() ?? null;
    }

    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === category.id) {
        throw new ConflictException('Категория не может быть родителем самой себя');
      }
      category.parent = await this.findEntityById(updateCategoryDto.parentId);
    }

    const saved = await this.categoriesRepository.save(category);
    return this.findById(saved.id);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findEntityById(id);
    await this.categoriesRepository.remove(category);
  }

  private toCategoryResponse(category: Category): CategoryResponseDto {
    const products: ProductSummaryDto[] = (category.products ?? []).map((product) => ({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      sku: product.sku,
    }));

    return {
      id: category.id,
      name: category.name,
      description: category.description ?? null,
      parentId: category.parent ? category.parent.id : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      products,
    };
  }
}
