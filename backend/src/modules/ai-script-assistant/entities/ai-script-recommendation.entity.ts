import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiScriptConversation } from './ai-script-conversation.entity';
import { AiScriptMessage } from './ai-script-message.entity';

@Entity('ai_script_recommendation')
export class AiScriptRecommendation {
  @PrimaryGeneratedColumn({ comment: '推荐ID' })
  id: number;

  @Column({ name: 'conversation_id', comment: '来源对话ID' })
  conversationId: number;

  @Column({ name: 'message_id', comment: '来源消息ID' })
  messageId: number;

  @Column({ type: 'text', name: 'script_content', comment: '话术内容' })
  scriptContent: string;

  @Column({
    type: 'enum',
    enum: ['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'],
    name: 'function_type',
    comment: '功能类型'
  })
  functionType: 'deal_assist' | 'reply_assist' | 'script_polish' | 'opening_lines';

  @Column({ name: 'scenario_id', nullable: true, comment: '场景ID' })
  scenarioId: number | null;

  @Column({ name: 'technique_id', nullable: true, comment: '技巧ID' })
  techniqueId: number | null;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    name: 'ai_quality_score',
    comment: 'AI质量评分'
  })
  aiQualityScore: number;

  @Column({
    type: 'enum',
    enum: ['like', 'dislike', 'neutral'],
    default: 'neutral',
    name: 'user_feedback',
    comment: '用户反馈'
  })
  userFeedback: 'like' | 'dislike' | 'neutral';

  @Column({ type: 'int', default: 0, name: 'usage_count', comment: '使用次数' })
  usageCount: number;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'recommend_reason', comment: '推荐原因' })
  recommendReason: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    name: 'status',
    comment: '审核状态'
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ name: 'approved_by', nullable: true, comment: '审核人' })
  approvedBy: number | null;

  @Column({ name: 'approved_at', nullable: true, comment: '审核时间' })
  approvedAt: Date | null;

  @Column({ name: 'user_id', comment: '推荐用户ID' })
  userId: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联关系
  @ManyToOne(() => AiScriptConversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: AiScriptConversation;

  @ManyToOne(() => AiScriptMessage)
  @JoinColumn({ name: 'message_id' })
  message: AiScriptMessage;
}
