import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RequirePermissions } from '@/common/decorators/permission.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionGuard } from '@/common/guards/permission.guard';
import { ScriptGeneratorService } from './services/script-generator.service';
import { TrainingSessionService } from './services/training-session.service';
import { TrainingStatsService } from './services/training-stats.service';
import { TrainingConfigService } from './services/training-config.service';
import {
  GenerateScriptFromChatDto,
  GenerateScriptFromKnowledgeDto,
  GenerateScriptWithAIDto
} from './dto/script-generation.dto';
import {
  CreateSessionDto,
  SendMessageDto,
  UpdateSessionDto
} from './dto/create-session.dto';

@ApiTags('AI培训陪练')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('training-coach')
export class TrainingCoachController {

  constructor(
    private readonly scriptGeneratorService: ScriptGeneratorService,
    private readonly trainingSessionService: TrainingSessionService,
    private readonly statsService: TrainingStatsService,
    private readonly configService: TrainingConfigService,
  ) {}

  // ==================== 剧本管理 ====================

  @Get('scripts')
  @ApiOperation({ summary: '获取培训剧本列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('training:script:view')
  async getScripts(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('scenario') scenario?: string,
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.scriptGeneratorService.getScripts(
      pageNum,
      limitNum,
      scenario,
      difficulty,
      status
    );
  }

  @Post('scripts/from-chat')
  @ApiOperation({ summary: '基于聊天记录生成剧本' })
  @ApiResponse({ status: 201, description: '生成成功' })
  @RequirePermissions('training:script:create')
  async generateScriptFromChat(
    @Body() generateDto: GenerateScriptFromChatDto,
    @Request() req,
  ) {
    return await this.scriptGeneratorService.generateFromChatHistory(generateDto, req.user.id);
  }

  @Post('scripts/from-knowledge')
  @ApiOperation({ summary: '基于知识库生成剧本' })
  @ApiResponse({ status: 201, description: '生成成功' })
  @RequirePermissions('training:script:create')
  async generateScriptFromKnowledge(
    @Body() generateDto: GenerateScriptFromKnowledgeDto,
    @Request() req,
  ) {
    return await this.scriptGeneratorService.generateFromKnowledgeBase(generateDto, req.user.id);
  }

  @Post('scripts/ai-generate')
  @ApiOperation({ summary: 'AI智能生成剧本' })
  @ApiResponse({ status: 201, description: '生成成功' })
  @RequirePermissions('training:script:create')
  async generateScriptWithAI(
    @Body() generateDto: GenerateScriptWithAIDto,
    @Request() req,
  ) {
    return await this.scriptGeneratorService.generateWithAI(generateDto, req.user.id);
  }

  // ==================== 培训会话管理 ====================

  @Get('sessions')
  @ApiOperation({ summary: '获取用户培训会话列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('training:session:view')
  async getUserSessions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.trainingSessionService.getUserSessions(
      req.user.id,
      pageNum,
      limitNum,
      status
    );
  }

  @Post('sessions')
  @ApiOperation({ summary: '创建培训会话' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @RequirePermissions('training:session:create')
  async createSession(
    @Body() createDto: CreateSessionDto,
    @Request() req,
  ) {
    return await this.trainingSessionService.createSession(createDto, req.user.id);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: '获取培训会话详情' })
  @ApiParam({ name: 'id', description: '会话ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('training:session:view')
  async getSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return await this.trainingSessionService.getSession(sessionId, req.user.id);
  }

  @Post('sessions/:id/start')
  @ApiOperation({ summary: '开始培训会话' })
  @ApiParam({ name: 'id', description: '会话ID' })
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('training:session:manage')
  async startSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return await this.trainingSessionService.startSession(sessionId, req.user.id);
  }

  @Post('sessions/:id/messages')
  @ApiOperation({ summary: '发送消息并获取AI回复' })
  @ApiParam({ name: 'id', description: '会话ID' })
  @ApiResponse({ status: 200, description: '发送成功' })
  @RequirePermissions('training:session:use')
  async sendMessage(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() messageDto: SendMessageDto,
    @Request() req,
  ) {
    return await this.trainingSessionService.sendMessage(sessionId, messageDto, req.user.id);
  }

  @Post('sessions/:id/pause')
  @ApiOperation({ summary: '暂停培训会话' })
  @ApiParam({ name: 'id', description: '会话ID' })
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('training:session:manage')
  async pauseSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return await this.trainingSessionService.pauseSession(sessionId, req.user.id);
  }

  @Post('sessions/:id/resume')
  @ApiOperation({ summary: '恢复培训会话' })
  @ApiParam({ name: 'id', description: '会话ID' })
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('training:session:manage')
  async resumeSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return await this.trainingSessionService.resumeSession(sessionId, req.user.id);
  }

  @Post('sessions/:id/end')
  @ApiOperation({ summary: '结束培训会话' })
  @ApiParam({ name: 'id', description: '会话ID' })
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('training:session:manage')
  async endSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return await this.trainingSessionService.endSession(sessionId, req.user.id);
  }

  @Get('sessions/:id/evaluation')
  @ApiOperation({ summary: '获取培训会话评估报告' })
  @ApiParam({ name: 'id', description: '会话ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('training:session:view')
  async getSessionEvaluation(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return await this.trainingSessionService.getSessionEvaluation(sessionId, req.user.id);
  }

  // ==================== 客户角色管理 ====================

  @Get('customer-personas')
  @ApiOperation({ summary: '获取客户角色列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('training:persona:view')
  async getCustomerPersonas(@Query('active') active?: string) {
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    return await this.statsService.getCustomerPersonas(isActive);
  }

  // ==================== 培训统计 ====================

  @Get('statistics')
  @ApiOperation({ summary: '获取培训统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('training:stats:view')
  async getTrainingStatistics(@Request() req) {
    return await this.statsService.getTrainingStatistics(req.user.id);
  }

  // ==================== AI配置管理 ====================

  @Get('ai-config')
  @ApiOperation({ summary: '获取AI培训配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('training:config:view')
  async getAIConfig() {
    return await this.configService.getAIConfig();
  }

  @Post('ai-config')
  @ApiOperation({ summary: '更新AI培训配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @RequirePermissions('training:config:manage')
  async updateAIConfig(@Body() config: any, @Request() req) {
    const updatedConfig = await this.configService.updateAIConfig(config);
    return { message: '配置更新成功', config: updatedConfig };
  }
}