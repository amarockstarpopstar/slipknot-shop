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
import { ProductSize } from './product-size.entity';
import { Review } from '../../reviews/entities/review.entity';

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

  // url to the primary product image
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string | null;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductSize, (productSize) => productSize.product, {
    cascade: true,
  })
  productSizes: ProductSize[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.product)
  wishlistItems: WishlistItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
