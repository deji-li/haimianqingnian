import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantChatDto, AiAssistantFeedbackDto } from './dto/ai-assistant.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

class GetConversationHistoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

@ApiTags('AI助手（实时对话-知识库优先）')
@Controller('ai-assistant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  /**
   * AI助手对话（知识库优先）
   */
  @Post('chat')
  @ApiOperation({ summary: 'AI助手对话（优先使用知识库）' })
  async chat(@Body() chatDto: AiAssistantChatDto, @Request() req) {
    return await this.aiAssistantService.chat(chatDto, req.user.userId);
  }

  /**
   * 提交反馈
   */
  @Post('feedback')
  @ApiOperation({ summary: '提交AI助手对话反馈（自动关联知识库反馈系统）' })
  async submitFeedback(@Body() feedbackDto: AiAssistantFeedbackDto, @Request() req) {
    return await this.aiAssistantService.submitFeedback(feedbackDto, req.user.userId);
  }

  /**
   * 获取对话历史
   */
  @Get('history')
  @ApiOperation({ summary: '获取AI助手对话历史' })
  async getHistory(@Query() query: GetConversationHistoryDto, @Request() req) {
    return await this.aiAssistantService.getConversationHistory({
      userId: req.user.userId,
      customerId: query.customerId,
      limit: query.limit,
    });
  }
}
