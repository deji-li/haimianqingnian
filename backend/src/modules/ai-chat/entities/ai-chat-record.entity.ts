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
import { User } from '../../user/entities/user.entity';

@Entity('ai_chat_records')
export class AiChatRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'user_id', comment: '上传销售ID' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'chat_date', type: 'date' })
  chatDate: Date;

  @Column({ name: 'wechat_id', length: 100, nullable: true })
  wechatId: string;

  @Column({
    name: 'upload_type',
    type: 'enum',
    enum: ['screenshot', 'text', 'file'],
    default: 'screenshot',
    comment: '上传类型：screenshot-截图, text-直接文本, file-文件上传',
  })
  uploadType: string;

  @Column({ type: 'json', nullable: true, comment: '聊天截图URL数组' })
  images: string[];

  @Column({ name: 'raw_text', type: 'text', nullable: true, comment: '原始聊天文本（文本上传时使用）' })
  rawText: string;

  @Column({ name: 'file_path', length: 500, nullable: true, comment: '上传文件路径（文件上传时使用）' })
  filePath: string;

  @Column({ name: 'ocr_text', type: 'text', nullable: true })
  ocrText: string;

  @Column({ name: 'ai_analysis_result', type: 'json', nullable: true })
  aiAnalysisResult: any;

  // AI提取的关键信息
  @Column({ name: 'pain_points', type: 'json', nullable: true, comment: '客户痛点列表' })
  painPoints: string[];

  @Column({ name: 'interest_points', type: 'json', nullable: true, comment: '客户兴趣点列表' })
  interestPoints: string[];

  @Column({ name: 'needs_summary', type: 'text', nullable: true, comment: '需求摘要' })
  needsSummary: string;

  @Column({ name: 'objections', type: 'json', nullable: true, comment: '客户异议点列表' })
  objections: string[];

  // 核心分析字段
  @Column({
    name: 'quality_level',
    type: 'enum',
    enum: ['A', 'B', 'C', 'D'],
    nullable: true,
  })
  qualityLevel: string;

  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: ['无风险', '低', '中', '高'],
    nullable: true,
  })
  riskLevel: string;

  @Column({ name: 'intention_score', type: 'int', nullable: true })
  intentionScore: number;

  @Column({ name: 'estimated_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ name: 'decision_maker_role', length: 50, nullable: true })
  decisionMakerRole: string;

  // 处理状态
  @Column({
    name: 'ocr_status',
    type: 'enum',
    enum: ['待处理', '处理中', '已完成', '失败'],
    default: '待处理',
  })
  ocrStatus: string;

  @Column({
    name: 'analysis_status',
    type: 'enum',
    enum: ['待分析', '分析中', '已完成', '失败'],
    default: '待分析',
  })
  analysisStatus: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
