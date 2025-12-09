import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RankingService } from './ranking.service';

@ApiTags('排行榜管理')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  /**
   * 获取校区排行榜
   */
  @Get('campus')
  async getCampusRanking(@Query() query: any) {
    return await this.rankingService.getCampusRanking({
      type: query.type || 'revenue', // revenue, orderCount, studentCount
      timeRange: query.timeRange || 'month', // day, week, month, year, custom
      startDate: query.startDate,
      endDate: query.endDate,
      limit: query.limit ? parseInt(query.limit) : 20,
    });
  }

  /**
   * 获取订单排行榜
   */
  @Get('order')
  async getOrderRanking(@Query() query: any) {
    return await this.rankingService.getOrderRanking({
      type: query.type || 'amount', // amount, commission, profit
      timeRange: query.timeRange || 'month',
      startDate: query.startDate,
      endDate: query.endDate,
      campusId: query.campusId ? parseInt(query.campusId) : undefined,
      limit: query.limit ? parseInt(query.limit) : 20,
    });
  }

  /**
   * 获取老师排行榜
   */
  @Get('teacher')
  async getTeacherRanking(@Query() query: any) {
    return await this.rankingService.getTeacherRanking({
      type: query.type || 'commission', // commission, orderCount, studentCount
      timeRange: query.timeRange || 'month',
      startDate: query.startDate,
      endDate: query.endDate,
      campusId: query.campusId ? parseInt(query.campusId) : undefined,
      limit: query.limit ? parseInt(query.limit) : 20,
    });
  }

  /**
   * 获取销售排行榜
   */
  @Get('sales')
  async getSalesRanking(@Query() query: any) {
    return await this.rankingService.getSalesRanking({
      type: query.type || 'revenue', // revenue, orderCount, commission
      timeRange: query.timeRange || 'month',
      startDate: query.startDate,
      endDate: query.endDate,
      campusId: query.campusId ? parseInt(query.campusId) : undefined,
      limit: query.limit ? parseInt(query.limit) : 20,
    });
  }

  /**
   * 获取排行榜概览数据
   */
  @Get('overview')
  async getRankingOverview(@Query() query: any) {
    return await this.rankingService.getRankingOverview({
      timeRange: query.timeRange || 'month',
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  /**
   * 测试端点 - 简单的健康检查
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      message: 'RankingController is working',
      timestamp: new Date().toISOString(),
    };
  }
}