import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 企业知识库主表
 */
@Entity('enterprise_knowledge_base')
@Index('idx_scene_category', ['sceneCategory'])
@Index('idx_product_category', ['productCategory'])
@Index('idx_customer_type', ['customerType'])
@Index('idx_question_type', ['questionType'])
@Index('idx_status', ['status'])
@Index('idx_source_type', ['sourceType'])
export class EnterpriseKnowledgeBase {
  @PrimaryGeneratedColumn()
  id: number;

  // ==================== 基本信息 ====================
  @Column({ length: 200, nullable: false, comment: '知识标题/问题' })
  title: string;

  @Column({ type: 'text', nullable: false, comment: '知识内容/答案' })
  content: string;

  @Column({ length: 500, nullable: true, comment: '关键词(逗号分隔)' })
  keywords: string;

  @Column({ length: 500, nullable: true, comment: 'AI生成的摘要' })
  summary: string;

  // ==================== 4维度分类 ====================
  @Column({
    name: 'scene_category',
    length: 50,
    nullable: true,
    comment: '场景分类:首次沟通|产品介绍|价格咨询|异议处理|售后服务|其他',
  })
  sceneCategory: string;

  @Column({
    name: 'product_category',
    length: 50,
    nullable: true,
    comment: '产品分类:产品ID或分类名',
  })
  productCategory: string;

  @Column({
    name: 'customer_type',
    length: 50,
    nullable: true,
    comment: '客户类型:新客|老客|高意向|中意向|低意向',
  })
  customerType: string;

  @Column({
    name: 'question_type',
    length: 50,
    nullable: true,
    comment: '问题类型:产品问题|价格问题|服务问题|效果问题|师资问题|其他',
  })
  questionType: string;

  // ==================== AI相关 ====================
  @Column({
    name: 'relevance_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'AI相关度评分(0-100)',
  })
  relevanceScore: number;

  @Column({
    name: 'quality_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '内容质量评分(0-100)',
  })
  qualityScore: number;

  // ==================== 使用统计 ====================
  @Column({
    name: 'usage_count',
    type: 'int',
    default: 0,
    comment: '使用次数',
  })
  usageCount: number;

  @Column({
    name: 'positive_feedback_count',
    type: 'int',
    default: 0,
    comment: '正反馈次数',
  })
  positiveFeedbackCount: number;

  @Column({
    name: 'negative_feedback_count',
    type: 'int',
    default: 0,
    comment: '负反馈次数',
  })
  negativeFeedbackCount: number;

  @Column({
    name: 'last_used_time',
    type: 'datetime',
    nullable: true,
    comment: '最后使用时间',
  })
  lastUsedTime: Date;

  // ==================== 来源信息 ====================
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: ['manual', 'ai_mining', 'industry_recommend', 'file_import'],
    default: 'manual',
    comment: '来源类型',
  })
  sourceType: string;

  @Column({
    name: 'source_id',
    type: 'int',
    nullable: true,
    comment: '来源记录ID(如chat_record_id)',
  })
  sourceId: number;

  @Column({
    name: 'creator_id',
    type: 'int',
    nullable: true,
    comment: '创建人ID',
  })
  creatorId: number;

  // ==================== 状态管理 ====================
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'pending_review', 'auto_disabled'],
    default: 'active',
    comment: '状态',
  })
  status: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '优先级(0-100)',
  })
  priority: number;

  // ==================== 关联产品 ====================
  @Column({
    name: 'related_product_ids',
    type: 'json',
    nullable: true,
    comment: '关联的产品ID列表',
  })
  relatedProductIds: number[];

  // ==================== 时间字段 ====================
  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
