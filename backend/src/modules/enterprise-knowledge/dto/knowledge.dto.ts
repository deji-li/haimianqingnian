import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 创建知识库DTO
 */
export class CreateKnowledgeDto {
  @ApiProperty({ description: '知识标题/问题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '知识内容/答案' })
  @IsString()
  content: string;

  @ApiProperty({ description: '关键词(逗号分隔)', required: false })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiProperty({ description: '场景分类', required: false })
  @IsOptional()
  @IsString()
  sceneCategory?: string;

  @ApiProperty({ description: '产品分类', required: false })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiProperty({ description: '客户类型', required: false })
  @IsOptional()
  @IsString()
  customerType?: string;

  @ApiProperty({ description: '问题类型', required: false })
  @IsOptional()
  @IsString()
  questionType?: string;

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ description: '来源类型', required: false })
  @IsOptional()
  @IsEnum(['manual', 'ai_mining', 'industry_recommend', 'file_import'])
  sourceType?: string;

  @ApiProperty({ description: '来源ID', required: false })
  @IsOptional()
  @IsNumber()
  sourceId?: number;
}

/**
 * 更新知识库DTO
 */
export class UpdateKnowledgeDto {
  @ApiProperty({ description: '知识标题/问题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '知识内容/答案', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '关键词', required: false })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiProperty({ description: '场景分类', required: false })
  @IsOptional()
  @IsString()
  sceneCategory?: string;

  @ApiProperty({ description: '产品分类', required: false })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiProperty({ description: '客户类型', required: false })
  @IsOptional()
  @IsString()
  customerType?: string;

  @ApiProperty({ description: '问题类型', required: false })
  @IsOptional()
  @IsString()
  questionType?: string;

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'pending_review', 'auto_disabled'])
  status?: string;
}

/**
 * 查询知识库DTO
 */
export class QueryKnowledgeDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: '场景分类', required: false })
  @IsOptional()
  @IsString()
  sceneCategory?: string;

  @ApiProperty({ description: '产品分类', required: false })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiProperty({ description: '客户类型', required: false })
  @IsOptional()
  @IsString()
  customerType?: string;

  @ApiProperty({ description: '问题类型', required: false })
  @IsOptional()
  @IsString()
  questionType?: string;

  @ApiProperty({ description: '关键词搜索', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'pending_review', 'auto_disabled'])
  status?: string;

  @ApiProperty({ description: '来源类型', required: false })
  @IsOptional()
  @IsEnum(['manual', 'ai_mining', 'industry_recommend', 'file_import'])
  sourceType?: string;
}

/**
 * 智能搜索DTO
 */
export class IntelligentSearchDto {
  @ApiProperty({ description: '搜索问题' })
  @IsString()
  question: string;

  @ApiProperty({ description: '上下文信息', required: false })
  @IsOptional()
  context?: {
    customerId?: number;
    sceneCategory?: string;
    productCategory?: string;
  };

  @ApiProperty({ description: '返回数量', required: false, default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}

/**
 * 批量导入DTO
 */
export class BatchImportKnowledgeDto {
  @ApiProperty({ description: '知识列表', type: [CreateKnowledgeDto] })
  @IsArray()
  knowledgeList: CreateKnowledgeDto[];
}
