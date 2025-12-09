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
import { CustomerFollowRecord } from './customer-follow-record.entity';
import { User } from '../../user/entities/user.entity';
import { Department } from '../../system/entities/department.entity';
import { Campus } from '../../system/entities/campus.entity';

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

  @Column({ length: 10, nullable: true, comment: '性别' })
  gender: string;

  @Column({ type: 'int', nullable: true, comment: '年龄' })
  age: number;

  @Column({ length: 255, nullable: true, comment: '地址' })
  address: string;

  @Column({ name: 'intent_product', length: 100, nullable: true, comment: '意向产品' })
  intentProduct: string;

  @Column({ length: 100, nullable: true, comment: '客户来源' })
  source: string;

  @Column({ type: 'json', nullable: true, comment: '客户标签' })
  tags: string[];

  @Column({ name: 'estimated_amount', type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '预计成交金额' })
  estimatedAmount: number;

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

  @Column({ name: 'department_id', nullable: true, comment: '部门ID' })
  departmentId: number;

  @Column({ name: 'campus_id', nullable: true, comment: '校区ID' })
  campusId: number;

  @Column({ name: 'sales_wechat', length: 100, nullable: true })
  salesWechat: string;

  @Column({
    name: 'customer_intent',
    type: 'enum',
    enum: ['高意向', '中意向', '低意向', '无意向'],
    default: '中意向',
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

  @Column({ name: 'pain_points', type: 'json', nullable: true, comment: '客户痛点（从所有聊天记录中聚合提取）' })
  painPoints: string[];

  @Column({ name: 'interest_points', type: 'json', nullable: true, comment: '客户兴趣点（从所有聊天记录中聚合提取）' })
  interestPoints: string[];

  @Column({ name: 'need_keywords', type: 'json', nullable: true, comment: '需求关键词列表' })
  needKeywords: string[];

  @Column({ name: 'last_ai_analysis_time', type: 'datetime', nullable: true, comment: '最后一次AI分析时间' })
  lastAiAnalysisTime: Date;

  @Column({
    name: 'ai_processing_status',
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    nullable: true,
    comment: 'AI识别处理状态：pending-待处理，processing-识别中，completed-已完成，failed-失败'
  })
  aiProcessingStatus: string;

  @Column({ name: 'ai_processing_error', type: 'text', nullable: true, comment: 'AI识别失败原因' })
  aiProcessingError: string;
  // ========== AI分析字段结束 ==========

  // ========== 订单同步字段 ==========
  @Column({ name: 'external_order_ids', type: 'json', nullable: true, comment: '关联的外部订单ID列表，如["20227343","20228888"]' })
  externalOrderIds: string[];
  // ========== 订单同步字段结束 ==========

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  // ========== 软删除字段 ==========
  @Column({ name: 'is_deleted', type: 'tinyint', default: 0, comment: '是否删除: 0-未删除, 1-已删除' })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true, comment: '删除时间' })
  deletedAt: Date;

  @Column({ name: 'deleted_reason', type: 'varchar', length: 255, nullable: true, comment: '删除原因' })
  deletedReason: string;

  @Column({ name: 'deleted_by', type: 'int', nullable: true, comment: '删除人ID' })
  deletedBy: number;
  // ========== 软删除字段结束 ==========

  // ========== 企业微信集成字段 ==========
  @Column({ name: 'wework_external_userid', type: 'varchar', length: 64, nullable: true, comment: '企业微信外部联系人ID', unique: true })
  weworkExternalUserId: string;

  @Column({ name: 'wework_follow_userid', type: 'varchar', length: 64, nullable: true, comment: '企业微信跟进成员userid' })
  weworkFollowUserid: string;

  @Column({ name: 'wework_tags', type: 'json', nullable: true, comment: '企业微信客户标签' })
  weworkTags: string[];

  @Column({ name: 'wework_sync_time', type: 'datetime', nullable: true, comment: '企业微信数据同步时间' })
  weworkSyncTime: Date;

  @Column({ name: 'wework_chat_count', type: 'int', default: 0, comment: '企业微信聊天记录数量' })
  weworkChatCount: number;

  @Column({ name: 'wework_last_chat_time', type: 'datetime', nullable: true, comment: '最后企业微信聊天时间' })
  weworkLastChatTime: Date;
  // ========== 企业微信集成字段结束 ==========

  // 关联跟进记录
  @OneToMany(() => CustomerFollowRecord, (record) => record.customer)
  followRecords: CustomerFollowRecord[];

  // 关联销售
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sales_id' })
  sales?: User;

  // 关联部门
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  // 关联校区
  @ManyToOne(() => Campus, { nullable: true })
  @JoinColumn({ name: 'campus_id' })
  campus?: Campus;

  // 关联删除人
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedByUser?: User;

  // 虚拟字段（从��联表查询）
  operatorName?: string;
  salesName?: string;
  followRecordCount?: number;
}
