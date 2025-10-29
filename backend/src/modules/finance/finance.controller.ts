import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DataScopeGuard } from '../../common/guards/data-scope.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('财务统计')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, DataScopeGuard, PermissionGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  @RequirePermissions('finance:view')
  @ApiOperation({ summary: '获取财务概览' })
  getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    return this.financeService.getOverview(startDate, endDate, req.dataScope);
  }

  @Get('revenue-trend')
  @RequirePermissions('finance:view')
  @ApiOperation({ summary: '获取收入趋势' })
  getRevenueTrend(
    @Query('type') type: 'day' | 'month' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    return this.financeService.getRevenueTrend(
      type,
      startDate,
      endDate,
      req.dataScope,
    );
  }

  @Get('sales-ranking')
  @RequirePermissions('finance:view')
  @ApiOperation({ summary: '获取销售排行榜' })
  getSalesRanking(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    return this.financeService.getSalesRanking(
      startDate,
      endDate,
      req.dataScope,
    );
  }

  @Get('campus-revenue')
  @RequirePermissions('finance:view')
  @ApiOperation({ summary: '获取校区收入统计' })
  getCampusRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    return this.financeService.getCampusRevenue(
      startDate,
      endDate,
      req.dataScope,
    );
  }

  @Get('course-revenue')
  @RequirePermissions('finance:view')
  @ApiOperation({ summary: '获取课程收入统计' })
  getCourseRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    return this.financeService.getCourseRevenue(
      startDate,
      endDate,
      req.dataScope,
    );
  }
}
