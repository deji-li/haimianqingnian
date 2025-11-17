import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 企业基本信息表
 * 用于首次创建知识库时填写
 */
@Entity('enterprise_basic_info')
export class EnterpriseBasicInfo {
  @PrimaryGeneratedColumn()
  id: number;

  // ==================== 企业基本信息 ====================
  @Column({
    name: 'company_name',
    length: 200,
    nullable: true,
    comment: '企业名称',
  })
  companyName: string;

  @Column({
    length: 100,
    nullable: true,
    comment: '所属行业',
  })
  industry: string;

  @Column({
    name: 'company_intro',
    type: 'text',
    nullable: true,
    comment: '企业介绍',
  })
  companyIntro: string;

  @Column({
    name: 'founding_year',
    type: 'int',
    nullable: true,
    comment: '成立年份',
  })
  foundingYear: number;

  @Column({
    name: 'company_scale',
    length: 50,
    nullable: true,
    comment: '公司规模',
  })
  companyScale: string;

  // ==================== 联系方式 ====================
  @Column({
    name: 'contact_info',
    type: 'json',
    nullable: true,
    comment: '联系方式(电话、地址、官网等)',
  })
  contactInfo: any;

  // ==================== 企业优势 ====================
  @Column({
    name: 'core_advantages',
    type: 'text',
    nullable: true,
    comment: '核心优势',
  })
  coreAdvantages: string;

  @Column({
    name: 'success_cases',
    type: 'text',
    nullable: true,
    comment: '成功案例',
  })
  successCases: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: '资质证书列表',
  })
  certifications: any[];

  // ==================== 行业知识 ====================
  @Column({
    name: 'industry_knowledge',
    type: 'text',
    nullable: true,
    comment: '行业知识/趋势',
  })
  industryKnowledge: string;

  @Column({
    name: 'competitor_analysis',
    type: 'text',
    nullable: true,
    comment: '竞品分析',
  })
  competitorAnalysis: string;

  // ==================== 常见FAQ ====================
  @Column({
    name: 'customer_faq',
    type: 'json',
    nullable: true,
    comment: '客户常见问答列表[{q,a}]',
  })
  customerFaq: Array<{ question: string; answer: string }>;

  // ==================== 录入方式记录 ====================
  @Column({
    name: 'input_method',
    type: 'enum',
    enum: ['manual', 'file_upload', 'ai_generate'],
    nullable: true,
    comment: '录入方式',
  })
  inputMethod: string;

  // ==================== 状态 ====================
  @Column({
    name: 'is_completed',
    type: 'boolean',
    default: false,
    comment: '是否完成首次创建',
  })
  isCompleted: boolean;

  @Column({
    name: 'completion_step',
    type: 'int',
    default: 0,
    comment: '完成到第几步(1-4)',
  })
  completionStep: number;

  // ==================== 时间字段 ====================
  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
