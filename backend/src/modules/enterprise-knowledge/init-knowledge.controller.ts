import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InitKnowledgeService } from './init-knowledge.service';
import {
  CreateBasicInfoDto,
  CreateFaqDto,
  MiningChatDto,
  GenerateKnowledgeDto,
  ProductKnowledgeDto,
} from './dto/init-knowledge.dto';

@ApiTags('企业知识库-初始化')
@Controller('enterprise-knowledge/init')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InitKnowledgeController {
  constructor(private readonly initKnowledgeService: InitKnowledgeService) {}

  /**
   * 步骤1: 提交企业基础信息
   */
  @Post('step1/basic-info')
  @ApiOperation({ summary: '步骤1: 提交企业基础信息（支持手动/文件/AI生成）' })
  async initStep1BasicInfo(@Body() dto: CreateBasicInfoDto, @Request() req) {
    return await this.initKnowledgeService.initStep1BasicInfo(dto, req.user.userId);
  }

  /**
   * 步骤2: 提交FAQ列表
   */
  @Post('step2/faq')
  @ApiOperation({ summary: '步骤2: 提交FAQ列表' })
  async initStep2Faq(@Body() dto: CreateFaqDto, @Request() req) {
    return await this.initKnowledgeService.initStep2Faq(dto, req.user.userId);
  }

  /**
   * 步骤3: AI挖掘微信聊天记录
   */
  @Post('step3/mining')
  @ApiOperation({ summary: '步骤3: AI挖掘微信聊天记录' })
  async initStep3Mining(@Body() dto: MiningChatDto, @Request() req) {
    return await this.initKnowledgeService.initStep3Mining(dto, req.user.userId);
  }

  /**
   * 步骤4: 生成与整合知识库
   */
  @Post('step4/generate')
  @ApiOperation({ summary: '步骤4: 生成与整合知识库' })
  async initStep4Generate(@Body() dto: GenerateKnowledgeDto, @Request() req) {
    return await this.initKnowledgeService.initStep4Generate(dto, req.user.userId);
  }

  /**
   * 深度配置: 添加产品知识
   */
  @Post('advanced/product-knowledge')
  @ApiOperation({ summary: '深度配置: 添加产品知识（可选）' })
  async addProductKnowledge(@Body() dto: ProductKnowledgeDto, @Request() req) {
    return await this.initKnowledgeService.addProductKnowledge(dto, req.user.userId);
  }

  /**
   * 获取初始化状态
   */
  @Get('status')
  @ApiOperation({ summary: '获取知识库初始化状态' })
  async getInitStatus(@Request() req) {
    return await this.initKnowledgeService.getInitStatus(req.user.userId);
  }
}
