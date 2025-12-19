import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { AiScriptAssistantService } from './ai-script-assistant.service';
import { CreateConversationDto, SendMessageDto, QueryConversationsDto, CreateFeedbackDto, FunctionType, RecommendScriptDto, QueryRecommendationsDto, ApproveRecommendationDto } from './dto/index';

@ApiTags('AI话术助手')
@ApiBearerAuth()
@Controller('ai-script-assistant')
@UseGuards(JwtAuthGuard)
export class AiScriptAssistantController {
  constructor(private readonly aiScriptAssistantService: AiScriptAssistantService) {}

  @Post('conversations')
  @ApiOperation({ summary: '创建对话会话' })
  @RequirePermissions('ai:script:use')
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  async createConversation(@Request() req, @Body() createConversationDto: CreateConversationDto) {
    return this.aiScriptAssistantService.createConversation(req.user.id, createConversationDto);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: '发送消息' })
  @RequirePermissions('ai:script:use')
  @ApiResponse({ status: HttpStatus.OK, description: '发送成功' })
  async sendMessage(
    @Param('id', ParseIntPipe) conversationId: number,
    @Request() req,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.aiScriptAssistantService.sendMessage(conversationId, req.user.id, sendMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: '获取对话列表' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getConversations(@Request() req, @Query() query: QueryConversationsDto) {
    return this.aiScriptAssistantService.getConversations(req.user.id, req.user.roleCode, query);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: '获取对话详情' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getConversationDetail(
    @Param('id', ParseIntPipe) conversationId: number,
    @Request() req,
  ) {
    return this.aiScriptAssistantService.getConversationDetail(conversationId, req.user.id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: '删除对话' })
  @RequirePermissions('ai:script:delete')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  async deleteConversation(
    @Param('id', ParseIntPipe) conversationId: number,
    @Request() req,
  ) {
    return this.aiScriptAssistantService.deleteConversation(conversationId, req.user.id);
  }

  @Get('scenarios')
  @ApiOperation({ summary: '获取场景列表' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getScenarios(@Query('functionType') functionType?: FunctionType) {
    return this.aiScriptAssistantService.getScenarios(functionType);
  }

  @Get('techniques')
  @ApiOperation({ summary: '获取技巧列表' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getTechniques(@Query('scenarioId', ParseIntPipe) scenarioId: number) {
    return this.aiScriptAssistantService.getTechniques(scenarioId);
  }

  @Post('feedback')
  @ApiOperation({ summary: '提交反馈' })
  @RequirePermissions('ai:script:use')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: '反馈成功' })
  async submitFeedback(
    @Request() req,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    // TODO: 实现反馈功能
    return { message: '反馈提交成功' };
  }

  // 兼容旧版API接口
  @Post('script/generate')
  @ApiOperation({ summary: '生成推荐话术（兼容接口）' })
  @RequirePermissions('ai:script:use')
  @ApiResponse({ status: HttpStatus.OK, description: '生成成功' })
  async generateScriptCompat(
    @Request() req,
    @Body('customerId', ParseIntPipe) customerId: number,
    @Body('scriptType') scriptType: string,
  ) {
    // 映射旧版类型到新版功能类型
    const typeMap: Record<string, any> = {
      '开场白': 'opening_lines',
      '需求挖掘': 'deal_assist',
      '应对异议': 'reply_assist',
      '促成': 'deal_assist',
      '售后': 'reply_assist',
    };

    const functionType = typeMap[scriptType] || 'deal_assist';

    // 创建对话并返回
    const conversation = await this.aiScriptAssistantService.createConversation(req.user.id, {
      functionType,
      customerId,
    });

    return {
      id: conversation.id,
      scriptType,
      scriptContent: '请在对话中提供更多详细信息以获得精准话术建议',
      scenario: `客户ID_${customerId}`,
      source: 'AI话术助手',
      isActive: 1,
    };
  }

  @Get('script/list')
  @ApiOperation({ summary: '获取话术列表（兼容接口）' })
  @RequirePermissions('ai_script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getScriptListCompat(@Query('scriptType') scriptType: string) {
    // 返回空列表，引导用户使用新接口
    return [];
  }

  @Post('script/:id/use')
  @ApiOperation({ summary: '记录话术使用（兼容接口）' })
  @RequirePermissions('ai:script:use')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: '记录成功' })
  async recordScriptUsageCompat(
    @Param('id', ParseIntPipe) id: number,
    @Body('success') success: boolean,
  ) {
    // TODO: 实现使用记录功能
    return { message: '使用记录成功' };
  }

  // 话术推荐到知识库功能
  @Post('recommend')
  @ApiOperation({ summary: '推荐话术到知识库' })
  @RequirePermissions('ai:script:use')
  @ApiResponse({ status: HttpStatus.OK, description: '推荐成功' })
  async recommendScript(@Request() req, @Body() dto: RecommendScriptDto) {
    return this.aiScriptAssistantService.recommendScript(req.user.id, dto);
  }

  @Get('recommendations')
  @ApiOperation({ summary: '获取推荐列表' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getRecommendations(@Request() req, @Query() query: QueryRecommendationsDto) {
    return this.aiScriptAssistantService.getRecommendations(query, req.user.id, req.user.role);
  }

  @Post('recommendations/:id/approve')
  @ApiOperation({ summary: '审核推荐' })
  @RequirePermissions('ai:script:manage')
  @ApiResponse({ status: HttpStatus.OK, description: '审核成功' })
  async approveRecommendation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: ApproveRecommendationDto,
  ) {
    return this.aiScriptAssistantService.approveRecommendation(id, req.user.id, dto.approved, dto.remark);
  }

  // 直接生成接口（工具模式）
  @Post('generate-direct')
  @ApiOperation({ summary: '直接生成话术（工具模式）' })
  @RequirePermissions('ai:script:use')
  @ApiResponse({ status: HttpStatus.OK, description: '生成成功' })
  async generateDirect(@Request() req, @Body() dto: {
    functionType: 'script_polish' | 'opening_lines'
    content?: string
    scenarioId?: number
    techniqueId?: number
    variables?: Record<string, any>
  }) {
    return this.aiScriptAssistantService.generateDirect(req.user.id, dto);
  }
}