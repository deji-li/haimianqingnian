import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';

@Entity('commission_calculations')
export class CommissionCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'scheme_id' })
  schemeId: number;

  @Column({ name: 'scheme_name', length: 100 })
  schemeName: string;

  @Column({ name: 'order_amount', type: 'decimal', precision: 10, scale: 2 })
  orderAmount: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  commissionAmount: number;

  @Column({ name: 'calculation_rule', type: 'json' })
  calculationRule: any;

  @Column({ name: 'sales_id' })
  salesId: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'sales_id' })
  sales: any;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'settle_time', type: 'datetime', nullable: true })
  settleTime: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createTime: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updateTime: Date;
}
