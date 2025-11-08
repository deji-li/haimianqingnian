import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DataScopeGuard } from '../../common/guards/data-scope.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('管理看板')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, DataScopeGuard, PermissionGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @RequirePermissions('dashboard:view')
  @ApiOperation({ summary: '获取管理看板概览' })
  getOverview(@Request() req) {
    // 判断用户角色，运营人员显示运营看板，其他显示销售看板
    const userRoleCode = req.user?.roleCode || '';

    if (userRoleCode === 'operator' || userRoleCode === 'operator_manager') {
      // 运营人员看板
      return this.dashboardService.getOperatorDashboard(req.user.id);
    } else {
      // 销售人员看板（默认）
      return this.dashboardService.getOverview(req.dataScope);
    }
  }

  @Get('weekly-trend')
  @RequirePermissions('dashboard:view')
  @ApiOperation({ summary: '获取近7天数据趋势' })
  getWeeklyTrend(@Request() req) {
    return this.dashboardService.getWeeklyTrend(req.dataScope);
  }

  @Get('comparison')
  @RequirePermissions('dashboard:view')
  @ApiOperation({ summary: '获取环比数据（本月 vs 上月）' })
  getComparison(@Request() req) {
    return this.dashboardService.getComparisonData(req.dataScope);
  }
}
