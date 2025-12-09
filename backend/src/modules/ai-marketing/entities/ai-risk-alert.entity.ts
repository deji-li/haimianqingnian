import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { User } from '../../user/entities/user.entity';

@Entity('ai_risk_alerts')
export class AiRiskAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  @Index()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    name: 'risk_type',
    type: 'enum',
    enum: ['流失风险', '高意向问询未处理', '不满风险', '潜在退课风险', '潜在退费风险'],
    comment: '风险类型',
  })
  @Index()
  riskType: string;

  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: ['低', '中', '高'],
    default: '中',
    comment: '风险级别',
  })
  riskLevel: string;

  @Column({ name: 'risk_score', type: 'int', nullable: true })
  riskScore: number;

  @Column({ name: 'risk_reason', type: 'text', nullable: true })
  riskReason: string;

  @Column({ name: 'recommended_actions', type: 'json', nullable: true })
  recommendedActions: any;

  @Column({ name: 'from_chat_record_id', nullable: true })
  fromChatRecordId: number;

  @Column({
    type: 'enum',
    enum: ['待处理', '处理中', '已解决', '已忽略'],
    default: '待处理',
    comment: '处理状态',
  })
  @Index()
  status: string;

  @Column({ name: 'assigned_to', nullable: true })
  @Index()
  assignedTo: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignedToUser: User;

  @Column({ name: 'handler_id', nullable: true })
  handlerId: number;

  @Column({ name: 'handle_result', type: 'text', nullable: true })
  handleResult: string;

  @Column({ name: 'handle_time', type: 'datetime', nullable: true })
  handleTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
