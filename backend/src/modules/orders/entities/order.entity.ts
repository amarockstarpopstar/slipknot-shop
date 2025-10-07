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
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../../order-statuses/entities/order-status.entity';
import { UserAddress } from '../../user-addresses/entities/user-address.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';

// order entity
@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => OrderStatus, (status) => status.orders)
  @JoinColumn({ name: 'status_id' })
  status: OrderStatus;

  @ManyToOne(() => UserAddress, (address) => address.orders, { nullable: true })
  @JoinColumn({ name: 'address_id' })
  address?: UserAddress | null;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 100, nullable: true })
  paymentMethod?: string | null;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column({ name: 'placed_at', type: 'timestamp with time zone', default: () => 'NOW()' })
  placedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
