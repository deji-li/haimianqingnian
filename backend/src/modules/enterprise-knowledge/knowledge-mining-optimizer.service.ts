import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';
import { EnterpriseKnowledgeBase, KnowledgePendingReview } from '../entities/index';
import { RedisService } from '@nestjs-modules/ioredis';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

/**
 * 知识挖掘性能优化服务
 * 实现批量处理、并行挖掘、智能调度等性能优化功能
 */
export interface MiningJob {
  id: string;
  type: 'batch_mining' | 'incremental_mining' | 'scheduled_mining';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  config: any;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface MiningStats {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  averageProcessingTime: number;
  queueSize: number;
  lastMiningTime: Date;
}

export interface BatchMiningConfig {
  batchId: string;
  recordIds: number[];
  miningStrategy: 'parallel' | 'sequential';
  concurrencyLimit?: number;
  qualityThreshold: number;
  autoApprove: boolean;
  notifyOnComplete?: boolean;
}

@Injectable()
export class KnowledgeMiningOptimizerService {
  private readonly logger = new Logger(KnowledgeMiningOptimizerService.name);
  private readonly CACHE_PREFIX = 'mining:';
  private readonly DEFAULT_CONCURRENCY = 5;
  private readonly BATCH_SIZE = 50;

  constructor(
    @InjectRepository(AiChatRecord)
    private readonly chatRecordRepository: Repository<AiChatRecord>,
    @InjectRepository(KnowledgePendingReview)
    private readonly pendingReviewRepository: Repository<KnowledgePendingReview>,
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    private readonly redisService: RedisService,
    @InjectQueue('knowledge-mining') private readonly miningQueue: Queue,
  ) {}

  /**
   * 优化批量挖掘
   */
  async optimizedBatchMining(config: BatchMiningConfig): Promise<MiningJob> {
    const job: MiningJob = {
      id: `batch_${Date.now()}`,
      type: 'batch_mining',
      status: 'pending',
      config,
      createdAt: new Date(),
    };

    try {
      // 1. 预处理和验证
      await this.preprocessMiningConfig(config);

      // 2. 分批处理大量数据
      const batches = this.createBatches(config.recordIds, this.BATCH_SIZE);

      // 3. 添加到任务队列
      await this.addToMiningQueue(job, batches);

      // 4. 缓存任务状态
      await this.cacheJobStatus(job);

      this.logger.log(`批量挖掘任务已创建: ${job.id}, 分${batches.length}批处理`);

      return job;

    } catch (error) {
      this.logger.error(`创建批量挖掘任务失败: ${error.message}`, error.stack);
      job.status = 'failed';
      job.error = error.message;
      await this.cacheJobStatus(job);
      throw error;
    }
  }

  /**
   * 增量挖掘（只处理新增或变更的数据）
   */
  async incrementalMining(lastMiningTime?: Date): Promise<MiningJob> {
    const job: MiningJob = {
      id: `incremental_${Date.now()}`,
      type: 'incremental_mining',
      status: 'pending',
      config: { lastMiningTime },
      createdAt: new Date(),
    };

    try {
      // 1. 查找需要处理的记录
      const recordsToProcess = await this.getRecordsForIncrementalMining(lastMiningTime);

      if (recordsToProcess.length === 0) {
        this.logger.log('没有需要增量挖掘的记录');
        job.status = 'completed';
        job.result = { processed: 0 };
        await this.cacheJobStatus(job);
        return job;
      }

      // 2. 创建增量挖掘配置
      const config: BatchMiningConfig = {
        batchId: job.id,
        recordIds: recordsToProcess.map(r => r.id),
        miningStrategy: 'parallel',
        concurrencyLimit: 3, // 增量挖掘使用较低的并发
        qualityThreshold: 65, // 稍低的质量阈值，避免遗漏
        autoApprove: false, // 增量挖掘不自动批准
      };

      // 3. 执行挖掘
      return await this.optimizedBatchMining(config);

    } catch (error) {
      this.logger.error(`增量挖掘失败: ${error.message}`, error.stack);
      job.status = 'failed';
      job.error = error.message;
      await this.cacheJobStatus(job);
      throw error;
    }
  }

  /**
   * 定时挖掘优化
   */
  async scheduledMining(): Promise<void> {
    this.logger.log('开始定时知识挖掘优化');

    try {
      // 1. 获取上次挖掘时间
      const lastMiningTime = await this.getLastScheduledMiningTime();

      // 2. 执行增量挖掘
      const job = await this.incrementalMining(lastMiningTime);

      // 3. 更新最后挖掘时间
      if (job.status === 'completed') {
        await this.updateLastScheduledMiningTime(new Date());
      }

      // 4. 清理旧缓存
      await this.cleanupOldCache();

      this.logger.log(`定时挖掘完成: ${job.id}`);

    } catch (error) {
      this.logger.error(`定时挖掘失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 获取挖掘统计信息
   */
  async getMiningStats(): Promise<MiningStats> {
    try {
      // 1. 获取队列状态
      const waitingJobs = await this.miningQueue.getWaiting();
      const activeJobs = await this.miningQueue.getActive();

      // 2. 获取历史统计
      const stats = await this.getMiningStatisticsFromCache();

      // 3. 实时计算队列大小
      const queueSize = waitingJobs.length + activeJobs.length;

      return {
        totalProcessed: stats.totalProcessed || 0,
        successCount: stats.successCount || 0,
        failureCount: stats.failureCount || 0,
        averageProcessingTime: stats.averageProcessingTime || 0,
        queueSize,
        lastMiningTime: stats.lastMiningTime || new Date(),
      };

    } catch (error) {
      this.logger.error(`获取挖掘统计失败: ${error.message}`);
      return {
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
        averageProcessingTime: 0,
        queueSize: 0,
        lastMiningTime: new Date(),
      };
    }
  }

  /**
   * 获取任务状态
   */
  async getJobStatus(jobId: string): Promise<MiningJob | null> {
    try {
      const cached = await this.redisService.get(`${this.CACHE_PREFIX}job:${jobId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn(`获取任务状态失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 取消挖掘任务
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      // 1. 获取任务状态
      const job = await this.getJobStatus(jobId);
      if (!job || job.status === 'completed') {
        return false;
      }

      // 2. 取消队列中的任务
      const jobs = await this.miningQueue.getJobs(['waiting', 'active']);
      const targetJob = jobs.find(j => j.data.jobId === jobId);

      if (targetJob) {
        await targetJob.remove();
      }

      // 3. 更新任务状态
      job.status = 'failed';
      job.error = '用户取消';
      await this.cacheJobStatus(job);

      this.logger.log(`任务已取消: ${jobId}`);
      return true;

    } catch (error) {
      this.logger.error(`取消任务失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 预处理挖掘配置
   */
  private async preprocessMiningConfig(config: BatchMiningConfig): Promise<void> {
    // 1. 验证记录ID
    if (config.recordIds.length === 0) {
      throw new Error('没有指定要处理的记录');
    }

    // 2. 检查记录是否存在
    const count = await this.chatRecordRepository.count({
      where: { id: { $in: config.recordIds } as any },
    });

    if (count !== config.recordIds.length) {
      throw new Error('部分记录不存在');
    }

    // 3. 验证并发限制
    if (config.concurrencyLimit && config.concurrencyLimit > 10) {
      config.concurrencyLimit = 10; // 最大并发限制
    }

    // 4. 检查质量阈值
    if (config.qualityThreshold < 0 || config.qualityThreshold > 100) {
      config.qualityThreshold = 70; // 默认阈值
    }
  }

  /**
   * 创建分批
   */
  private createBatches(recordIds: number[], batchSize: number): number[][] {
    const batches: number[][] = [];
    for (let i = 0; i < recordIds.length; i += batchSize) {
      batches.push(recordIds.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 添加到挖掘队列
   */
  private async addToMiningQueue(job: MiningJob, batches: number[][]): Promise<void> {
    const concurrencyLimit = job.config.concurrencyLimit || this.DEFAULT_CONCURRENCY;

    for (let i = 0; i < batches.length; i++) {
      await this.miningQueue.add(
        'process-batch',
        {
          jobId: job.id,
          batchIndex: i,
          totalBatches: batches.length,
          recordIds: batches[i],
          config: job.config,
        },
        {
          attempts: 3,
          backoff: 'exponential',
          delay: 1000, // 1秒延迟避免过载
          removeOnComplete: 20,
          removeOnFail: 10,
        }
      );
    }
  }

  /**
   * 缓存任务状态
   */
  private async cacheJobStatus(job: MiningJob): Promise<void> {
    try {
      await this.redisService.setex(
        `${this.CACHE_PREFIX}job:${job.id}`,
        3600, // 1小时缓存
        JSON.stringify(job)
      );
    } catch (error) {
      this.logger.warn(`缓存任务状态失败: ${error.message}`);
    }
  }

  /**
   * 获取需要增量挖掘的记录
   */
  private async getRecordsForIncrementalMining(lastMiningTime?: Date): Promise<AiChatRecord[]> {
    const queryBuilder = this.chatRecordRepository
      .createQueryBuilder('record')
      .where('(record.ocrText IS NOT NULL OR record.rawText IS NOT NULL)')
      .andWhere('record.analysisStatus = :status', { status: '已完成' });

    if (lastMiningTime) {
      queryBuilder.andWhere('record.updateTime > :lastMiningTime', { lastMiningTime });
    } else {
      // 首次运行，限制数量
      queryBuilder.take(100);
    }

    queryBuilder.orderBy('record.updateTime', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * 获取上次定时挖掘时间
   */
  private async getLastScheduledMiningTime(): Promise<Date> {
    try {
      const cached = await this.redisService.get(`${this.CACHE_PREFIX}last_scheduled`);
      return cached ? new Date(cached) : new Date(Date.now() - 24 * 60 * 60 * 1000); // 默认24小时前
    } catch (error) {
      this.logger.warn(`获取上次定时挖掘时间失败: ${error.message}`);
      return new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
  }

  /**
   * 更新最后定时挖掘时间
   */
  private async updateLastScheduledMiningTime(time: Date): Promise<void> {
    try {
      await this.redisService.set(`${this.CACHE_PREFIX}last_scheduled`, time.toISOString());
    } catch (error) {
      this.logger.warn(`更新最后定时挖掘时间失败: ${error.message}`);
    }
  }

  /**
   * 从缓存获取挖掘统计
   */
  private async getMiningStatisticsFromCache(): Promise<any> {
    try {
      const cached = await this.redisService.get(`${this.CACHE_PREFIX}stats`);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      this.logger.warn(`获取挖掘统计缓存失败: ${error.message}`);
      return {};
    }
  }

  /**
   * 清理旧缓存
   */
  private async cleanupOldCache(): Promise<void> {
    try {
      const keys = await this.redisService.keys(`${this.CACHE_PREFIX}job:*`);
      const now = Date.now();

      for (const key of keys) {
        const ttl = await this.redisService.ttl(key);
        if (ttl === -1) { // 没有过期时间的键
          const cached = await this.redisService.get(key);
          if (cached) {
            const job: MiningJob = JSON.parse(cached);
            // 清理24小时前的已完成任务
            if (job.status === 'completed' && now - new Date(job.createdAt).getTime() > 24 * 60 * 60 * 1000) {
              await this.redisService.del(key);
            }
          }
        }
      }

      this.logger.log(`清理了${keys.length}个旧缓存`);

    } catch (error) {
      this.logger.warn(`清理旧缓存失败: ${error.message}`);
    }
  }

  /**
   * 更新挖掘统计
   */
  async updateMiningStats(stats: Partial<MiningStats>): Promise<void> {
    try {
      const currentStats = await this.getMiningStatisticsFromCache();
      const updatedStats = { ...currentStats, ...stats };
      await this.redisService.setex(`${this.CACHE_PREFIX}stats`, 3600, JSON.stringify(updatedStats));
    } catch (error) {
      this.logger.warn(`更新挖掘统计失败: ${error.message}`);
    }
  }

  /**
   * 获取队列健康状态
   */
  async getQueueHealthStatus(): Promise<any> {
    try {
      const waiting = await this.miningQueue.getWaiting();
      const active = await this.miningQueue.getActive();
      const completed = await this.miningQueue.getCompleted();
      const failed = await this.miningQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        health: 'healthy', // 简化的健康状态
      };
    } catch (error) {
      this.logger.error(`获取队列健康状态失败: ${error.message}`);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        health: 'unhealthy',
      };
    }
  }

  /**
   * 重新启动失败的任务
   */
  async restartFailedJobs(): Promise<number> {
    try {
      const failedJobs = await this.miningQueue.getFailed();
      let restartedCount = 0;

      for (const job of failedJobs) {
        // 只重试3次以内的失败任务
        if (job.attemptsMade < 3) {
          await job.retry();
          restartedCount++;
        }
      }

      this.logger.log(`重启了${restartedCount}个失败任务`);
      return restartedCount;

    } catch (error) {
      this.logger.error(`重启失败任务失败: ${error.message}`);
      return 0;
    }
  }
}