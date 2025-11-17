import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 查询行业问题库DTO
 */
export class QueryIndustryQuestionDto {
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

  @ApiProperty({ description: '行业', required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ description: '分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '重要程度', required: false, enum: ['high', 'medium', 'low'] })
  @IsOptional()
  @IsEnum(['high', 'medium', 'low'])
  importance?: string;

  @ApiProperty({ description: '关键词搜索', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;
}

/**
 * AI生成行业问题DTO
 */
export class GenerateIndustryQuestionDto {
  @ApiProperty({ description: '行业名称' })
  @IsString()
  industry: string;

  @ApiProperty({ description: '生成数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number = 10;

  @ApiProperty({ description: '特定场景（可选）', required: false })
  @IsOptional()
  @IsString()
  specificScenario?: string;

  @ApiProperty({ description: '目标客户类型（可选）', required: false })
  @IsOptional()
  @IsString()
  targetCustomerType?: string;
}

/**
 * 采纳行业问题DTO
 */
export class AdoptIndustryQuestionDto {
  @ApiProperty({ description: '行业问题ID' })
  @IsNumber()
  questionId: number;

  @ApiProperty({ description: '是否编辑后采纳', required: false })
  @IsOptional()
  editBeforeAdopt?: boolean;

  @ApiProperty({ description: '编辑后的问题（如果editBeforeAdopt=true）', required: false })
  @IsOptional()
  @IsString()
  editedQuestion?: string;

  @ApiProperty({ description: '编辑后的答案（如果editBeforeAdopt=true）', required: false })
  @IsOptional()
  @IsString()
  editedAnswer?: string;

  @ApiProperty({ description: '场景分类（可选覆盖）', required: false })
  @IsOptional()
  @IsString()
  sceneCategory?: string;

  @ApiProperty({ description: '产品分类（可选覆盖）', required: false })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiProperty({ description: '优先级（可选设置）', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;
}

/**
 * 批量采纳行业问题DTO
 */
export class BatchAdoptIndustryQuestionDto {
  @ApiProperty({ description: '行业问题ID列表' })
  @IsArray()
  questionIds: number[];
}

/**
 * 行业问题统计DTO
 */
export class IndustryQuestionStatsDto {
  @ApiProperty({ description: '总行业问题数' })
  totalQuestions: number;

  @ApiProperty({ description: '已采纳数量' })
  adoptedCount: number;

  @ApiProperty({ description: '按行业分组统计' })
  byIndustry: {
    industry: string;
    count: number;
    adoptedCount: number;
  }[];

  @ApiProperty({ description: '按重要程度分组统计' })
  byImportance: {
    importance: string;
    count: number;
  }[];
}
