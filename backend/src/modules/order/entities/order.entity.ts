import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_no', length: 50, unique: true })
  orderNo: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: number;

  @Column({ name: 'wechat_id', length: 100, nullable: true })
  wechatId: string;

  @Column({ name: 'wechat_nickname', length: 100, nullable: true })
  wechatNickname: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'sales_id' })
  salesId: number;

  @Column({ name: 'campus_id', nullable: true })
  campusId: number;

  @Column({ name: 'course_name', length: 100 })
  courseName: string;

  @Column({ name: 'payment_amount', type: 'decimal', precision: 10, scale: 2 })
  paymentAmount: number;

  @Column({ name: 'payment_time', type: 'datetime' })
  paymentTime: Date;

  @Column({ name: 'is_new_student', type: 'tinyint', default: 1 })
  isNewStudent: number;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: ['待上课', '上课中', '已完成', '已退款'],
    default: '待上课',
  })
  orderStatus: string;

  @Column({ name: 'teacher_name', length: 50, nullable: true })
  teacherName: string;

  @Column({ length: 50, nullable: true })
  region: string;

  @Column({ name: 'distributor_sales', length: 50, nullable: true })
  distributorSales: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({
    name: 'data_source',
    type: 'enum',
    enum: ['手工录入', '小程序导入'],
    default: '手工录入',
  })
  dataSource: string;

  // 提成相关字段
  @Column({ name: 'order_tag', length: 50, nullable: true })
  orderTag: string;

  @Column({ name: 'commission_scheme_id', nullable: true })
  commissionSchemeId: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  commissionAmount: number;

  @Column({ name: 'commission_calculated_at', type: 'datetime', nullable: true })
  commissionCalculatedAt: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  // 关联客户
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // 虚拟字段
  salesName?: string;
  campusName?: string;
  customerName?: string;
}
