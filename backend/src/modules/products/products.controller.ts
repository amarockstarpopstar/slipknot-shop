import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductSizeStockResponseDto } from './dto/product-size.dto';
import { UpdateProductSizeStockDto } from './dto/update-size-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadProductImageResponseDto } from './dto/upload-product-image-response.dto';
import type { Express } from 'express';

const PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

// controller with CRUD endpoints for products
@ApiTags('Товары')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Менеджер')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый товар' })
  @ApiCreatedResponse({ description: 'Товар создан', type: ProductResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные товара' })
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Менеджер')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузить изображение товара' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPEG, PNG, WebP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Изображение загружено и доступно по публичному пути',
    type: UploadProductImageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный файл изображения' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: PRODUCT_IMAGE_MAX_SIZE_BYTES },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadProductImageResponseDto> {
    return this.productsService.uploadProductImage(file);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список товаров' })
  @ApiOkResponse({
    description: 'Список товаров',
    type: ProductResponseDto,
    isArray: true,
  })
  findAll(@Query('search') search?: string): Promise<ProductResponseDto[]> {
    return this.productsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по идентификатору' })
  @ApiOkResponse({
    description: 'Детальная информация о товаре',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.productsService.findById(id);
  }

  @Get(':id/sizes')
  @ApiOperation({ summary: 'Получить список размеров и остатков товара' })
  @ApiOkResponse({
    description: 'Размеры товара и их остатки',
    type: ProductSizeStockResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  findSizes(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductSizeStockResponseDto[]> {
    return this.productsService.findSizes(id);
  }

  @Put(':id/sizes/:sizeId/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Менеджер')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить остаток выбранного размера' })
  @ApiOkResponse({
    description: 'Остаток размера обновлён',
    type: ProductSizeStockResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Товар или размер не найдены' })
  @ApiBadRequestResponse({ description: 'Некорректные данные остатка' })
  updateSizeStock(
    @Param('id', ParseIntPipe) id: number,
    @Param('sizeId', ParseIntPipe) sizeId: number,
    @Body() dto: UpdateProductSizeStockDto,
  ): Promise<ProductSizeStockResponseDto> {
    return this.productsService.updateSizeStock(id, sizeId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Менеджер')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить данные товара' })
  @ApiOkResponse({ description: 'Товар обновлён', type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiBadRequestResponse({ description: 'Некорректные данные товара' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Менеджер')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить товар' })
  @ApiNoContentResponse({ description: 'Товар удалён' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
