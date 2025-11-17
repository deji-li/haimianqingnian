import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EnterpriseKnowledgeBase } from './enterprise-knowledge-base.entity';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';

/**
 * 知识库负反馈表
 */
@Entity('knowledge_feedback')
@Index('idx_knowledge_id', ['knowledgeId'])
@Index('idx_user_id', ['userId'])
@Index('idx_feedback_scene', ['feedbackScene'])
@Index('idx_handled', ['handled'])
@Index('idx_feedback_type', ['feedbackType'])
export class KnowledgeFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  // ==================== 关联信息 ====================
  @Column({ name: 'knowledge_id', nullable: false, comment: '知识库ID' })
  knowledgeId: number;

  @ManyToOne(() => EnterpriseKnowledgeBase)
  @JoinColumn({ name: 'knowledge_id' })
  knowledge: EnterpriseKnowledgeBase;

  @Column({ name: 'user_id', nullable: false, comment: '反馈用户ID' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'customer_id', type: 'int', nullable: true, comment: '关联客户ID' })
  customerId: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // ==================== 反馈场景 ====================
  @Column({
    name: 'feedback_scene',
    type: 'enum',
    enum: ['ai_chat', 'knowledge_search', 'ai_analysis', 'ai_recommendation'],
    nullable: true,
    comment: '反馈场景',
  })
  feedbackScene: string;

  @Column({
    name: 'function_name',
    length: 100,
    nullable: true,
    comment: '具体功能名称',
  })
  functionName: string;

  @Column({
    name: 'conversation_topic',
    length: 200,
    nullable: true,
    comment: '对话主题',
  })
  conversationTopic: string;

  // ==================== 反馈内容 ====================
  @Column({
    name: 'feedback_type',
    type: 'enum',
    enum: ['positive', 'negative'],
    default: 'negative',
    comment: '反馈类型',
  })
  feedbackType: string;

  @Column({
    name: 'feedback_reason',
    length: 500,
    nullable: true,
    comment: '反馈原因',
  })
  feedbackReason: string;

  @Column({
    name: 'feedback_detail',
    type: 'text',
    nullable: true,
    comment: '详细反馈内容',
  })
  feedbackDetail: string;

  // ==================== 上下文信息 ====================
  @Column({
    name: 'conversation_context',
    type: 'json',
    nullable: true,
    comment: '完整对话上下文',
  })
  conversationContext: any;

  // ==================== AI分析 ====================
  @Column({
    name: 'ai_analysis',
    type: 'text',
    nullable: true,
    comment: 'AI对该反馈的分析',
  })
  aiAnalysis: string;

  @Column({
    name: 'optimization_suggestion',
    type: 'text',
    nullable: true,
    comment: 'AI生成的优化建议',
  })
  optimizationSuggestion: string;

  // ==================== 处理状态 ====================
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已处理',
  })
  handled: boolean;

  @Column({
    name: 'handler_id',
    type: 'int',
    nullable: true,
    comment: '处理人ID',
  })
  handlerId: number;

  @Column({
    name: 'handle_time',
    type: 'datetime',
    nullable: true,
    comment: '处理时间',
  })
  handleTime: Date;

  @Column({
    name: 'handle_result',
    length: 500,
    nullable: true,
    comment: '处理结果',
  })
  handleResult: string;

  // ==================== 时间字段 ====================
  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;
}
