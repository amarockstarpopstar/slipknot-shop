import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SizeEntity } from './entities/size.entity';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

// service encapsulating business logic for size reference data
@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(SizeEntity)
    private readonly sizesRepository: Repository<SizeEntity>,
  ) {}

  async create(createSizeDto: CreateSizeDto): Promise<SizeEntity> {
    const name = createSizeDto.name.trim();

    const existing = await this.sizesRepository.findOne({ where: { name } });

    if (existing) {
      throw new ConflictException('Размер с таким названием уже существует');
    }

    const size = this.sizesRepository.create({ name });
    return this.sizesRepository.save(size);
  }

  async findAll(): Promise<SizeEntity[]> {
    return this.sizesRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<SizeEntity> {
    const size = await this.sizesRepository.findOne({ where: { id } });

    if (!size) {
      throw new NotFoundException('Размер не найден');
    }

    return size;
  }

  async update(id: number, updateSizeDto: UpdateSizeDto): Promise<SizeEntity> {
    const size = await this.findOne(id);

    if (updateSizeDto.name) {
      const name = updateSizeDto.name.trim();

      const duplicate = await this.sizesRepository.findOne({ where: { name } });
      if (duplicate && duplicate.id !== size.id) {
        throw new ConflictException('Размер с таким названием уже существует');
      }

      size.name = name;
    }

    return this.sizesRepository.save(size);
  }

  async remove(id: number): Promise<void> {
    const size = await this.findOne(id);
    await this.sizesRepository.remove(size);
  }
}
