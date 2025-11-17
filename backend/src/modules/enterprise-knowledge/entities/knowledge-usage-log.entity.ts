import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';

/**
 * 知识库AI调用日志表
 */
@Entity('knowledge_usage_log')
@Index('idx_user_id', ['userId'])
@Index('idx_customer_id', ['customerId'])
@Index('idx_create_time', ['createTime'])
@Index('idx_usage_scene', ['usageScene'])
export class KnowledgeUsageLog {
  @PrimaryGeneratedColumn()
  id: number;

  // ==================== 查询信息 ====================
  @Column({ name: 'user_id', nullable: false, comment: '使用者ID' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'customer_id', type: 'int', nullable: true, comment: '关联客户ID' })
  customerId: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    name: 'query_text',
    length: 500,
    nullable: false,
    comment: '查询问题',
  })
  queryText: string;

  // ==================== 知识库结果 ====================
  @Column({
    name: 'matched_knowledge_ids',
    type: 'json',
    nullable: true,
    comment: '匹配到的知识库ID列表',
  })
  matchedKnowledgeIds: number[];

  @Column({
    name: 'knowledge_scores',
    type: 'json',
    nullable: true,
    comment: '各知识库的评分',
  })
  knowledgeScores: Array<{ id: number; score: number; reason: string }>;

  // ==================== AI决策 ====================
  @Column({
    name: 'ai_decision',
    type: 'enum',
    enum: ['use_knowledge', 'use_ai_generate', 'hybrid'],
    nullable: true,
    comment: 'AI决策结果',
  })
  aiDecision: string;

  @Column({
    name: 'ai_decision_reason',
    type: 'text',
    nullable: true,
    comment: 'AI决策理由',
  })
  aiDecisionReason: string;

  // ==================== 最终输出 ====================
  @Column({
    name: 'final_answer',
    type: 'text',
    nullable: true,
    comment: '最终输出的答案',
  })
  finalAnswer: string;

  // ==================== 使用场景 ====================
  @Column({
    name: 'usage_scene',
    length: 100,
    nullable: true,
    comment: '使用场景',
  })
  usageScene: string;

  // ==================== 反馈 ====================
  @Column({
    name: 'feedback_id',
    type: 'int',
    nullable: true,
    comment: '关联的反馈ID(如果有)',
  })
  feedbackId: number;

  // ==================== 时间字段 ====================
  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;
}
