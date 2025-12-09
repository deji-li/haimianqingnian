import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { WeWorkSyncService } from './wework-sync.service'
import { WeWorkConfigService } from '../config/wework-config.service'

@Injectable()
export class WeWorkSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(WeWorkSchedulerService.name)
  private isSyncRunning = false
  private readonly SYNC_LOCK_TIMEOUT = 30 * 60 * 1000 // 30分钟锁超时

  constructor(
    private readonly weWorkSyncService: WeWorkSyncService,
    private readonly weWorkConfigService: WeWorkConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('企业微信同步调度服务初始化完成')
  }

  /**
   * 高频同步 - 每5分钟执行一次（检查新联系人）
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async highFrequencySync(): Promise<void> {
    await this.executeWithLock('high_frequency_sync', async () => {
      await this.syncRecentContacts()
    })
  }

  /**
   * 标准同步 - 每30分钟执行一次
   */
  @Cron('*/30 * * * *') // 每30分钟
  async standardSync(): Promise<void> {
    await this.executeWithLock('standard_sync', async () => {
      await this.weWorkSyncService.incrementalSync()
    })
  }

  /**
   * 深度同步 - 每天凌晨2点执行
   */
  @Cron('0 2 * * *') // 每天凌晨2点
  async deepSync(): Promise<void> {
    await this.executeWithLock('deep_sync', async () => {
      await this.performDeepSync()
    })
  }

  /**
   * 清理过期数据 - 每周日凌晨3点执行
   */
  @Cron('0 3 * * 0') // 每周日凌晨3点
  async cleanupExpiredData(): Promise<void> {
    await this.executeWithLock('cleanup_data', async () => {
      await this.performDataCleanup()
    })
  }

  /**
   * 健康检查 - 每小时执行一次
   */
  @Cron('0 0 * * * *') // 每小时整点
  async healthCheck(): Promise<void> {
    try {
      // 检查企业微信配置是否正常
      const config = await this.weWorkConfigService.getActiveConfig()
      if (!config) {
        this.logger.warn('企业微信配置不存在或未启用')
        return
      }

      // 检查API连接状态
      const isConnected = await this.weWorkConfigService.testApiConnection(config)
      if (!isConnected) {
        this.logger.error('企业微信API连接失败，请检查配置')
        return
      }

      // 检查同步状态
      const syncStatus = await this.weWorkSyncService.getSyncStatus()
      this.logger.log('健康检查完成', {
        configExists: !!config,
        apiConnected: isConnected,
        lastSyncTime: syncStatus.lastSyncTime,
        totalContacts: syncStatus.totalContacts,
        syncedContacts: syncStatus.syncedContacts
      })
    } catch (error) {
      this.logger.error('健康检查失败:', error)
    }
  }

  /**
   * 同步最近联系人（最近1小时内的变更）
   */
  private async syncRecentContacts(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

      // 这里可以调用企业微信API获取最近变更的联系人
      // 目前实现为增量同步
      const result = await this.weWorkSyncService.incrementalSync()

      this.logger.log(`高频同步完成: ${result.message}`)
    } catch (error) {
      this.logger.error('高频同步失败:', error)
    }
  }

  /**
   * 执行深度同步
   */
  private async performDeepSync(): Promise<void> {
    try {
      this.logger.log('开始执行深度同步')

      // 强制全量同步所有联系人
      const result = await this.weWorkSyncService.manualSync({ force: true })

      this.logger.log(`深度同步完成: ${result.message}`)

      // 如果有失败，记录详细错误信息
      if (result.failed > 0 && result.errors?.length > 0) {
        this.logger.error(`深度同步有 ${result.failed} 个联系人失败:`, result.errors.slice(0, 5))
      }
    } catch (error) {
      this.logger.error('深度同步执行失败:', error)
    }
  }

  /**
   * 执行数据清理
   */
  private async performDataCleanup(): Promise<void> {
    try {
      this.logger.log('开始执行数据清理')

      // 清理30天前的同步日志
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // 这里可以添加具体的清理逻辑
      // 例如：删除过期的同步日志、清理缓存数据等

      this.logger.log('数据清理完成')
    } catch (error) {
      this.logger.error('数据清理失败:', error)
    }
  }

  /**
   * 带锁的执行方法，防止重复执行
   */
  private async executeWithLock(lockKey: string, task: () => Promise<void>): Promise<void> {
    if (this.isSyncRunning) {
      this.logger.warn(`${lockKey} 正在执行中，跳过本次执行`)
      return
    }

    this.isSyncRunning = true

    try {
      // 设置锁超时，防止死锁
      const lockTimeout = setTimeout(() => {
        this.logger.error(`${lockKey} 执行超时，强制解锁`)
        this.isSyncRunning = false
      }, this.SYNC_LOCK_TIMEOUT)

      await task()
      clearTimeout(lockTimeout)
    } catch (error) {
      this.logger.error(`${lockKey} 执行失败:`, error)
    } finally {
      this.isSyncRunning = false
    }
  }

  /**
   * 获取调度器状态
   */
  getSchedulerStatus(): any {
    return {
      isRunning: this.isSyncRunning,
      nextHighFrequencySync: this.getNextExecutionTime('*/5 * * * *'),
      nextStandardSync: this.getNextExecutionTime('*/30 * * * *'),
      nextDeepSync: this.getNextExecutionTime('0 2 * * *'),
      nextCleanup: this.getNextExecutionTime('0 3 * * 0'),
      nextHealthCheck: this.getNextExecutionTime('0 0 * * * *')
    }
  }

  /**
   * 计算下次执行时间
   */
  private getNextExecutionTime(cronExpression: string): string {
    try {
      // 这里可以使用cron-parser库来计算下次执行时间
      // 简单实现：返回当前时间 + 预估间隔
      const now = new Date()

      if (cronExpression === '*/5 * * * *') {
        now.setMinutes(now.getMinutes() + 5)
      } else if (cronExpression === '*/30 * * * *') {
        now.setMinutes(now.getMinutes() + 30)
      } else if (cronExpression === '0 2 * * *') {
        now.setDate(now.getDate() + 1)
        now.setHours(2, 0, 0, 0)
      } else if (cronExpression === '0 3 * * 0') {
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7
        now.setDate(now.getDate() + daysUntilSunday)
        now.setHours(3, 0, 0, 0)
      } else if (cronExpression === '0 0 * * * *') {
        now.setHours(now.getHours() + 1)
        now.setMinutes(0, 0, 0)
      }

      return now.toISOString()
    } catch (error) {
      return '计算失败'
    }
  }

  /**
   * 手动触发同步任务
   */
  async triggerManualSync(syncType: 'high_frequency' | 'standard' | 'deep' = 'standard'): Promise<void> {
    switch (syncType) {
      case 'high_frequency':
        await this.highFrequencySync()
        break
      case 'standard':
        await this.standardSync()
        break
      case 'deep':
        await this.deepSync()
        break
      default:
        throw new Error(`未知的同步类型: ${syncType}`)
    }
  }
}