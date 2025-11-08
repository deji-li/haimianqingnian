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

  // ========== AI分析字段 ==========
  @Column({ name: 'student_grade', length: 50, nullable: true, comment: '学生年级' })
  studentGrade: string;

  @Column({ name: 'student_age', type: 'int', nullable: true, comment: '学生年龄' })
  studentAge: number;

  @Column({
    name: 'family_economic_level',
    type: 'enum',
    enum: ['高', '中', '低'],
    nullable: true,
    comment: '家庭经济水平',
  })
  familyEconomicLevel: string;

  @Column({ name: 'decision_maker_role', length: 100, nullable: true, comment: '决策角色' })
  decisionMakerRole: string;

  @Column({ name: 'parent_role', length: 50, nullable: true, comment: '家长身份' })
  parentRole: string;

  @Column({ name: 'location', length: 100, nullable: true, comment: '所在地区' })
  location: string;

  @Column({ name: 'estimated_value', type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '预估成交金额' })
  estimatedValue: number;

  @Column({
    name: 'quality_level',
    type: 'enum',
    enum: ['A', 'B', 'C', 'D'],
    nullable: true,
    comment: 'AI评估质量等级',
  })
  qualityLevel: string;

  @Column({ name: 'ai_profile', type: 'json', nullable: true, comment: 'AI分析的客户画像（需求、痛点、兴趣等）' })
  aiProfile: any;

  @Column({ name: 'last_ai_analysis_time', type: 'datetime', nullable: true, comment: '最后一次AI分析时间' })
  lastAiAnalysisTime: Date;
  // ========== AI分析字段结束 ==========

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
