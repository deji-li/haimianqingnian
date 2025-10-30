import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('operation_commission_records')
export class OperationCommissionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'operator_id', comment: '运营人员ID' })
  operatorId: number;

  @Column({ name: 'customer_id', comment: '客户ID' })
  customerId: number;

  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Column({ name: 'order_tag', length: 50, nullable: true, comment: '订单标签' })
  orderTag: string;

  @Column({
    name: 'order_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '订单金额',
  })
  orderAmount: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 200.00,
    comment: '提成金额',
  })
  commissionAmount: number;

  @Column({
    type: 'enum',
    enum: ['待发放', '已发放', '已拒绝'],
    default: '待发放',
    comment: '状态',
  })
  status: string;

  @Column({ name: 'payment_date', type: 'date', nullable: true, comment: '发放日期' })
  paymentDate: Date;

  @Column({ name: 'approver_id', nullable: true, comment: '审核人ID' })
  approverId: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联
  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  // 虚拟字段
  operatorName?: string;
  customerName?: string;
  orderNo?: string;
  approverName?: string;
}
