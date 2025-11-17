import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 步骤1: 企业基础信息DTO
 */
export class CreateBasicInfoDto {
  @ApiProperty({ description: '企业名称' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: '所属行业' })
  @IsString()
  industry: string;

  @ApiProperty({ description: '企业简介', required: false })
  @IsOptional()
  @IsString()
  companyDescription?: string;

  @ApiProperty({ description: '主营业务', required: false })
  @IsOptional()
  @IsString()
  mainBusiness?: string;

  @ApiProperty({ description: '企业优势', required: false })
  @IsOptional()
  @IsString()
  advantages?: string;

  @ApiProperty({ description: '产品/服务列表', required: false })
  @IsOptional()
  @IsString()
  productServices?: string;

  @ApiProperty({ description: '目标客户群', required: false })
  @IsOptional()
  @IsString()
  targetCustomers?: string;

  @ApiProperty({ description: '联系方式', required: false })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @ApiProperty({ description: '输入方式', enum: ['manual', 'file_upload', 'ai_generate'] })
  @IsEnum(['manual', 'file_upload', 'ai_generate'])
  inputMethod: string;

  @ApiProperty({ description: '文件URL（当inputMethod=file_upload时）', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ description: 'AI提示词（当inputMethod=ai_generate时）', required: false })
  @IsOptional()
  @IsString()
  aiPrompt?: string;
}

/**
 * FAQ条目
 */
export class FaqItemDto {
  @ApiProperty({ description: '问题' })
  @IsString()
  question: string;

  @ApiProperty({ description: '答案' })
  @IsString()
  answer: string;

  @ApiProperty({ description: '分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

/**
 * 步骤2: FAQ列表DTO
 */
export class CreateFaqDto {
  @ApiProperty({ description: 'FAQ列表', type: [FaqItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqList: FaqItemDto[];

  @ApiProperty({ description: '是否跳过此步骤', required: false })
  @IsOptional()
  skip?: boolean;
}

/**
 * 步骤3: 微信聊天记录挖掘DTO
 */
export class MiningChatDto {
  @ApiProperty({ description: '挖掘时间范围-开始日期', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: '挖掘时间范围-结束日期', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ description: '客户ID列表（指定客户）', required: false })
  @IsOptional()
  @IsArray()
  customerIds?: number[];

  @ApiProperty({ description: '最小对话轮次（过滤短对话）', required: false })
  @IsOptional()
  @IsNumber()
  minRounds?: number;

  @ApiProperty({ description: '是否跳过此步骤', required: false })
  @IsOptional()
  skip?: boolean;
}

/**
 * 步骤4: 生成与整合DTO
 */
export class GenerateKnowledgeDto {
  @ApiProperty({ description: '是否启用AI分类', required: false })
  @IsOptional()
  enableAiClassification?: boolean;

  @ApiProperty({ description: '是否自动生成行业问题', required: false })
  @IsOptional()
  enableIndustryQuestions?: boolean;

  @ApiProperty({ description: '行业问题数量', required: false })
  @IsOptional()
  @IsNumber()
  industryQuestionCount?: number;
}

/**
 * 产品知识库DTO（深度配置-可选）
 */
export class ProductKnowledgeDto {
  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '产品分类' })
  @IsString()
  productCategory: string;

  @ApiProperty({ description: '产品描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '产品特点', required: false })
  @IsOptional()
  @IsString()
  features?: string;

  @ApiProperty({ description: '适用场景', required: false })
  @IsOptional()
  @IsString()
  usageScenarios?: string;

  @ApiProperty({ description: '价格信息', required: false })
  @IsOptional()
  @IsString()
  pricing?: string;

  @ApiProperty({ description: '常见问题', type: [FaqItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs?: FaqItemDto[];
}

/**
 * 初始化状态响应DTO
 */
export class InitStatusDto {
  @ApiProperty({ description: '当前步骤', enum: [0, 1, 2, 3, 4] })
  currentStep: number;

  @ApiProperty({ description: '步骤1是否完成' })
  step1Completed: boolean;

  @ApiProperty({ description: '步骤2是否完成' })
  step2Completed: boolean;

  @ApiProperty({ description: '步骤3是否完成' })
  step3Completed: boolean;

  @ApiProperty({ description: '步骤4是否完成' })
  step4Completed: boolean;

  @ApiProperty({ description: '企业基础信息', required: false })
  basicInfo?: any;

  @ApiProperty({ description: '已创建知识条目数量' })
  knowledgeCount: number;

  @ApiProperty({ description: '待审核条目数量' })
  pendingReviewCount: number;
}
