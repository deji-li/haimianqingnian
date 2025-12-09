import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingAssistantService } from './marketing-assistant.service';
import {
  GenerateMarketingContentDto,
  SubmitFeedbackDto,
  RecommendContentDto,
  QueryHistoryDto,
  BatchDeleteDto,
  AddCustomerInsightDto,
} from './dto/marketing-assistant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('AI营销助手')
@Controller('ai-marketing/assistant')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MarketingAssistantController {
  constructor(private readonly marketingAssistantService: MarketingAssistantService) {}

  // ==================== 客户洞察相关 ====================

  @Get('insights')
  @ApiOperation({ summary: '获取用户客户洞察数据' })
  @RequirePermissions('ai-marketing:use')
  async getCustomerInsights(@Request() req) {
    return this.marketingAssistantService.getCustomerInsights(req.user.userId);
  }

  @Get('insights/:customerId')
  @ApiOperation({ summary: '获取特定客户的洞察数据' })
  @RequirePermissions('ai-marketing:use')
  async getCustomerInsightsByCustomerId(
    @Param('customerId') customerId: number,
    @Request() req,
  ) {
    return this.marketingAssistantService.getCustomerInsightsByCustomerId(
      customerId,
      req.user.userId,
    );
  }

  @Post('insights')
  @ApiOperation({ summary: '添加客户洞察' })
  @RequirePermissions('ai-marketing:use')
  async addCustomerInsight(
    @Body() dto: AddCustomerInsightDto,
    @Request() req,
  ) {
    return this.marketingAssistantService.addCustomerInsight(dto, req.user.userId);
  }

  // ==================== 营销文案生成 ====================

  @Post('generate')
  @ApiOperation({ summary: '生成营销文案' })
  @RequirePermissions('ai-marketing:use')
  async generateMarketingContent(
    @Body() dto: GenerateMarketingContentDto,
    @Request() req,
  ) {
    return this.marketingAssistantService.generateMarketingContent(dto, req.user.userId);
  }

  // ==================== 历史记录管理 ====================

  @Get('history')
  @ApiOperation({ summary: '查询历史记录' })
  @RequirePermissions('ai-marketing:use')
  async queryHistory(@Query() query: QueryHistoryDto, @Request() req) {
    return this.marketingAssistantService.queryHistory(query, req.user.userId);
  }

  @Get('history/:id')
  @ApiOperation({ summary: '获取历史记录详情' })
  @RequirePermissions('ai-marketing:use')
  async getHistoryDetail(@Param('id') id: number, @Request() req) {
    return this.marketingAssistantService.getHistoryDetail(id, req.user.userId);
  }

  @Post('history/batch-delete')
  @ApiOperation({ summary: '批量删除历史记录' })
  @RequirePermissions('ai-marketing:use')
  async batchDelete(@Body() dto: BatchDeleteDto, @Request() req) {
    return this.marketingAssistantService.batchDelete(dto, req.user.userId);
  }

  // ==================== 反馈管理 ====================

  @Post('feedback')
  @ApiOperation({ summary: '提交反馈' })
  @RequirePermissions('ai-marketing:use')
  async submitFeedback(
    @Body() dto: SubmitFeedbackDto,
    @Request() req,
  ) {
    return this.marketingAssistantService.submitFeedback(dto, req.user.userId);
  }

  // ==================== 文案推荐 ====================

  @Post('recommend')
  @ApiOperation({ summary: '推荐到文案库' })
  @RequirePermissions('ai-marketing:use')
  async recommendToLibrary(
    @Body() dto: RecommendContentDto,
    @Request() req,
  ) {
    return this.marketingAssistantService.recommendToLibrary(dto, req.user.userId);
  }

  // ==================== 知识库反哺 ====================

  @Post('feedback-to-knowledge/:historyId')
  @ApiOperation({ summary: '反哺内容到知识库' })
  @RequirePermissions('ai-marketing:use')
  async feedbackContentToKnowledge(
    @Param('historyId') historyId: number,
    @Request() req,
  ) {
    return this.marketingAssistantService.feedbackContentToKnowledge(
      historyId,
      req.user.userId,
    );
  }

  // ==================== 知识库内容推荐 ====================

  @Get('knowledge/recommended/:scenario')
  @ApiOperation({ summary: '获取推荐知识库内容' })
  @RequirePermissions('ai-marketing:use')
  async getRecommendedKnowledge(
    @Param('scenario') scenario: string,
    @Query('limit') limit?: number,
  ) {
    // 这个方法需要通过知识库集成服务实现
    // 暂时返回空数组，后续可以集成
    return {
      success: true,
      data: [],
      message: '功能开发中',
    };
  }

  // ==================== 热门知识库内容 ====================

  @Get('knowledge/popular')
  @ApiOperation({ summary: '获取热门知识库内容' })
  @RequirePermissions('ai-marketing:use')
  async getPopularKnowledge(@Query('limit') limit?: number) {
    // 这个方法需要通过知识库集成服务实现
    // 暂时返回空数组，后续可以集成
    return {
      success: true,
      data: [],
      message: '功能开发中',
    };
  }
}