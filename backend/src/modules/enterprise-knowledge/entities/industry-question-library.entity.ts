import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 行业问题库表
 * 存储行业通用问题(预置+AI生成)
 */
@Entity('industry_question_library')
@Index('idx_industry', ['industryName'])
@Index('idx_active', ['isActive'])
@Index('idx_source_type', ['sourceType'])
export class IndustryQuestionLibrary {
  @PrimaryGeneratedColumn()
  id: number;

  // ==================== 行业分类 ====================
  @Column({
    name: 'industry_name',
    length: 100,
    nullable: false,
    comment: '行业名称:教育|医疗|电商|金融等',
  })
  industryName: string;

  @Column({
    name: 'industry_sub_category',
    length: 100,
    nullable: true,
    comment: '行业细分:K12教育|职业教育等',
  })
  industrySubCategory: string;

  // ==================== 问答内容 ====================
  @Column({
    length: 500,
    nullable: false,
    comment: '常见问题',
  })
  question: string;

  @Column({
    name: 'answer_template',
    type: 'text',
    nullable: true,
    comment: '答案模板(可包含变量)',
  })
  answerTemplate: string;

  // ==================== 分类 ====================
  @Column({
    name: 'scene_category',
    length: 50,
    nullable: true,
    comment: '场景分类',
  })
  sceneCategory: string;

  @Column({
    name: 'question_type',
    length: 50,
    nullable: true,
    comment: '问题类型',
  })
  questionType: string;

  // ==================== 来源 ====================
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: ['system_preset', 'ai_generate'],
    default: 'system_preset',
    comment: '来源类型',
  })
  sourceType: string;

  // ==================== 使用统计 ====================
  @Column({
    name: 'usage_count',
    type: 'int',
    default: 0,
    comment: '被使用次数',
  })
  usageCount: number;

  // ==================== 状态 ====================
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '是否启用',
  })
  isActive: boolean;

  // ==================== 时间字段 ====================
  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;
}
