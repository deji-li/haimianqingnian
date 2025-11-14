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
    enum: ['手工录入', '小程序导入', '海绵青年GO'],
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

  // ========== 订单同步字段 ==========
  @Column({ name: 'is_external', type: 'tinyint', default: 0, comment: '是否外部订单：0=否，1=是' })
  isExternal: number;

  @Column({ name: 'external_system', length: 50, nullable: true, comment: '来源系统标识（如：HAIMIAN）' })
  externalSystem: string;

  @Column({ name: 'external_status', type: 'int', nullable: true, comment: '海绵系统原始状态值（1-9）' })
  externalStatus: number;

  @Column({ name: 'external_refund', type: 'int', nullable: true, comment: '海绵退款标识：0=默认 1=申请退款 2=已退款 3=不予退款' })
  externalRefund: number;

  @Column({ name: 'external_refund_status', type: 'int', nullable: true, comment: '海绵退款状态：0=默认 1=通过 2=驳回' })
  externalRefundStatus: number;

  @Column({
    name: 'sync_status',
    type: 'enum',
    enum: ['未同步', '已同步', '同步失败'],
    default: '未同步',
    comment: '同步状态',
  })
  syncStatus: string;

  @Column({ name: 'last_sync_time', type: 'datetime', nullable: true, comment: '最后同步时间' })
  lastSyncTime: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0, comment: '外部系统是否删除：0=否，1=是' })
  isDeleted: number;
  // ========== 订单同步字段结束 ==========

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
