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
import { AiChatRecord } from '../../ai-chat/entities/ai-chat-record.entity';

@Entity('ai_staff_quality_records')
export class AiStaffQualityRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_record_id', comment: '聊天记录ID' })
  chatRecordId: number;

  @Column({ name: 'user_id', comment: '员工ID' })
  userId: number;

  @Column({ name: 'customer_id', comment: '客户ID' })
  customerId: number;

  @Column({ name: 'chat_date', type: 'date', comment: '聊天日期' })
  chatDate: Date;

  // SOP质检数据
  @Column({ name: 'sop_items', type: 'json', nullable: true, comment: 'SOP检查项' })
  sopItems: any;

  @Column({
    name: 'sop_completed_count',
    type: 'int',
    default: 0,
    comment: 'SOP完成项数量',
  })
  sopCompletedCount: number;

  @Column({
    name: 'sop_total_count',
    type: 'int',
    default: 0,
    comment: 'SOP总项数',
  })
  sopTotalCount: number;

  @Column({ name: 'sop_score', type: 'int', nullable: true, comment: 'SOP得分(0-100)' })
  sopScore: number;

  // 违规质检数据
  @Column({ name: 'violations', type: 'json', nullable: true, comment: '违规项列表' })
  violations: any;

  @Column({
    name: 'violation_count',
    type: 'int',
    default: 0,
    comment: '违规数量',
  })
  violationCount: number;

  // 执行力数据
  @Column({ name: 'message_count', type: 'int', default: 0, comment: '消息数量' })
  messageCount: number;

  @Column({
    name: 'response_speed',
    length: 20,
    nullable: true,
    comment: '响应速度：快速/正常/较慢',
  })
  responseSpeed: string;

  @Column({
    name: 'response_time_avg',
    type: 'int',
    nullable: true,
    comment: '平均响应时间(秒)',
  })
  responseTimeAvg: number;

  @Column({
    name: 'high_intent_customer',
    type: 'tinyint',
    default: 0,
    comment: '是否高意向客户',
  })
  highIntentCustomer: number;

  @Column({
    name: 'service_attitude',
    length: 20,
    nullable: true,
    comment: '服务态度：优秀/良好/一般/较差',
  })
  serviceAttitude: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => AiChatRecord)
  @JoinColumn({ name: 'chat_record_id' })
  chatRecord: AiChatRecord;
}
