import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

type ThemeVariant = 'light' | 'dark';

// entity describing per-user settings/preferences
@Entity({ name: 'user_settings' })
export class UserSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20, default: 'dark' })
  theme: ThemeVariant;

  @Column({ name: 'date_format', type: 'varchar', length: 50, default: 'DD.MM.YYYY' })
  dateFormat: string;

  @Column({ name: 'number_format', type: 'varchar', length: 50, default: '1 234,56' })
  numberFormat: string;

  @Column({ name: 'items_per_page', type: 'integer', default: 20 })
  itemsPerPage: number;

  @Column({ name: 'saved_filters', type: 'jsonb', default: () => "'{}'::jsonb" })
  savedFilters: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
