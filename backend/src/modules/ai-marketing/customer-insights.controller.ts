import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MarketingAssistantService } from './marketing-assistant.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermissions } from '../../common/decorators/permission.decorator'

@ApiTags('客户洞察')
@Controller('ai-marketing/insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerInsightsController {
  constructor(private readonly marketingAssistantService: MarketingAssistantService) {}

  @Get('list')
  @ApiOperation({ summary: '获取客户洞察列表' })
  @RequirePermissions('ai-marketing:use')
  async getInsightsList(@Query() query: any, @Request() req) {
    return this.marketingAssistantService.getInsightsList(query, req.user.userId)
  }

  @Get('stats')
  @ApiOperation({ summary: '获取洞察统计数据' })
  @RequirePermissions('ai-marketing:use')
  async getInsightStats(@Request() req) {
    return this.marketingAssistantService.getInsightStats(req.user.userId)
  }
}