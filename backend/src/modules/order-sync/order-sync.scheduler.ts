import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderSyncService } from './order-sync.service';
import { BusinessConfigService } from '../business-config/business-config.service';

@Injectable()
export class OrderSyncScheduler {
  private readonly logger = new Logger(OrderSyncScheduler.name);
  private isRunning = false;

  constructor(
    private readonly orderSyncService: OrderSyncService,
    private readonly businessConfigService: BusinessConfigService,
  ) {}

  /**
   * 定时增量同步任务（每5分钟检查一次是否需要执行）
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleIncrementalSync() {
    // 检查是否启用自动同步
    const enabled = (await this.businessConfigService.getConfig('order_sync.enabled')) === 'true';
    if (!enabled) {
      return;
    }

    // 防止重复执行
    if (this.isRunning) {
      this.logger.warn('上一次同步任务尚未完成，跳过本次执行');
      return;
    }

    try {
      this.isRunning = true;

      // 获取同步间隔配置（分钟）
      const intervalMinutes = parseInt(
        await this.businessConfigService.getConfig('order_sync.interval') || '30',
      );

      // 检查上次同步时间（简化版：直接执行，实际可通过数据库记录判断）
      // TODO: 可以增加更精确的间隔控制

      this.logger.log('开始定时增量同步任务');

      const result = await this.orderSyncService.triggerSync();

      this.logger.log(
        `定时同步完成: 成功=${result.successCount}, 失败=${result.failedCount}, ` +
          `创建=${result.createdCount}, 更新=${result.updatedCount}`,
      );
    } catch (error) {
      this.logger.error(`定时同步失败: ${error.message}`, error.stack);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 每日批量更新任务（默认凌晨2点）
   */
  @Cron('0 2 * * *')
  async handleDailyBatchUpdate() {
    const enabled = (await this.businessConfigService.getConfig('order_sync.enabled')) === 'true';
    if (!enabled) {
      return;
    }

    // 检查配置的执行时间
    const dailyUpdateTime = await this.businessConfigService.getConfig('order_sync.daily_update_time');
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const [configHour, configMinute] = (dailyUpdateTime || '02:00').split(':').map(Number);

    // 仅在配置的时间点执行（允许5分钟误差）
    if (Math.abs(currentHour - configHour) > 0 || Math.abs(currentMinute - configMinute) > 5) {
      return;
    }

    try {
      this.logger.log('开始每日批量更新任务');

      // 拉取最近30天的订单数据进行全量更新
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await this.orderSyncService.triggerSync({
        startTime: this.formatDate(startDate),
        endTime: this.formatDate(endDate),
      });

      this.logger.log(
        `每日批量更新完成: 成功=${result.successCount}, 失败=${result.failedCount}, ` +
          `创建=${result.createdCount}, 更新=${result.updatedCount}`,
      );
    } catch (error) {
      this.logger.error(`每日批量更新失败: ${error.message}`, error.stack);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
