import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../../user/entities/user.entity';

export enum MergeType {
  ORDER_BINDING = 'order_binding',
  CUSTOMER_SYNC = 'customer_sync',
  MANUAL_MERGE = 'manual_merge'
}

@Entity('customer_merge_logs')
export class CustomerMergeLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'source_customer_id' })
  @Index('idx_source_customer')
  sourceCustomerId: number;

  @Column({ name: 'target_customer_id' })
  @Index('idx_target_customer')
  targetCustomerId: number;

  @Column({ name: 'order_no', length: 50 })
  @Index('idx_order_no')
  orderNo: string;

  @Column({
    type: 'enum',
    enum: MergeType,
    name: 'merge_type'
  })
  @Index('idx_merge_type_created')
  mergeType: MergeType;

  @Column({ name: 'merge_data', type: 'json', nullable: true })
  mergeData: Record<string, any>;

  @Column({ name: 'created_by' })
  @Index('idx_created_by')
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'merge_reason', length: 255, nullable: true })
  mergeReason: string;

  @Column({ name: 'is_successful', type: 'tinyint', default: 1 })
  isSuccessful: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'rollback_possible', type: 'tinyint', default: 1 })
  rollbackPossible: boolean;

  @Column({ name: 'rollback_data', type: 'json', nullable: true })
  rollbackData: Record<string, any>;

  // 关联关系
  @ManyToOne(() => Customer, customer => customer.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_customer_id' })
  sourceCustomer: Customer;

  @ManyToOne(() => Customer, customer => customer.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_customer_id' })
  targetCustomer: Customer;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}