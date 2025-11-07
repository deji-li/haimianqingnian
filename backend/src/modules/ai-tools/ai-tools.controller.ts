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
import { AiToolsService } from './ai-tools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { QueryReportListDto, QuerySleepingCustomersDto, QueryAnalyticsDto } from './dto/ai-tools.dto';

@ApiTags('AI工具（话术+风险+培训）')
@ApiBearerAuth()
@Controller('ai-tools')
@UseGuards(JwtAuthGuard)
export class AiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}

  // ==================== 话术助手 ====================
  @Post('script/generate')
  @ApiOperation({ summary: '生成推荐话术' })
  @RequirePermissions('ai:script:use')
  async generateScript(
    @Body('customerId') customerId: number,
    @Body('scriptType') scriptType: string,
  ) {
    return this.aiToolsService.generateScript(customerId, scriptType);
  }

  @Get('script/list')
  @ApiOperation({ summary: '获取话术列表' })
  @RequirePermissions('ai:script:view')
  async getScripts(@Query('scriptType') scriptType: string) {
    return this.aiToolsService.getRecommendedScripts(scriptType);
  }

  @Post('script/:id/use')
  @ApiOperation({ summary: '记录话术使用' })
  @RequirePermissions('ai:script:use')
  async recordScriptUsage(
    @Param('id') id: number,
    @Body('success') success: boolean,
  ) {
    return this.aiToolsService.recordScriptUsage(id, success);
  }

  // ==================== 风险预警 ====================
  @Get('risk/pending')
  @ApiOperation({ summary: '获取待处理风险预警' })
  @RequirePermissions('ai:risk:view')
  async getPendingRiskAlerts(@Request() req) {
    return this.aiToolsService.getPendingRiskAlerts(
      req.user.userId,
      req.user.role,
    );
  }

  @Post('risk/:id/handle')
  @ApiOperation({ summary: '处理风险预警' })
  @RequirePermissions('ai:risk:handle')
  async handleRiskAlert(
    @Param('id') id: number,
    @Body('handleResult') handleResult: string,
    @Request() req,
  ) {
    return this.aiToolsService.handleRiskAlert(id, req.user.userId, handleResult);
  }

  // ==================== 客户复苏 ====================
  @Get('recovery/sleeping-customers')
  @ApiOperation({ summary: '识别沉睡客户' })
  @RequirePermissions('ai:recovery:view')
  async identifySleepingCustomers(@Query() query: QuerySleepingCustomersDto) {
    return this.aiToolsService.identifySleepingCustomers(query.days || 30);
  }

  // ==================== AI培训陪练 ====================
  @Post('training/start')
  @ApiOperation({ summary: '开始AI陪练' })
  @RequirePermissions('ai:training:use')
  async startTraining(
    @Body('scenario') scenario: string,
    @Request() req,
  ) {
    return this.aiToolsService.startTrainingSession(req.user.userId, scenario);
  }

  @Post('training/:id/chat')
  @ApiOperation({ summary: '陪练对话' })
  @RequirePermissions('ai:training:use')
  async trainConversation(
    @Param('id') id: number,
    @Body('message') message: string,
  ) {
    return this.aiToolsService.trainConversation(id, message);
  }

  @Post('training/:id/end')
  @ApiOperation({ summary: '结束训练并评分' })
  @RequirePermissions('ai:training:use')
  async endTraining(@Param('id') id: number) {
    return this.aiToolsService.endTraining(id);
  }

  // ==================== AI营销助手 ====================
  @Post('marketing/generate')
  @ApiOperation({ summary: '生成营销文案' })
  @RequirePermissions('ai:marketing:use')
  async generateMarketingContent(@Body() body: any) {
    return this.aiToolsService.generateMarketingContent(body);
  }

  @Get('marketing/history')
  @ApiOperation({ summary: '获取营销文案历史' })
  @RequirePermissions('ai:marketing:view')
  async getMarketingHistory(
    @Request() req,
    @Query('contentType') contentType?: string,
  ) {
    return this.aiToolsService.getMarketingContentHistory(req.user.userId, contentType);
  }

  // ==================== AI人效分析 ====================
  @Get('analytics/efficiency')
  @ApiOperation({ summary: '获取AI人效分析数据' })
  @RequirePermissions('ai:analytics:view')
  async getEfficiencyAnalytics(@Query() query: QueryAnalyticsDto) {
    return this.aiToolsService.getAiEfficiencyAnalytics({
      startDate: query.startDate,
      endDate: query.endDate,
      userId: query.userId,
      departmentId: query.departmentId,
    });
  }

  // ==================== AI诊断报告 ====================
  @Post('report/generate')
  @ApiOperation({ summary: '生成AI诊断报告' })
  @RequirePermissions('ai:report:generate')
  async generateReport(@Body() body: any) {
    return this.aiToolsService.generateReport(body);
  }

  @Get('report/list')
  @ApiOperation({ summary: '获取报告列表' })
  @RequirePermissions('ai:report:view')
  async getReportList(@Query() query: QueryReportListDto) {
    return this.aiToolsService.getReportList({
      page: query.page,
      limit: query.limit,
      reportType: query.reportType,
      status: query.status,
    });
  }

  @Get('report/:id')
  @ApiOperation({ summary: '获取报告详情' })
  @RequirePermissions('ai:report:view')
  async getReportDetail(@Param('id') id: number) {
    return this.aiToolsService.getReportDetail(id);
  }
}
