import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', comment: '接收用户ID' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['follow_reminder', 'order_update', 'commission_paid', 'system'],
    comment: '通知类型',
  })
  type: string;

  @Column({ length: 200, comment: '通知标题' })
  title: string;

  @Column({ type: 'text', comment: '通知内容' })
  content: string;

  @Column({ name: 'related_id', nullable: true, comment: '关联ID（客户/订单等）' })
  relatedId: number;

  @Column({ name: 'is_read', type: 'tinyint', default: 0, comment: '是否已读：1-已读，0-未读' })
  isRead: number;

  @Column({ name: 'read_time', type: 'datetime', nullable: true, comment: '阅读时间' })
  readTime: Date;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
