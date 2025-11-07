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

// AI话术库
@Entity('ai_scripts')
export class AiScript {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'script_type', length: 50 })
  scriptType: string;

  @Column({ length: 100, nullable: true })
  scenario: string;

  @Column({ name: 'customer_profile', length: 255, nullable: true })
  customerProfile: string;

  @Column({ name: 'script_title', length: 200 })
  scriptTitle: string;

  @Column({ name: 'script_content', type: 'text' })
  scriptContent: string;

  @Column({ type: 'enum', enum: ['AI生成', '优秀案例', '人工编写'], default: 'AI生成' })
  source: string;

  @Column({ name: 'source_user_id', nullable: true })
  sourceUserId: number;

  @Column({ name: 'effectiveness_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  effectivenessScore: number;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}

// AI风险预警
@Entity('ai_risk_alerts')
export class AiRiskAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'risk_type', length: 50 })
  riskType: string;

  @Column({ name: 'risk_level', type: 'enum', enum: ['低', '中', '高'], default: '中' })
  riskLevel: string;

  @Column({ name: 'risk_score', type: 'int', nullable: true })
  riskScore: number;

  @Column({ name: 'risk_reason', type: 'text', nullable: true })
  riskReason: string;

  @Column({ name: 'recommended_actions', type: 'json', nullable: true })
  recommendedActions: string[];

  @Column({ name: 'from_chat_record_id', nullable: true })
  fromChatRecordId: number;

  @Column({ type: 'enum', enum: ['待处理', '处理中', '已解决', '已忽略'], default: '待处理' })
  status: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: number;

  @Column({ name: 'handler_id', nullable: true })
  handlerId: number;

  @Column({ name: 'handle_result', type: 'text', nullable: true })
  handleResult: string;

  @Column({ name: 'handle_time', type: 'datetime', nullable: true })
  handleTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}

// AI培训记录
@Entity('ai_training_records')
export class AiTrainingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'training_type', length: 50, default: '对话陪练' })
  trainingType: string;

  @Column({ length: 100, nullable: true })
  scenario: string;

  @Column({ name: 'customer_role', length: 100, nullable: true })
  customerRole: string;

  @Column({ type: 'json', nullable: true })
  conversation: any[];

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ name: 'round_count', type: 'int', nullable: true })
  roundCount: number;

  @Column({ name: 'ai_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  aiScore: number;

  @Column({ name: 'communication_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  communicationScore: number;

  @Column({ name: 'response_speed_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  responseSpeedScore: number;

  @Column({ name: 'objection_handling_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  objectionHandlingScore: number;

  @Column({ name: 'ai_feedback', type: 'text', nullable: true })
  aiFeedback: string;

  @Column({ name: 'training_result', type: 'enum', enum: ['优秀', '良好', '及格', '不及格'], nullable: true })
  trainingResult: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}

// AI诊断报告
@Entity('ai_reports')
export class AiReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'report_type', length: 50 })
  reportType: string; // 周报/月报/季度报告

  @Column({ name: 'report_period', length: 50 })
  reportPeriod: string; // 2025-W01/2025-01/2025-Q1

  @Column({ name: 'target_type', length: 50, nullable: true })
  targetType: string; // 个人/团队/全公司

  @Column({ name: 'target_id', nullable: true })
  targetId: number;

  @Column({ name: 'report_data', type: 'json', nullable: true })
  reportData: any; // 报告数据（结构化）

  @Column({ name: 'key_metrics', type: 'json', nullable: true })
  keyMetrics: any; // 关键指标

  @Column({ name: 'ai_insights', type: 'json', nullable: true })
  aiInsights: string[]; // AI洞察发现

  @Column({ type: 'json', nullable: true })
  problems: string[]; // 问题诊断

  @Column({ type: 'json', nullable: true })
  recommendations: string[]; // 改进建议

  @Column({
    type: 'enum',
    enum: ['生成中', '已完成', '失败'],
    default: '生成中',
  })
  status: string;

  @Column({ name: 'generate_time', type: 'datetime', nullable: true })
  generateTime: Date;

  @Column({ length: 50, default: 'AI自动生成' })
  generator: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
