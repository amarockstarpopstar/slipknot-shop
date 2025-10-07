import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from '../../product-images/entities/product-image.entity';
import { CartItem } from '../../cart-items/entities/cart-item.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { WishlistItem } from '../../wishlist-items/entities/wishlist-item.entity';
import { SizeEntity } from '../../sizes/entities/size.entity';

// product entity
@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  // product price stored as string to preserve precision
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  // total quantity available for sale
  @Column({ name: 'stock_count', type: 'integer', default: 0 })
  stockCount: number;

  // url to the primary product image
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string | null;

  // optional reference to a predefined size
  @ManyToOne(() => SizeEntity, (size) => size.products, { nullable: true })
  @JoinColumn({ name: 'size_id' })
  size?: SizeEntity | null;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.product)
  wishlistItems: WishlistItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
