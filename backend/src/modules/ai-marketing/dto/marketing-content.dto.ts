import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMarketingContentDto {
  @ApiProperty({ description: '文案类型' })
  @IsNotEmpty()
  @IsString()
  contentType: string;

  @ApiProperty({ description: '文案标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '文案内容' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '关联的痛点', required: false })
  @IsOptional()
  @IsArray()
  painPoints?: string[];

  @ApiProperty({ description: '关联的兴趣点', required: false })
  @IsOptional()
  @IsArray()
  interestPoints?: string[];

  @ApiProperty({ description: '生成参数', required: false })
  @IsOptional()
  generationParams?: Record<string, any>;

  @ApiProperty({ description: '发圈目的', required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ description: '风格', required: false })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiProperty({ description: '字数要求', required: false })
  @IsOptional()
  @IsString()
  wordCount?: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: '自定义分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateMarketingContentDto {
  @ApiProperty({ description: '文案标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '文案内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: '自定义分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class QueryMarketingContentDto {
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

  @ApiProperty({ description: '文案类型', required: false })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiProperty({ description: '是否收藏', required: false })
  @IsOptional()
  @Type(() => Number)
  isFavorite?: number;

  @ApiProperty({ description: '自定义分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class RecordUsageDto {
  @ApiProperty({ description: '使用渠道', required: false })
  @IsOptional()
  @IsString()
  usageChannel?: string;

  @ApiProperty({ description: '使用效果', required: false })
  @IsOptional()
  @IsString()
  usageResult?: string;

  @ApiProperty({ description: '关联客户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiProperty({ description: '使用备注', required: false })
  @IsOptional()
  @IsString()
  usageRemark?: string;
}
