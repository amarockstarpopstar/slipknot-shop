import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// audit log entity
@Entity({ name: 'audit_log' })
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'table_name', type: 'text' })
  tableName: string;

  @Column({ name: 'record_id', type: 'bigint', nullable: true })
  recordId: string | null;

  @Column({ type: 'text' })
  operation: 'INSERT' | 'UPDATE' | 'DELETE';

  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: Record<string, unknown> | null;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: Record<string, unknown> | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  userId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
