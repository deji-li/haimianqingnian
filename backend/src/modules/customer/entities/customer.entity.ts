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

  @Column({
    name: 'traffic_platform',
    type: 'enum',
    enum: ['小红书', '抖音', '视频号'],
    nullable: true,
    comment: '来源平台',
  })
  trafficPlatform: string;

  @Column({
    name: 'traffic_city',
    type: 'enum',
    enum: ['广州', '上海', '深圳', '北京'],
    nullable: true,
    comment: '来源城市',
  })
  trafficCity: string;

  @Column({ name: 'operator_id', nullable: true, comment: '引流运营人员ID' })
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

  @Column({
    name: 'lifecycle_stage',
    type: 'varchar',
    length: 50,
    default: '线索',
    nullable: true,
  })
  lifecycleStage: string;

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
