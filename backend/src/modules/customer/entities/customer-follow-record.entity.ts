import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('customer_follow_records')
export class CustomerFollowRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'follow_content', type: 'text' })
  followContent: string;

  @Column({ name: 'follow_time', type: 'datetime' })
  followTime: Date;

  @Column({ name: 'operator_id', nullable: true, comment: '操作员ID（AI自动创建时为NULL）' })
  operatorId: number | null;

  @Column({ name: 'next_follow_time', type: 'datetime', nullable: true })
  nextFollowTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  // 关联客户
  @ManyToOne(() => Customer, (customer) => customer.followRecords)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // 虚拟字段
  operatorName?: string;
}
