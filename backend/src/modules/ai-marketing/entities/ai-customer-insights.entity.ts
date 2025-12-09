import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('ai_customer_insights')
export class AiCustomerInsights {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id', comment: '客户ID' })
  customerId: number;

  @Column({ name: 'user_id', comment: '负责人ID' })
  userId: number;

  @Column({
    name: 'insight_type',
    type: 'enum',
    enum: ['pain_point', 'need', 'interest', 'objection', 'question', 'competitor', 'refund_reason', 'focus_point', 'suggestion'],
    comment: '洞察类型',
  })
  insightType: string;

  @Column({ length: 500, comment: '洞察内容' })
  content: string;

  @Column({ name: 'mention_count', type: 'int', default: 1, comment: '提及次数' })
  mentionCount: number;

  @Column({ length: 50, nullable: true, comment: '来源：chat_analysis/manual' })
  source: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否有效' })
  isActive: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
