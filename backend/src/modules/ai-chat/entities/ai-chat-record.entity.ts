import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_chat_records')
export class AiChatRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'user_id', comment: '上传销售ID' })
  userId: number;

  @Column({ name: 'chat_date', type: 'date' })
  chatDate: Date;

  @Column({ name: 'wechat_id', length: 100, nullable: true })
  wechatId: string;

  @Column({ type: 'json', nullable: true, comment: '聊天截图URL数组' })
  images: string[];

  @Column({ name: 'ocr_text', type: 'text', nullable: true })
  ocrText: string;

  @Column({ name: 'ai_analysis_result', type: 'json', nullable: true })
  aiAnalysisResult: any;

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
