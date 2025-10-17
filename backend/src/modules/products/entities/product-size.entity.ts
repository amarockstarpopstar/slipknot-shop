import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { SizeStock } from './size-stock.entity';
import { CartItem } from '../../cart-items/entities/cart-item.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';

// entity describing individual size option for a product
@Entity({ name: 'product_sizes' })
export class ProductSize {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productSizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 20 })
  size: string;

  @OneToOne(() => SizeStock, (stock) => stock.size, {
    cascade: true,
  })
  stock: SizeStock;

  @OneToMany(() => CartItem, (cartItem) => cartItem.productSize)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.productSize)
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
