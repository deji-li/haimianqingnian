import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackKnowledgeService } from './feedback-knowledge.service';
import {
  SubmitFeedbackDto,
  QueryFeedbackDto,
  HandleFeedbackDto,
  QueryHighNegativeFeedbackDto,
} from './dto/feedback.dto';

@ApiTags('企业知识库-负面反馈系统')
@Controller('enterprise-knowledge/feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackKnowledgeController {
  constructor(private readonly feedbackService: FeedbackKnowledgeService) {}

  /**
   * 提交负面反馈（4个场景通用）
   */
  @Post('submit')
  @ApiOperation({ summary: '提交负面反馈（AI聊天/知识搜索/AI分析/AI推荐）' })
  async submitFeedback(@Body() dto: SubmitFeedbackDto, @Request() req) {
    return await this.feedbackService.submitFeedback(dto, req.user.userId);
  }

  /**
   * 查询反馈列表
   */
  @Get('list')
  @ApiOperation({ summary: '查询反馈列表' })
  async getFeedbackList(@Query() query: QueryFeedbackDto) {
    return await this.feedbackService.getFeedbackList(query);
  }

  /**
   * 处理反馈
   */
  @Put('handle')
  @ApiOperation({ summary: '处理反馈（更新知识/禁用知识/忽略）' })
  async handleFeedback(@Body() dto: HandleFeedbackDto, @Request() req) {
    return await this.feedbackService.handleFeedback(dto, req.user.userId);
  }

  /**
   * 获取反馈统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取反馈统计数据' })
  async getFeedbackStats() {
    return await this.feedbackService.getFeedbackStats();
  }

  /**
   * 获取高负反馈知识列表
   */
  @Get('high-negative')
  @ApiOperation({ summary: '获取高负反馈知识列表（>=3次负反馈）' })
  async getHighNegativeFeedbackKnowledge(@Query() query: QueryHighNegativeFeedbackDto) {
    return await this.feedbackService.getHighNegativeFeedbackKnowledge(query);
  }
}
