import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * AI挖掘待审核表
 */
@Entity('knowledge_pending_review')
@Index('idx_review_status', ['reviewStatus'])
@Index('idx_ai_score', ['aiScore'])
@Index('idx_mining_batch', ['miningBatchId'])
@Index('idx_source_type', ['sourceType'])
export class KnowledgePendingReview {
  @PrimaryGeneratedColumn()
  id: number;

  // ==================== 挖掘的问答 ====================
  @Column({ length: 500, nullable: false, comment: '挖掘的问题' })
  question: string;

  @Column({ type: 'text', nullable: false, comment: '挖掘的答案' })
  answer: string;

  @Column({ length: 500, nullable: true, comment: 'AI提取的关键词' })
  keywords: string;

  // ==================== 4维度分类(AI自动分类) ====================
  @Column({
    name: 'scene_category',
    length: 50,
    nullable: true,
    comment: '场景分类',
  })
  sceneCategory: string;

  @Column({
    name: 'product_category',
    length: 50,
    nullable: true,
    comment: '产品分类',
  })
  productCategory: string;

  @Column({
    name: 'customer_type',
    length: 50,
    nullable: true,
    comment: '客户类型',
  })
  customerType: string;

  @Column({
    name: 'question_type',
    length: 50,
    nullable: true,
    comment: '问题类型',
  })
  questionType: string;

  // ==================== AI评分 ====================
  @Column({
    name: 'ai_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'AI质量评分(0-100)',
  })
  aiScore: number;

  @Column({
    name: 'confidence_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'AI置信度(0-100)',
  })
  confidenceScore: number;

  // ==================== 来源信息 ====================
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: ['chat_mining', 'industry_recommend'],
    nullable: true,
    comment: '来源类型',
  })
  sourceType: string;

  @Column({
    name: 'source_chat_record_id',
    type: 'int',
    nullable: true,
    comment: '来源聊天记录ID',
  })
  sourceChatRecordId: number;

  @Column({
    name: 'mining_reason',
    type: 'text',
    nullable: true,
    comment: '挖掘理由(AI说明为什么推荐这个)',
  })
  miningReason: string;

  // ==================== 审核状态 ====================
  @Column({
    name: 'review_status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'auto_approved'],
    default: 'pending',
    comment: '审核状态',
  })
  reviewStatus: string;

  @Column({
    name: 'reviewer_id',
    type: 'int',
    nullable: true,
    comment: '审核人ID',
  })
  reviewerId: number;

  @Column({
    name: 'review_time',
    type: 'datetime',
    nullable: true,
    comment: '审核时间',
  })
  reviewTime: Date;

  @Column({
    name: 'review_comment',
    length: 500,
    nullable: true,
    comment: '审核意见',
  })
  reviewComment: string;

  // ==================== 批次信息(用于定时任务挖掘) ====================
  @Column({
    name: 'mining_batch_id',
    length: 50,
    nullable: true,
    comment: '挖掘批次ID',
  })
  miningBatchId: string;

  @Column({
    name: 'mining_time',
    type: 'datetime',
    nullable: true,
    comment: '挖掘时间',
  })
  miningTime: Date;

  // ==================== 时间字段 ====================
  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;
}
