import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';

export enum TemporaryOrderStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  EXPIRED = 'expired'
}

@Entity('temporary_orders')
@Unique(['orderNo'])
export class TemporaryOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  @Index('idx_customer_status')
  customerId: number;

  @Column({ name: 'order_no', length: 50, unique: true })
  orderNo: string;

  @Column({
    type: 'enum',
    enum: TemporaryOrderStatus,
    default: TemporaryOrderStatus.PENDING,
    name: 'status'
  })
  @Index('idx_customer_status')
  @Index('idx_status_created')
  status: TemporaryOrderStatus;

  @Column({ name: 'created_by' })
  @Index('idx_created_by')
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'synced_at', nullable: true })
  syncedAt: Date;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @Column({ name: 'sync_attempts', default: 0 })
  syncAttempts: number;

  @Column({ name: 'last_sync_attempt', nullable: true })
  lastSyncAttempt: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // 关联关系
  @ManyToOne(() => Customer, customer => customer.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => Order, order => order.id, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  actualOrder: Order;
}