import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EnterpriseKnowledgeBase,
  KnowledgeUsageLog,
} from './entities/index';

@Injectable()
export class KnowledgeUsageService {
  private readonly logger = new Logger(KnowledgeUsageService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(KnowledgeUsageLog)
    private readonly usageLogRepository: Repository<KnowledgeUsageLog>,
  ) {}

  /**
   * 记录知识库使用日志
   */
  async logUsage(data: {
    knowledgeId: number;
    userId?: number;
    customerId?: number;
    usageScene: 'ai_chat' | 'knowledge_search' | 'ai_analysis' | 'ai_recommendation' | 'manual_query';
    userQuestion: string;
    matchScore?: number;
    responseTime?: number;
    satisfied?: boolean;
  }) {
    try {
      // 创建日志记录
      // TODO: Entity uses matchedKnowledgeIds (array) instead of knowledgeId (single)
      const log = this.usageLogRepository.create({
        matchedKnowledgeIds: data.knowledgeId ? [data.knowledgeId] : [], // Using matchedKnowledgeIds array instead of knowledgeId
        userId: data.userId,
        customerId: data.customerId,
        usageScene: data.usageScene,
        queryText: data.userQuestion, // Using queryText instead of userQuestion
        // matchScore: data.matchScore, // REMOVED: Field doesn't exist in entity
        // responseTime: data.responseTime, // REMOVED: Field doesn't exist in entity
        // satisfied: data.satisfied, // REMOVED: Field doesn't exist in entity
      });

      await this.usageLogRepository.save(log);

      // 更新知识库统计
      await this.knowledgeRepository.update(data.knowledgeId, {
        usageCount: () => 'usageCount + 1',
        lastUsedTime: new Date(),
      });

      this.logger.log(`记录知识库使用 - ID: ${data.knowledgeId}, 场景: ${data.usageScene}`);
    } catch (error) {
      this.logger.error(`记录使用日志失败: ${error.message}`, error.stack);
      // 日志记录失败不影响主流程
    }
  }

  /**
   * 批量记录知识库使用
   */
  async logBatchUsage(usages: Array<{
    knowledgeId: number;
    userId?: number;
    customerId?: number;
    usageScene: string;
    userQuestion: string;
    matchScore?: number;
  }>) {
    try {
      const logs = usages.map((usage) =>
        this.usageLogRepository.create(usage),
      );

      await this.usageLogRepository.save(logs);

      // 批量更新使用次数（使用原始SQL更高效）
      for (const usage of usages) {
        await this.knowledgeRepository.update(usage.knowledgeId, {
          usageCount: () => 'usageCount + 1',
          lastUsedTime: new Date(),
        });
      }

      this.logger.log(`批量记录使用日志 - 数量: ${usages.length}`);
    } catch (error) {
      this.logger.error(`批量记录使用日志失败: ${error.message}`);
    }
  }

  /**
   * 获取知识库使用统计
   */
  async getUsageStats(knowledgeId: number) {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id: knowledgeId },
    });

    if (!knowledge) {
      return null;
    }

    // 按场景统计
    const usageByScene = await this.usageLogRepository
      .createQueryBuilder('log')
      .select('log.usageScene', 'scene')
      .addSelect('COUNT(*)', 'count')
      .where('log.knowledgeId = :knowledgeId', { knowledgeId })
      .groupBy('log.usageScene')
      .getRawMany();

    // 最近7天使用趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsage = await this.usageLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.createTime)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('log.knowledgeId = :knowledgeId', { knowledgeId })
      .andWhere('log.createTime >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(log.createTime)')
      .orderBy('DATE(log.createTime)', 'ASC')
      .getRawMany();

    // 平均匹配分数
    const avgScore = await this.usageLogRepository
      .createQueryBuilder('log')
      .select('AVG(log.matchScore)', 'avgScore')
      .where('log.knowledgeId = :knowledgeId', { knowledgeId })
      .andWhere('log.matchScore IS NOT NULL')
      .getRawOne();

    return {
      knowledgeId,
      title: knowledge.title,
      totalUsageCount: knowledge.usageCount,
      lastUsedTime: knowledge.lastUsedTime,
      usageByScene: usageByScene.map((row) => ({
        scene: row.scene,
        count: parseInt(row.count),
      })),
      recentUsage: recentUsage.map((row) => ({
        date: row.date,
        count: parseInt(row.count),
      })),
      averageMatchScore: avgScore?.avgScore ? parseFloat(avgScore.avgScore) : null,
    };
  }

  /**
   * 获取热门知识库列表
   */
  async getHotKnowledge(limit: number = 10) {
    const hotKnowledge = await this.knowledgeRepository.find({
      where: { status: 'active' },
      order: { usageCount: 'DESC' },
      take: limit,
    });

    return hotKnowledge;
  }

  /**
   * 获取全局使用统计
   */
  async getGlobalUsageStats() {
    // 总使用次数
    const totalUsage = await this.usageLogRepository.count();

    // 按场景统计
    const usageByScene = await this.usageLogRepository
      .createQueryBuilder('log')
      .select('log.usageScene', 'scene')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.usageScene')
      .getRawMany();

    // 今天使用次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsage = await this.usageLogRepository
      .createQueryBuilder('log')
      .where('log.createTime >= :today', { today })
      .getCount();

    // 最近7天使用趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrend = await this.usageLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.createTime)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('log.createTime >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(log.createTime)')
      .orderBy('DATE(log.createTime)', 'ASC')
      .getRawMany();

    // 热门知识Top10
    const hotKnowledge = await this.getHotKnowledge(10);

    return {
      totalUsage,
      todayUsage,
      usageByScene: usageByScene.map((row) => ({
        scene: row.scene,
        count: parseInt(row.count),
      })),
      recentTrend: recentTrend.map((row) => ({
        date: row.date,
        count: parseInt(row.count),
      })),
      hotKnowledge,
    };
  }
}
