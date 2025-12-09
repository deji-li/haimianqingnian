import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('operation_notifications')
export class OperationNotification {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ comment: '运营人员ID' })
  @Index()
  operatorId: number

  @Column({ nullable: true, comment: '关联客户ID' })
  customerId: number

  @Column({ nullable: true, comment: '关联订单ID' })
  orderId: number

  @Column({
    type: 'enum',
    enum: ['conversion', 'reminder', 'alert'],
    comment: '通知类型'
  })
  type: 'conversion' | 'reminder' | 'alert'

  @Column({ length: 255, comment: '通知标题' })
  title: string

  @Column({ type: 'text', nullable: true, comment: '通知内容' })
  content: string

  @Column({ default: false, comment: '是否已读' })
  @Index()
  isRead: boolean

  @CreateDateColumn({ comment: '创建时间' })
  @Index()
  createdAt: Date

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date
}