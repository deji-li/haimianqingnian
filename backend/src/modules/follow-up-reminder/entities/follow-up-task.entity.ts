import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('follow_up_reminder_tasks')
export class FollowUpReminderTask {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '任务ID'
  })
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
    comment: '客户ID'
  })
  @Index()
  customer_id: number;

  @Column({
    type: 'int',
    unsigned: true,
    comment: '销售ID'
  })
  @Index()
  user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '意向等级'
  })
  @Index()
  intention_level: string;

  @Column({
    type: 'int',
    default: 1,
    comment: '第几轮跟进'
  })
  round_number: number;

  @Column({
    type: 'date',
    comment: '提醒日期'
  })
  @Index()
  remind_date: Date;

  @Column({
    type: 'time',
    default: '09:00:00',
    comment: '提醒时间'
  })
  remind_time: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'system',
    comment: '提醒方式：system-系统通知，homepage-工作台卡片，email-邮件通知'
  })
  remind_method: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '自定义提醒消息'
  })
  message: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
    comment: '状态：pending-待提醒，sent-已发送，completed-已完成，cancelled-已取消'
  })
  @Index()
  status: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 0,
    comment: '是否手动设置：0-系统自动，1-手动设置'
  })
  is_manual: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '发送时间'
  })
  sent_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '完成时间'
  })
  completed_at: Date;

  @CreateDateColumn({
    type: 'datetime',
    comment: '创建时间'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    comment: '更新时间'
  })
  updated_at: Date;

  // 关联客户
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // 关联销售
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
