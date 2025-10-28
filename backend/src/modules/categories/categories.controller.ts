import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

// controller with CRUD endpoints for categories
@ApiTags('Категории')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую категорию' })
  @ApiCreatedResponse({ description: 'Категория успешно создана', type: CategoryResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные категории' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список категорий' })
  @ApiOkResponse({ description: 'Список категорий', type: CategoryResponseDto, isArray: true })
  findAll(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по идентификатору' })
  @ApiOkResponse({ description: 'Категория найдена', type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.categoriesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить данные категории' })
  @ApiOkResponse({ description: 'Категория обновлена', type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiBadRequestResponse({ description: 'Некорректные данные категории' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiNoContentResponse({ description: 'Категория удалена' })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
