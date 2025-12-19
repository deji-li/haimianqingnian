import { IsNotEmpty, IsInt, IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendScriptDto {
  @ApiProperty({ description: '对话ID' })
  @IsNotEmpty()
  @IsInt()
  conversationId: number;

  @ApiProperty({ description: '消息ID' })
  @IsNotEmpty()
  @IsInt()
  messageId: number;

  @ApiProperty({ description: '推荐原因', required: false })
  @IsOptional()
  @IsString()
  recommendReason?: string;
}

export class QueryRecommendationsDto {
  @ApiProperty({ description: '功能类型', required: false })
  @IsOptional()
  @IsEnum(['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'])
  functionType?: 'deal_assist' | 'reply_assist' | 'script_polish' | 'opening_lines';

  @ApiProperty({ description: '审核状态', required: false })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  @ApiProperty({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class ApproveRecommendationDto {
  @ApiProperty({ description: '推荐ID' })
  @IsNotEmpty()
  @IsInt()
  recommendationId: number;

  @ApiProperty({ description: '是否通过' })
  @IsNotEmpty()
  approved: boolean;

  @ApiProperty({ description: '审核备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
