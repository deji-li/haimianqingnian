import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CustomerFollowRecord } from './customer-follow-record.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wechat_nickname', length: 100, nullable: true })
  wechatNickname: string;

  @Column({ name: 'wechat_id', length: 100, unique: true })
  wechatId: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'real_name', length: 50, nullable: true })
  realName: string;

  @Column({ name: 'traffic_source', length: 50, nullable: true })
  trafficSource: string;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: number;

  @Column({ name: 'sales_id' })
  salesId: number;

  @Column({ name: 'sales_wechat', length: 100, nullable: true })
  salesWechat: string;

  @Column({
    name: 'customer_intent',
    type: 'enum',
    enum: ['高', '中', '低'],
    default: '中',
  })
  customerIntent: string;

  @Column({ name: 'next_follow_time', type: 'datetime', nullable: true })
  nextFollowTime: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  // 关联跟进记录
  @OneToMany(() => CustomerFollowRecord, (record) => record.customer)
  followRecords: CustomerFollowRecord[];

  // 虚拟字段（从关联表查询）
  operatorName?: string;
  salesName?: string;
  followRecordCount?: number;
}
