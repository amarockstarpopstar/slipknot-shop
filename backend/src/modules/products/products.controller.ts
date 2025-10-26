import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { UploadProductImageResponseDto } from './dto/upload-product-image-response.dto';
import { Request, Express } from 'express';

// controller with CRUD endpoints for products
@ApiTags('Товары')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private static readonly ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  private static readonly ALLOWED_IMAGE_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
  ];

  private static ensureProductImagesDirectory(): string {
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const productImagesDir = join(uploadsDir, 'products');
    if (!existsSync(productImagesDir)) {
      mkdirSync(productImagesDir, { recursive: true });
    }

    return productImagesDir;
  }

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const directory = ProductsController.ensureProductImagesDirectory();
          cb(null, directory);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname).toLowerCase();
          const fallbackExtension = '.jpg';
          const safeExtension = ProductsController.ALLOWED_IMAGE_EXTENSIONS.includes(
            extension,
          )
            ? extension
            : fallbackExtension;
          cb(null, `${Date.now()}-${randomUUID()}${safeExtension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname).toLowerCase();
        const isMimeAllowed = ProductsController.ALLOWED_IMAGE_MIME_TYPES.includes(
          file.mimetype,
        );
        const isExtensionAllowed =
          ProductsController.ALLOWED_IMAGE_EXTENSIONS.includes(extension);

        if (!isMimeAllowed || !isExtensionAllowed) {
          cb(
            new BadRequestException(
              'Поддерживаются только изображения .jpg, .jpeg, .png или .webp размером до 5 МБ.',
            ),
            false,
          );
          return;
        }

        cb(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить изображение товара' })
  @ApiCreatedResponse({
    description: 'Изображение успешно загружено',
    type: UploadProductImageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный файл изображения' })
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): UploadProductImageResponseDto {
    if (!file) {
      throw new BadRequestException('Файл изображения не был получен');
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = host ? `${protocol}://${host}` : '';

    return {
      imageUrl: `${baseUrl}/uploads/products/${file.filename}`,
    };
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
