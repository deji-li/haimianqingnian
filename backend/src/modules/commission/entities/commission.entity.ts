import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('commission')
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Column({ name: 'user_id', comment: '员工ID' })
  userId: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'order_amount',
    comment: '订单金额',
  })
  orderAmount: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'commission_rate',
    comment: '提成比例(%)',
  })
  commissionRate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'commission_amount',
    comment: '提成金额',
  })
  commissionAmount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
    comment: '提成状态: pending-待发放, paid-已发放, cancelled-已取消',
  })
  status: string;

  @Column({ name: 'settlement_month', comment: '结算月份', nullable: true })
  settlementMonth: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
