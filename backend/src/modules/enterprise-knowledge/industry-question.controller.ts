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
import { IndustryQuestionService } from './industry-question.service';
import {
  QueryIndustryQuestionDto,
  GenerateIndustryQuestionDto,
  AdoptIndustryQuestionDto,
  BatchAdoptIndustryQuestionDto,
} from './dto/industry-question.dto';

@ApiTags('企业知识库-行业问题推荐')
@Controller('enterprise-knowledge/industry-question')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IndustryQuestionController {
  constructor(private readonly industryQuestionService: IndustryQuestionService) {}

  /**
   * 查询行业问题库
   */
  @Get('list')
  @ApiOperation({ summary: '查询行业问题库列表' })
  async getIndustryQuestions(@Query() query: QueryIndustryQuestionDto) {
    return await this.industryQuestionService.getIndustryQuestions(query);
  }

  /**
   * AI生成行业问题
   */
  @Post('generate')
  @ApiOperation({ summary: 'AI生成行业问题' })
  async generateIndustryQuestions(@Body() dto: GenerateIndustryQuestionDto) {
    return await this.industryQuestionService.generateIndustryQuestions(dto);
  }

  /**
   * 采纳单个行业问题到知识库
   */
  @Post('adopt')
  @ApiOperation({ summary: '采纳行业问题到知识库（支持直接采纳或编辑后采纳）' })
  async adoptIndustryQuestion(@Body() dto: AdoptIndustryQuestionDto, @Request() req) {
    return await this.industryQuestionService.adoptIndustryQuestion(dto, req.user.userId);
  }

  /**
   * 批量采纳行业问题
   */
  @Post('batch-adopt')
  @ApiOperation({ summary: '批量采纳行业问题到知识库' })
  async batchAdoptIndustryQuestions(@Body() dto: BatchAdoptIndustryQuestionDto, @Request() req) {
    return await this.industryQuestionService.batchAdoptIndustryQuestions(dto, req.user.userId);
  }

  /**
   * 获取行业问题统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取行业问题统计数据' })
  async getIndustryQuestionStats() {
    return await this.industryQuestionService.getIndustryQuestionStats();
  }
}
