import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('数据分析')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales-funnel')
  @ApiOperation({ summary: '获取销售漏斗数据' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getSalesFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSalesFunnel(startDate, endDate);
  }

  @Get('customer-source')
  @ApiOperation({ summary: '获取客户来源分析' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getCustomerSource(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getCustomerSource(startDate, endDate);
  }

  @Get('sales-cycle')
  @ApiOperation({ summary: '获取销售周期分析' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getSalesCycle(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSalesCycle(startDate, endDate);
  }

  @Get('high-value-customers')
  @ApiOperation({ summary: '获取高价值客户列表' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量' })
  async getHighValueCustomers(@Query('limit') limit?: number) {
    return this.analyticsService.getHighValueCustomers(limit || 20);
  }

  @Get('conversion-trend')
  @ApiOperation({ summary: '获取转化率趋势' })
  @ApiQuery({ name: 'fromStage', required: true, description: '起始阶段' })
  @ApiQuery({ name: 'toStage', required: true, description: '目标阶段' })
  @ApiQuery({ name: 'months', required: false, description: '月份数量' })
  async getConversionTrend(
    @Query('fromStage') fromStage: string,
    @Query('toStage') toStage: string,
    @Query('months') months?: number,
  ) {
    return this.analyticsService.getConversionTrend(
      fromStage,
      toStage,
      months || 12,
    );
  }

  @Get('revenue-forecast')
  @ApiOperation({ summary: '获取收入预测' })
  @ApiQuery({ name: 'months', required: false, description: '预测月份数' })
  async getRevenueForecast(@Query('months') months?: number) {
    return this.analyticsService.getRevenueForecast(months || 3);
  }

  @Get('conversion-analysis')
  @ApiOperation({ summary: '获取多维度转化率分析' })
  @ApiQuery({
    name: 'dimension',
    required: true,
    description: '分析维度',
    enum: ['traffic_source', 'sales', 'campus'],
  })
  async getConversionAnalysis(
    @Query('dimension') dimension: 'traffic_source' | 'sales' | 'campus',
  ) {
    return this.analyticsService.getConversionAnalysis(dimension);
  }
}
