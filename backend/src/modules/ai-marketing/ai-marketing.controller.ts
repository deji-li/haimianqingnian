import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiMarketingService } from './ai-marketing.service';
import {
  ExecuteScenarioDto,
  BatchExecuteScenarioDto,
  QueryScenarioDto,
} from './dto/marketing-scenario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('AI营销助手')
@Controller('ai-marketing')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class AiMarketingController {
  constructor(private readonly aiMarketingService: AiMarketingService) {}

  @Get('scenarios')
  @ApiOperation({ summary: '获取所有营销场景配置' })
  @RequirePermissions('ai-tools:view')
  async getScenarios(@Query() query: QueryScenarioDto) {
    return this.aiMarketingService.getAllScenarios(query.category, query.isActive);
  }

  @Get('scenarios/categories')
  @ApiOperation({ summary: '获取场景分类列表' })
  @RequirePermissions('ai-tools:view')
  async getCategories() {
    return this.aiMarketingService.getCategories();
  }

  @Get('scenarios/:scenarioKey')
  @ApiOperation({ summary: '获取单个场景配置' })
  @RequirePermissions('ai-tools:view')
  async getScenario(@Param('scenarioKey') scenarioKey: string) {
    return this.aiMarketingService.getScenario(scenarioKey);
  }

  @Post('execute')
  @ApiOperation({ summary: '执行营销场景分析' })
  @RequirePermissions('ai-tools:use')
  async executeScenario(@Body() dto: ExecuteScenarioDto) {
    return this.aiMarketingService.executeScenario(dto);
  }

  @Post('batch-execute')
  @ApiOperation({ summary: '批量执行多个场景' })
  @RequirePermissions('ai-tools:use')
  async batchExecute(@Body() dto: BatchExecuteScenarioDto) {
    return this.aiMarketingService.batchExecuteScenarios(dto);
  }

  // ========== 快捷方法 API ==========

  @Post('quick/pain-points')
  @ApiOperation({ summary: '快速分析痛点' })
  @RequirePermissions('ai-tools:use')
  async quickAnalyzePainPoints(
    @Body() body: { chatContent: string; customerProfile?: any },
  ) {
    return this.aiMarketingService.analyzePainPoints(
      body.chatContent,
      body.customerProfile,
    );
  }

  @Post('quick/interest-points')
  @ApiOperation({ summary: '快速挖掘兴趣点' })
  @RequirePermissions('ai-tools:use')
  async quickMineInterestPoints(@Body() body: { chatContent: string }) {
    return this.aiMarketingService.mineInterestPoints(body.chatContent);
  }

  @Post('quick/need-positioning')
  @ApiOperation({ summary: '快速需求定位' })
  @RequirePermissions('ai-tools:use')
  async quickPositionNeeds(
    @Body()
    body: {
      chatContent: string;
      painPoints: string[];
      interestPoints: string[];
    },
  ) {
    return this.aiMarketingService.positionNeeds(
      body.chatContent,
      body.painPoints,
      body.interestPoints,
    );
  }

  @Post('quick/script-recommendation')
  @ApiOperation({ summary: '快速话术推荐' })
  @RequirePermissions('ai-tools:use')
  async quickRecommendScripts(
    @Body()
    body: {
      painPoints: string[];
      interestPoints: string[];
      conversationStage: string;
      decisionRole: string;
    },
  ) {
    return this.aiMarketingService.recommendScripts(
      body.painPoints,
      body.interestPoints,
      body.conversationStage,
      body.decisionRole,
    );
  }

  @Post('quick/objection-handling')
  @ApiOperation({ summary: '快速异议处理' })
  @RequirePermissions('ai-tools:use')
  async quickHandleObjections(
    @Body() body: { chatContent: string; objections: string[] },
  ) {
    return this.aiMarketingService.handleObjections(
      body.chatContent,
      body.objections,
    );
  }

  @Post('quick/closing-timing')
  @ApiOperation({ summary: '快速成交时机判断' })
  @RequirePermissions('ai-tools:use')
  async quickAssessClosingTiming(
    @Body()
    body: {
      chatContent: string;
      intentionScore: number;
      resolvedPainPoints: string[];
      unresolvedPainPoints: string[];
      communicationRounds: number;
    },
  ) {
    return this.aiMarketingService.assessClosingTiming(
      body.chatContent,
      body.intentionScore,
      body.resolvedPainPoints,
      body.unresolvedPainPoints,
      body.communicationRounds,
    );
  }
}
