import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderSyncService } from './order-sync.service';
import { TriggerSyncDto } from './dto/trigger-sync.dto';
import { SyncLogQueryDto } from './dto/sync-result.dto';
import { UpdateSyncConfigDto } from './dto/sync-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('订单同步管理')
@Controller('order-sync')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class OrderSyncController {
  constructor(private readonly orderSyncService: OrderSyncService) {}

  @Post('trigger')
  @ApiOperation({ summary: '手动触发同步' })
  @RequirePermissions('order:sync')
  async triggerSync(@Body() dto: TriggerSyncDto) {
    return this.orderSyncService.triggerSync(dto);
  }

  @Get('logs')
  @ApiOperation({ summary: '查询同步日志' })
  @RequirePermissions('order:sync')
  async getSyncLogs(@Query() query: SyncLogQueryDto) {
    return this.orderSyncService.getSyncLogs(query);
  }

  @Get('config')
  @ApiOperation({ summary: '获取同步配置' })
  @RequirePermissions('order:sync')
  async getSyncConfig() {
    return this.orderSyncService.getSyncConfig();
  }

  @Put('config')
  @ApiOperation({ summary: '更新同步配置' })
  @RequirePermissions('order:sync')
  async updateSyncConfig(@Body() dto: UpdateSyncConfigDto) {
    return this.orderSyncService.updateSyncConfig(dto.configKey, dto.configValue);
  }
}
