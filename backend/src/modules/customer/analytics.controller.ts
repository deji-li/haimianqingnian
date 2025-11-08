import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { FunnelQueryDto } from './dto/analytics.dto';

@ApiTags('数据分析')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales-funnel')
  @ApiOperation({ summary: '获取销售漏斗数据' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'salesId', required: false, description: '销售人员ID' })
  getSalesFunnel(@Query() query: FunnelQueryDto) {
    return this.analyticsService.getSalesFunnel(query);
  }

  @Get('customer-source')
  @ApiOperation({ summary: '获取客户来源分析' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'salesId', required: false })
  getCustomerSource(@Query() query: FunnelQueryDto) {
    return this.analyticsService.getCustomerSource(query);
  }

  @Get('sales-cycle')
  @ApiOperation({ summary: '获取销售周期分析' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'salesId', required: false })
  getSalesCycle(@Query() query: FunnelQueryDto) {
    return this.analyticsService.getSalesCycle(query);
  }

  @Get('high-value-customers')
  @ApiOperation({ summary: '获取高价值客户列表' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量，默认20' })
  getHighValueCustomers(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.analyticsService.getHighValueCustomers(limit);
  }

  @Get('conversion-trend')
  @ApiOperation({ summary: '获取转化率趋势' })
  @ApiQuery({ name: 'fromStage', required: true, description: '起始阶段' })
  @ApiQuery({ name: 'toStage', required: true, description: '目标阶段' })
  @ApiQuery({ name: 'months', required: false, description: '月数，默认12' })
  getConversionTrend(
    @Query('fromStage') fromStage: string,
    @Query('toStage') toStage: string,
    @Query('months', new DefaultValuePipe(12), ParseIntPipe) months: number,
  ) {
    return this.analyticsService.getConversionTrend(fromStage, toStage, months);
  }

  @Get('revenue-forecast')
  @ApiOperation({ summary: '获取收入预测（线性回归）' })
  @ApiQuery({ name: 'months', required: false, description: '预测未来月数，默认3个月' })
  getRevenueForecast(
    @Query('months', new DefaultValuePipe(3), ParseIntPipe) months: number,
  ) {
    return this.analyticsService.getRevenueForecast(months);
  }

  @Get('conversion-analysis')
  @ApiOperation({ summary: '获取多维度转化率分析' })
  @ApiQuery({
    name: 'dimension',
    required: true,
    description: '维度类型：traffic_source（流量来源）| sales（销售人员）| campus（校区）',
  })
  getConversionAnalysis(
    @Query('dimension') dimension: 'traffic_source' | 'sales' | 'campus',
  ) {
    return this.analyticsService.getConversionAnalysis(dimension);
  }

  @Get('personal-stats')
  @ApiOperation({ summary: '获取销售人员个人统计数据' })
  getPersonalStats(@Request() req) {
    return this.analyticsService.getSalesPersonalStats(req.user.id);
  }
}
