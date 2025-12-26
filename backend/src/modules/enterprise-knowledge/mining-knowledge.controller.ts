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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { MiningKnowledgeService } from './mining-knowledge.service';
import {
  TriggerMiningDto,
  QueryPendingReviewDto,
  ReviewKnowledgeDto,
  BatchReviewDto,
} from './dto/mining-review.dto';

@ApiTags('企业知识库-AI挖掘与审核')
@Controller('enterprise-knowledge/mining')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MiningKnowledgeController {
  constructor(private readonly miningService: MiningKnowledgeService) {}

  /**
   * 手动触发AI挖掘
   */
  @Post('trigger')
  @ApiOperation({ summary: '手动触发AI挖掘微信聊天记录' })
  @RequirePermissions('knowledge:mining:use')
  async triggerMining(@Body() dto: TriggerMiningDto, @Request() req) {
    return await this.miningService.manualTriggerMining(dto, req.user.userId);
  }

  /**
   * 查询待审核列表
   */
  @Get('pending-review')
  @ApiOperation({ summary: '查询待审核知识列表' })
  @RequirePermissions('knowledge:base:view')
  async getPendingReviews(@Query() query: QueryPendingReviewDto) {
    return await this.miningService.getPendingReviews(query);
  }

  /**
   * 单个审核操作
   */
  @Put('review')
  @ApiOperation({ summary: '审核知识（批准/拒绝/编辑后批准）' })
  @RequirePermissions('knowledge:base:update')
  async reviewKnowledge(@Body() dto: ReviewKnowledgeDto, @Request() req) {
    return await this.miningService.reviewKnowledge(dto, req.user.userId);
  }

  /**
   * 批量审核操作
   */
  @Put('batch-review')
  @ApiOperation({ summary: '批量审核知识' })
  @RequirePermissions('knowledge:base:update')
  async batchReview(@Body() dto: BatchReviewDto, @Request() req) {
    return await this.miningService.batchReview(dto, req.user.userId);
  }

  /**
   * 获取挖掘统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取AI挖掘统计数据' })
  @RequirePermissions('knowledge:analytics:view')
  async getMiningStats() {
    return await this.miningService.getMiningStats();
  }
}
