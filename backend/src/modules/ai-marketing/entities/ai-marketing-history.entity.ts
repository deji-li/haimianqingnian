import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('ai_marketing_history')
export class AiMarketingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ name: 'customer_id', nullable: true, comment: '客户ID' })
  customerId: number;

  @Column({ name: 'content_type', length: 50, comment: '场景类型' })
  contentType: string;

  @Column({
    name: 'selected_pain_points',
    type: 'json',
    nullable: true,
    comment: '选中的痛点',
  })
  selectedPainPoints: string[];

  @Column({
    name: 'selected_needs',
    type: 'json',
    nullable: true,
    comment: '选中的需求',
  })
  selectedNeeds: string[];

  @Column({
    name: 'selected_interests',
    type: 'json',
    nullable: true,
    comment: '选中的兴趣点',
  })
  selectedInterests: string[];

  @Column({
    name: 'config_params',
    type: 'json',
    nullable: true,
    comment: '配置参数',
  })
  configParams: Record<string, any>;

  @Column({ name: 'generated_content', type: 'text', nullable: true, comment: '生成的文案' })
  generatedContent: string;

  @Column({ name: 'quality_score', type: 'decimal', precision: 3, scale: 2, nullable: true, comment: '质量评分' })
  qualityScore: number;

  @Column({
    name: 'customer_insights',
    type: 'json',
    nullable: true,
    comment: '客户洞察数据',
  })
  customerInsights: any;

  @Column({
    name: 'knowledge_used',
    type: 'json',
    nullable: true,
    comment: '使用的知识库内容',
  })
  knowledgeUsed: any[];

  @Column({
    name: 'generation_mode',
    type: 'enum',
    enum: ['knowledge_ai', 'pure_ai'],
    default: 'knowledge_ai',
    comment: '生成模式',
  })
  generationMode: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否有效' })
  isActive: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
