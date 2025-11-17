import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 手动触发挖掘DTO
 */
export class TriggerMiningDto {
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

  @ApiProperty({ description: '最小对话轮次（过滤短对话）', required: false, default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minRounds?: number;

  @ApiProperty({ description: '最大挖掘数量', required: false, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  maxCount?: number;
}

/**
 * 查询待审核列表DTO
 */
export class QueryPendingReviewDto {
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

  @ApiProperty({ description: '审核状态', required: false })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'auto_approved'])
  reviewStatus?: string;

  @ApiProperty({ description: '来源类型', required: false })
  @IsOptional()
  @IsEnum(['ai_mining', 'user_submit', 'feedback_optimization'])
  sourceType?: string;

  @ApiProperty({ description: '场景分类', required: false })
  @IsOptional()
  @IsString()
  sceneCategory?: string;

  @ApiProperty({ description: '最小AI分数', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minScore?: number;

  @ApiProperty({ description: '挖掘批次ID', required: false })
  @IsOptional()
  @IsString()
  miningBatchId?: string;
}

/**
 * 审核操作DTO
 */
export class ReviewKnowledgeDto {
  @ApiProperty({ description: '待审核ID' })
  @IsNumber()
  reviewId: number;

  @ApiProperty({ description: '审核操作', enum: ['approve', 'reject', 'edit_approve'] })
  @IsEnum(['approve', 'reject', 'edit_approve'])
  action: string;

  @ApiProperty({ description: '编辑后的问题（当action=edit_approve时）', required: false })
  @IsOptional()
  @IsString()
  editedQuestion?: string;

  @ApiProperty({ description: '编辑后的答案（当action=edit_approve时）', required: false })
  @IsOptional()
  @IsString()
  editedAnswer?: string;

  @ApiProperty({ description: '拒绝原因（当action=reject时）', required: false })
  @IsOptional()
  @IsString()
  rejectReason?: string;

  @ApiProperty({ description: '手动调整分类-场景', required: false })
  @IsOptional()
  @IsString()
  sceneCategory?: string;

  @ApiProperty({ description: '手动调整分类-产品', required: false })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiProperty({ description: '手动调整分类-客户类型', required: false })
  @IsOptional()
  @IsString()
  customerType?: string;

  @ApiProperty({ description: '手动调整分类-问题类型', required: false })
  @IsOptional()
  @IsString()
  questionType?: string;

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;
}

/**
 * 批量审核DTO
 */
export class BatchReviewDto {
  @ApiProperty({ description: '待审核ID列表' })
  @IsArray()
  reviewIds: number[];

  @ApiProperty({ description: '批量操作', enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: string;

  @ApiProperty({ description: '拒绝原因（当action=reject时）', required: false })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}

/**
 * 挖掘统计响应DTO
 */
export class MiningStatsDto {
  @ApiProperty({ description: '总挖掘次数' })
  totalMiningTimes: number;

  @ApiProperty({ description: '总提取Q&A数量' })
  totalQAExtracted: number;

  @ApiProperty({ description: '自动批准数量' })
  autoApprovedCount: number;

  @ApiProperty({ description: '待审核数量' })
  pendingReviewCount: number;

  @ApiProperty({ description: '已拒绝数量' })
  rejectedCount: number;

  @ApiProperty({ description: '最近一次挖掘时间' })
  lastMiningTime?: Date;

  @ApiProperty({ description: '下次定时挖掘时间' })
  nextScheduledTime?: string;
}
