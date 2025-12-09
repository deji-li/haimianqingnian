import { IsString, IsArray, IsOptional, IsObject, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// 生成营销文案DTO
export class GenerateMarketingContentDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  customerId?: number;

  @IsString()
  contentType: string; // 场景类型：moments/wechat/douyin等

  @IsArray()
  @IsOptional()
  selectedPainPoints?: string[];

  @IsArray()
  @IsOptional()
  selectedNeeds?: string[];

  @IsArray()
  @IsOptional()
  selectedInterests?: string[];

  @IsObject()
  configParams: Record<string, any>; // 配置参数（purpose/topic, style, wordCount等）
}

// 提交反馈DTO
export class SubmitFeedbackDto {
  @IsInt()
  @Min(1)
  historyId: number;

  @IsInt()
  @IsOptional()
  rating?: number; // 1-点踩，2-点赞

  @IsString()
  @IsOptional()
  feedbackType?: string;

  @IsString()
  @IsOptional()
  suggestion?: string;
}

// 推荐到文案库DTO
export class RecommendContentDto {
  @IsInt()
  @Min(1)
  historyId: number;

  @IsString()
  recommendReason: string;
}

// 历史记录查询DTO
export class QueryHistoryDto {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  contentType?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  keyword?: string;
}

// 批量删除DTO
export class BatchDeleteDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}

// 添加客户洞察DTO
export class AddCustomerInsightDto {
  @IsInt()
  @IsOptional()
  customerId?: number;

  @IsEnum(['pain_point', 'need', 'interest'])
  insightType: string;

  @IsString()
  content: string;
}
