import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderSyncService } from './order-sync.service';
import { BusinessConfigService } from '../business-config/business-config.service';
import { TriggerSyncDto } from './dto/trigger-sync.dto';
import { SyncLogQueryDto } from './dto/sync-result.dto';
import { UpdateSyncConfigDto } from './dto/sync-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('订单同步管理')
@Controller('order-sync')
// @UseGuards(JwtAuthGuard, PermissionGuard) // 临时移除身份验证进行调试
// @ApiBearerAuth()
export class OrderSyncController {
  constructor(
    private readonly orderSyncService: OrderSyncService,
    private readonly businessConfigService: BusinessConfigService,
  ) {}

  @Post('trigger')
  @ApiOperation({ summary: '手动触发同步' })
  // @RequirePermissions('order:sync') // 临时移除权限验证进行测试
  async triggerSync(@Body() dto: TriggerSyncDto) {
    return this.orderSyncService.syncOrders(dto);
  }

  @Get('logs')
  @ApiOperation({ summary: '查询同步日志' })
  // @RequirePermissions('order:sync') // 临时移除权限验证进行测试
  async getSyncLogs(@Query() query: any) {
    // 添加默认的 limit 值并处理缺失的属性
    const params = {
      page: query.page ? parseInt(query.page.toString()) : 1,
      limit: query.limit ? parseInt(query.limit.toString()) : 20,
      batchId: query.batchId,
      orderNo: query.orderNo, // 支持按订单号筛选
      syncType: query.syncType, // 支持按同步类型筛选
      result: query.result, // 支持按同步结果筛选
      startDate: query.startDate,
      endDate: query.endDate,
    };
    return this.orderSyncService.getSyncLogs(params);
  }

  @Get('config')
  @ApiOperation({ summary: '获取同步配置' })
  // @RequirePermissions('order:sync') // 临时移除权限验证进行测试
  async getSyncConfig() {
    // 使用业务配置服务获取同步相关配置
    const configs = {};
    const configKeys = [
      'order_sync.enabled',
      'order_sync.api_key',
      'order_sync.api_url',
      'order_sync.batch_size',
      'order_sync.default_sales_id',
      'order_sync.auto_create_campus',
      'order_sync.sync_customer_info',
      'order_sync.update_existing',
      'order_sync.interval',
      'order_sync.daily_update_time',
      'order_sync.sync_range_days',
    ];

    for (const key of configKeys) {
      try {
        configs[key] = await this.businessConfigService.getConfig(key);
      } catch (error) {
        configs[key] = null;
      }
    }

    return { success: true, data: configs };
  }

  @Put('config')
  @ApiOperation({ summary: '更新同步配置' })
  // @RequirePermissions('order:sync') // 临时移除权限验证进行测试
  async updateSyncConfig(@Body() dto: UpdateSyncConfigDto) {
    console.log('🔥 PUT /api/order-sync/config 被调用:', dto);
    try {
      console.log('🔥 尝试调用BusinessConfigService.updateConfig...');
      const result = await this.businessConfigService.updateConfig(dto.configKey, dto.configValue);
      console.log('✅ 调用成功:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 调用失败:', error);
      throw error;
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取同步统计' })
  // @RequirePermissions('order:sync') // 临时移除权限验证进行测试
  async getSyncStatistics(@Query() query: any) {
    const params = {
      startDate: query.startDate,
      endDate: query.endDate,
      batchId: query.batchId,
    };
    return this.orderSyncService.getSyncStatistics(params);
  }
}