import { Controller, Get, Query, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OperationExtendedService } from './operation-extended.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('operation')
@UseGuards(JwtAuthGuard)
export class OperationExtendedController {
  constructor(private readonly operationExtendedService: OperationExtendedService) {}

  // ==================== 客户转化相关 ====================

  /**
   * 获取运营引流客户列表
   */
  @Get('customers')
  async getOperationCustomers(@Request() req, @Query() query: any) {
    // 权限控制：运营人员只能看自己的数据
    const user = req.user;
    let operatorId = query.operatorId;

    if (user.role === 'operation') {
      operatorId = user.id;
    }

    return await this.operationExtendedService.getOperationCustomers({
      page: parseInt(query.page) || 1,
      pageSize: parseInt(query.pageSize) || 20,
      operatorId: operatorId ? parseInt(operatorId) : undefined,
      status: query.status,
      conversionStage: query.conversionStage,
      platform: query.platform,
      city: query.city
    });
  }

  /**
   * 获取转化漏斗数据
   */
  @Get('conversion-funnel')
  async getConversionFunnel(@Request() req, @Query() query: any) {
    const user = req.user;
    let operatorId = query.operatorId;

    if (user.role === 'operation') {
      operatorId = user.id;
    }

    return await this.operationExtendedService.getConversionFunnel({
      operatorId: operatorId ? parseInt(operatorId) : undefined,
      startDate: query.startDate,
      endDate: query.endDate
    });
  }

  // ==================== 业绩指标相关 ====================

  /**
   * 获取运营业绩指标
   */
  @Get('performance-metrics')
  async getPerformanceMetrics(@Request() req, @Query() query: any) {
    const user = req.user;
    let operatorId = query.operatorId;

    if (user.role === 'operation') {
      operatorId = user.id;
    }

    return await this.operationExtendedService.getPerformanceMetrics({
      operatorId: operatorId ? parseInt(operatorId) : undefined,
      startDate: query.startDate,
      endDate: query.endDate
    });
  }

  /**
   * 获取平台效果对比
   */
  @Get('platform-comparison')
  async getPlatformComparison(@Query() query: any) {
    return await this.operationExtendedService.getPlatformComparison({
      startDate: query.startDate,
      endDate: query.endDate
    });
  }

  // ==================== 通知管理 ====================

  /**
   * 获取未读通知数量
   */
  @Get('notifications/unread-count')
  async getUnreadNotificationCount(@Request() req) {
    return await this.operationExtendedService.getUnreadNotificationCount(req.user.id);
  }

  /**
   * 获取通知列表
   */
  @Get('notifications')
  async getNotifications(@Request() req, @Query() query: any) {
    return await this.operationExtendedService.getNotifications({
      page: parseInt(query.page) || 1,
      pageSize: parseInt(query.pageSize) || 20,
      operatorId: req.user.id,
      isRead: query.isRead !== undefined ? query.isRead === 'true' : undefined
    });
  }

  /**
   * 标记通知为已读
   */
  @Post('notifications/:id/read')
  async markNotificationAsRead(@Request() req, @Param('id') id: string) {
    return await this.operationExtendedService.markNotificationAsRead(
      parseInt(id),
      req.user.id
    );
  }

  /**
   * 标记所有通知为已读
   */
  @Post('notifications/read-all')
  async markAllNotificationsAsRead(@Request() req) {
    return await this.operationExtendedService.markAllNotificationsAsRead(req.user.id);
  }
}