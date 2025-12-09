import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Campus } from '../../system/entities/campus.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 200, unique: true, comment: '老师姓名' })
  name: string;

  @Column({ name: 'display_name', length: 50, nullable: true, comment: '显示名称' })
  displayName: string;

  @Column({ name: 'phone', length: 20, nullable: true, comment: '联系电话' })
  phone: string;

  @Column({ name: 'id_card', length: 20, nullable: true, comment: '身份证号' })
  idCard: string;

  @Column({ name: 'bank_account', length: 50, nullable: true, comment: '银行账号' })
  bankAccount: string;

  @Column({ name: 'bank_name', length: 100, nullable: true, comment: '银行名称' })
  bankName: string;

  @Column({ name: 'subject', length: 100, nullable: true, comment: '科目' })
  subject: string;

  @Column({ name: 'level', length: 50, nullable: true, comment: '级别' })
  level: string;

  @Column({ name: 'campus_id', nullable: true, comment: '所属校区ID' })
  campusId: number;

  @Column({
    name: 'default_commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 30.00,
    comment: '默认提成比例（百分比）'
  })
  defaultCommissionRate: number;

  @Column({
    name: 'total_sales',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: '总销售额'
  })
  totalSales: number;

  @Column({
    name: 'total_commission',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: '累计提成金额'
  })
  totalCommission: number;

  @Column({
    name: 'pending_settlement',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: '待结算金额'
  })
  pendingSettlement: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['在职', '离职'],
    default: '在职',
    comment: '在职状态',
  })
  status: string;

  @Column({ name: 'join_date', type: 'date', nullable: true, comment: '入职日期' })
  joinDate: Date;

  @Column({ name: 'leave_date', type: 'date', nullable: true, comment: '离职日期' })
  leaveDate: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  // 关联校区
  @ManyToOne(() => Campus, { nullable: true })
  @JoinColumn({ name: 'campus_id' })
  campus?: Campus;

  // 关联订单（一对多）
  @OneToMany(() => Order, (order) => order.teacher)
  orders: Order[];

  // 虚拟字段
  campusName?: string;
  teacherName?: string; // 兼容性字段，映射到name
  orderCount?: number; // 兼容性字段
  studentCount?: number; // 兼容性字段
  teacherType?: string; // 兼容性字段，映射到level
  commissionRate?: number; // 兼容性字段，映射到defaultCommissionRate
}