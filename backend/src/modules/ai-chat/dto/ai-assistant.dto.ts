import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * AI助手对话DTO
 */
export class AiAssistantChatDto {
  @ApiProperty({ description: '用户问题' })
  @IsString()
  question: string;

  @ApiProperty({ description: '客户ID（如果是为客户服务）', required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ description: '对话上下文（历史对话）', required: false })
  @IsOptional()
  @IsObject()
  conversationContext?: any;

  @ApiProperty({ description: '是否使用知识库优先', required: false, default: true })
  @IsOptional()
  useKnowledge?: boolean = true;
}

/**
 * 反馈DTO（集成点）
 */
export class AiAssistantFeedbackDto {
  @ApiProperty({ description: '对话ID' })
  @IsNumber()
  conversationId: number;

  @ApiProperty({ description: '知识库ID（如果使用了知识库）', required: false })
  @IsOptional()
  @IsNumber()
  knowledgeId?: number;

  @ApiProperty({ description: '是否满意', required: false })
  @IsOptional()
  satisfied?: boolean;

  @ApiProperty({ description: '反馈原因', required: false })
  @IsOptional()
  @IsString()
  feedbackReason?: string;
}
