import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 提交负面反馈DTO
 */
export class SubmitFeedbackDto {
  @ApiProperty({ description: '知识库ID' })
  @IsNumber()
  knowledgeId: number;

  @ApiProperty({ description: '反馈场景', enum: ['ai_chat', 'knowledge_search', 'ai_analysis', 'ai_recommendation'] })
  @IsEnum(['ai_chat', 'knowledge_search', 'ai_analysis', 'ai_recommendation'])
  feedbackScene: string;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ description: '用户问题' })
  @IsString()
  userQuestion: string;

  @ApiProperty({ description: '知识库返回的答案' })
  @IsString()
  knowledgeAnswer: string;

  @ApiProperty({ description: '反馈原因', required: false })
  @IsOptional()
  @IsString()
  feedbackReason?: string;

  @ApiProperty({ description: '对话上下文（完整对话记录）', required: false })
  @IsOptional()
  @IsObject()
  conversationContext?: any;

  @ApiProperty({ description: '用户期望的答案（可选）', required: false })
  @IsOptional()
  @IsString()
  expectedAnswer?: string;
}

/**
 * 查询反馈列表DTO
 */
export class QueryFeedbackDto {
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

  @ApiProperty({ description: '知识库ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  knowledgeId?: number;

  @ApiProperty({ description: '反馈场景', required: false })
  @IsOptional()
  @IsEnum(['ai_chat', 'knowledge_search', 'ai_analysis', 'ai_recommendation'])
  feedbackScene?: string;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customerId?: number;

  @ApiProperty({ description: '是否已处理', required: false })
  @IsOptional()
  handled?: boolean;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}

/**
 * 处理反馈DTO
 */
export class HandleFeedbackDto {
  @ApiProperty({ description: '反馈ID' })
  @IsNumber()
  feedbackId: number;

  @ApiProperty({ description: '处理操作', enum: ['update_knowledge', 'disable_knowledge', 'ignore'] })
  @IsEnum(['update_knowledge', 'disable_knowledge', 'ignore'])
  action: string;

  @ApiProperty({ description: '更新后的答案（当action=update_knowledge时）', required: false })
  @IsOptional()
  @IsString()
  updatedAnswer?: string;

  @ApiProperty({ description: '处理说明', required: false })
  @IsOptional()
  @IsString()
  handlerNote?: string;
}

/**
 * 反馈统计DTO
 */
export class FeedbackStatsDto {
  @ApiProperty({ description: '总反馈数' })
  totalFeedbackCount: number;

  @ApiProperty({ description: 'AI聊天场景反馈数' })
  aiChatFeedbackCount: number;

  @ApiProperty({ description: '知识搜索场景反馈数' })
  knowledgeSearchFeedbackCount: number;

  @ApiProperty({ description: 'AI分析场景反馈数' })
  aiAnalysisFeedbackCount: number;

  @ApiProperty({ description: 'AI推荐场景反馈数' })
  aiRecommendationFeedbackCount: number;

  @ApiProperty({ description: '已处理反馈数' })
  handledFeedbackCount: number;

  @ApiProperty({ description: '待处理反馈数' })
  pendingFeedbackCount: number;

  @ApiProperty({ description: '高负反馈知识条目数（>=3次）' })
  highNegativeFeedbackKnowledgeCount: number;

  @ApiProperty({ description: '自动禁用知识条目数（>=5次）' })
  autoDisabledKnowledgeCount: number;
}

/**
 * 高负反馈知识列表DTO
 */
export class QueryHighNegativeFeedbackDto {
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

  @ApiProperty({ description: '最小负反馈次数', required: false, default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minNegativeFeedbackCount?: number;

  @ApiProperty({ description: '知识状态', required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'auto_disabled'])
  status?: string;
}
