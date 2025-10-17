import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// size entity describing optional product sizes
@Entity({ name: 'sizes' })
export class SizeEntity {
  // primary identifier for the size option
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Идентификатор размера' })
  id: number;

  // human readable name of the size
  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty({ example: 'L', description: 'Название размера' })
  name: string;

  // standalone справочник размеров без прямой связи с товарами
}
