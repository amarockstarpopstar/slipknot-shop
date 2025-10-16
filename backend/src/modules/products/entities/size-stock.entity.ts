import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductSize } from './product-size.entity';

// entity describing stock amount for a particular product size
@Entity({ name: 'size_stock' })
export class SizeStock {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ProductSize, (productSize) => productSize.stock, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'size_id' })
  size: ProductSize;

  @Column({ type: 'integer' })
  stock: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
