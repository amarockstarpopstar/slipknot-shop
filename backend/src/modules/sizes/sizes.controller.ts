import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SizesService } from './sizes.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { SizeEntity } from './entities/size.entity';

// controller exposing CRUD endpoints for sizes reference data
@ApiTags('Размеры')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый размер' })
  @ApiCreatedResponse({ description: 'Размер создан', type: SizeEntity })
  @ApiBadRequestResponse({ description: 'Некорректные данные размера' })
  create(@Body() createSizeDto: CreateSizeDto): Promise<SizeEntity> {
    return this.sizesService.create(createSizeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список размеров' })
  @ApiOkResponse({ description: 'Список размеров', type: SizeEntity, isArray: true })
  findAll(): Promise<SizeEntity[]> {
    return this.sizesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить размер по идентификатору' })
  @ApiOkResponse({ description: 'Размер найден', type: SizeEntity })
  @ApiNotFoundResponse({ description: 'Размер не найден' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SizeEntity> {
    return this.sizesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить данные размера' })
  @ApiOkResponse({ description: 'Размер обновлён', type: SizeEntity })
  @ApiNotFoundResponse({ description: 'Размер не найден' })
  @ApiBadRequestResponse({ description: 'Некорректные данные размера' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSizeDto: UpdateSizeDto,
  ): Promise<SizeEntity> {
    return this.sizesService.update(id, updateSizeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить размер' })
  @ApiNoContentResponse({ description: 'Размер удалён' })
  @ApiNotFoundResponse({ description: 'Размер не найден' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sizesService.remove(id);
  }
}
