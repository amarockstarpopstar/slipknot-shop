import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

// size entity describing optional product sizes
@Entity({ name: 'sizes' })
export class SizeEntity {
  // primary identifier for the size option
  @PrimaryGeneratedColumn()
  id: number;

  // human readable name of the size
  @Column({ type: 'varchar', length: 50 })
  name: string;

  // products assigned to this size
  @OneToMany(() => Product, (product) => product.size)
  products: Product[];
}
