import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AiQualityService } from './ai-quality.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermissions } from '../../common/decorators/permission.decorator'

@ApiTags('AI质检')
@Controller('ai-quality')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiQualityController {
  constructor(private readonly aiQualityService: AiQualityService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取质检统计数据' })
  @RequirePermissions('ai-quality:view')
  async getQualityStats(@Query() query: any) {
    return this.aiQualityService.getQualityStats(query)
  }

  @Get('sop-list')
  @ApiOperation({ summary: '获取SOP质检列表' })
  @RequirePermissions('ai-quality:view')
  async getSopList(@Query() query: any) {
    return this.aiQualityService.getSopList(query)
  }

  @Get('violation-list')
  @ApiOperation({ summary: '获取违规质检列表' })
  @RequirePermissions('ai-quality:view')
  async getViolationList(@Query() query: any) {
    return this.aiQualityService.getViolationList(query)
  }

  @Get('report-list')
  @ApiOperation({ summary: '获取执行力报表' })
  @RequirePermissions('ai-quality:view')
  async getReportList(@Query() query: any) {
    return this.aiQualityService.getReportList(query)
  }

  @Post('batch-check')
  @ApiOperation({ summary: '批量质检聊天记录' })
  @RequirePermissions('ai-quality:manage')
  async batchQualityCheck(@Body() body: { chatRecords: any[] }) {
    return this.aiQualityService.batchQualityCheck(body.chatRecords)
  }
}