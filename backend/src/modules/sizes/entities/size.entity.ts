import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

// size entity describing optional product sizes
@Entity({ name: 'sizes' })
export class SizeEntity {
  // primary identifier for the size option
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Идентификатор размера' })
  id: number;

  // human readable name of the size
  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ example: 'L', description: 'Название размера' })
  name: string;

  // products assigned to this size
  @OneToMany(() => Product, (product) => product.size)
  @ApiPropertyOptional({ type: () => [Product], description: 'Список товаров с данным размером' })
  products: Product[];
}
