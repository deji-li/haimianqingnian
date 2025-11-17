import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  EnterpriseKnowledgeBase,
  KnowledgePendingReview,
} from './entities/index';
import {
  TriggerMiningDto,
  QueryPendingReviewDto,
  ReviewKnowledgeDto,
  BatchReviewDto,
} from './dto/mining-review.dto';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';

@Injectable()
export class MiningKnowledgeService {
  private readonly logger = new Logger(MiningKnowledgeService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(KnowledgePendingReview)
    private readonly pendingReviewRepository: Repository<KnowledgePendingReview>,
    @InjectRepository(AiChatRecord)
    private readonly chatRecordRepository: Repository<AiChatRecord>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 定时任务: 每天凌晨2点自动挖掘
   */
  @Cron('0 2 * * *', {
    name: 'daily-knowledge-mining',
    timeZone: 'Asia/Shanghai',
  })
  async scheduledMining() {
    this.logger.log('定时任务: 开始每日知识挖掘');

    try {
      // 挖掘昨天的聊天记录
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await this.manualTriggerMining(
        {
          startDate: yesterday.toISOString(),
          endDate: today.toISOString(),
          minRounds: 3,
          maxCount: 200,
        },
        0, // 系统自动执行，userId=0
      );

      this.logger.log(`定时任务完成: ${JSON.stringify(result.stats)}`);
    } catch (error) {
      this.logger.error(`定时任务失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 手动触发AI挖掘
   */
  async manualTriggerMining(dto: TriggerMiningDto, userId: number) {
    this.logger.log(`手动触发AI挖掘 - 用户: ${userId}`);

    const batchId = `manual_${Date.now()}`;

    // 1. 查询聊天记录
    const chatRecords = await this.fetchChatRecordsForMining(dto);

    if (chatRecords.length === 0) {
      return {
        success: true,
        message: '没有找到符合条件的聊天记录',
        stats: {
          chatRecordsScanned: 0,
          qaExtracted: 0,
          autoApproved: 0,
          pendingReview: 0,
          discarded: 0,
        },
      };
    }

    this.logger.log(`找到${chatRecords.length}条聊天记录，开始AI挖掘`);

    let extractedCount = 0;
    let approvedCount = 0;
    let reviewCount = 0;
    let discardedCount = 0;

    // 2. 遍历聊天记录，AI提取Q&A
    for (const record of chatRecords) {
      try {
        const qaList = await this.extractQAFromChat(record);

        // 3. 对每个Q&A进行质量评分和分类
        for (const qa of qaList) {
          // 质量评分
          const score = await this.scoreKnowledgeQuality(qa.question, qa.answer);

          // AI分类
          const classification = await this.classifyKnowledge(qa.question, qa.answer);

          if (score >= 80) {
            // 高分直接加入知识库
            await this.knowledgeRepository.save(
              this.knowledgeRepository.create({
                title: qa.question,
                content: qa.answer,
                sceneCategory: classification.category,
                productCategory: classification.productCategory,
                customerType: classification.customerType,
                questionType: classification.questionType,
                sourceType: 'ai_mining',
                sourceId: record.id,
                creatorId: userId,
                status: 'active',
                priority: 60,
              }),
            );
            approvedCount++;
          } else if (score >= 60) {
            // 中等分进入待审核
            await this.pendingReviewRepository.save(
              this.pendingReviewRepository.create({
                question: qa.question,
                answer: qa.answer,
                aiScore: score,
                confidenceScore: qa.confidence || 70,
                sceneCategory: classification.category,
                productCategory: classification.productCategory,
                customerType: classification.customerType,
                questionType: classification.questionType,
                sourceType: 'ai_mining',
                sourceId: record.id,
                miningBatchId: batchId,
                reviewStatus: 'pending',
                miningReason: qa.reason || 'AI挖掘自动提取',
              }),
            );
            reviewCount++;
          } else {
            // <60分直接丢弃
            discardedCount++;
          }

          extractedCount++;
        }
      } catch (error) {
        this.logger.error(`提取聊天记录${record.id}失败: ${error.message}`);
      }
    }

    return {
      success: true,
      message: `AI挖掘完成`,
      batchId,
      stats: {
        chatRecordsScanned: chatRecords.length,
        qaExtracted: extractedCount,
        autoApproved: approvedCount,
        pendingReview: reviewCount,
        discarded: discardedCount,
      },
    };
  }

  /**
   * 查询符合条件的聊天记录
   */
  private async fetchChatRecordsForMining(dto: TriggerMiningDto) {
    const queryBuilder = this.chatRecordRepository.createQueryBuilder('chat');

    // 时间范围
    if (dto.startDate && dto.endDate) {
      queryBuilder.andWhere('chat.createTime BETWEEN :start AND :end', {
        start: new Date(dto.startDate),
        end: new Date(dto.endDate),
      });
    } else {
      // 默认查询最近7天
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      queryBuilder.andWhere('chat.createTime >= :sevenDaysAgo', { sevenDaysAgo });
    }

    // 指定客户
    if (dto.customerIds && dto.customerIds.length > 0) {
      queryBuilder.andWhere('chat.customerId IN (:...customerIds)', {
        customerIds: dto.customerIds,
      });
    }

    // 只查询用户消息
    queryBuilder.andWhere('chat.role = :role', { role: 'user' });

    // 按创建时间排序
    queryBuilder.orderBy('chat.createTime', 'DESC');

    // 限制数量
    const maxCount = dto.maxCount || 100;
    queryBuilder.take(maxCount);

    return await queryBuilder.getMany();
  }

  /**
   * 从聊天记录中提取Q&A（调用AI配置）
   */
  private async extractQAFromChat(chatRecord: AiChatRecord) {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_qa_extraction',
        {
          chatContent: chatRecord.content,
          customerContext: JSON.stringify(chatRecord.context || {}),
        },
      );

      // AI返回格式: { qaList: [{question, answer, category, confidence, reason}] }
      if (result && result.qaList && Array.isArray(result.qaList)) {
        return result.qaList;
      }

      return [];
    } catch (error) {
      this.logger.warn(`AI提取Q&A失败: ${error.message}`);
      return [];
    }
  }

  /**
   * AI分类知识（调用AI配置）
   */
  private async classifyKnowledge(question: string, answer: string) {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_classification',
        {
          question,
          answer,
        },
      );

      return {
        category: result.sceneCategory || '未分类',
        productCategory: result.productCategory || '通用',
        customerType: result.customerType || '全部客户',
        questionType: result.questionType || '咨询',
      };
    } catch (error) {
      this.logger.warn(`AI分类失败: ${error.message}`);
      return {
        category: '未分类',
        productCategory: '通用',
        customerType: '全部客户',
        questionType: '咨询',
      };
    }
  }

  /**
   * AI质量评分（调用AI配置）
   */
  private async scoreKnowledgeQuality(question: string, answer: string): Promise<number> {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_quality_scoring',
        {
          question,
          answer,
        },
      );

      return result.score || 50;
    } catch (error) {
      this.logger.warn(`AI质量评分失败: ${error.message}`);
      return 50;
    }
  }

  /**
   * 查询待审核列表
   */
  async getPendingReviews(query: QueryPendingReviewDto) {
    const {
      page = 1,
      limit = 20,
      reviewStatus,
      sourceType,
      sceneCategory,
      minScore,
      miningBatchId,
    } = query;

    const queryBuilder = this.pendingReviewRepository.createQueryBuilder('pr');

    if (reviewStatus) {
      queryBuilder.andWhere('pr.reviewStatus = :reviewStatus', { reviewStatus });
    } else {
      // 默认只查询待审核
      queryBuilder.andWhere('pr.reviewStatus = :reviewStatus', { reviewStatus: 'pending' });
    }

    if (sourceType) {
      queryBuilder.andWhere('pr.sourceType = :sourceType', { sourceType });
    }

    if (sceneCategory) {
      queryBuilder.andWhere('pr.sceneCategory = :sceneCategory', { sceneCategory });
    }

    if (minScore !== undefined) {
      queryBuilder.andWhere('pr.aiScore >= :minScore', { minScore });
    }

    if (miningBatchId) {
      queryBuilder.andWhere('pr.miningBatchId = :miningBatchId', { miningBatchId });
    }

    const [list, total] = await queryBuilder
      .orderBy('pr.aiScore', 'DESC')
      .addOrderBy('pr.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * 单个审核操作
   */
  async reviewKnowledge(dto: ReviewKnowledgeDto, userId: number) {
    const review = await this.pendingReviewRepository.findOne({
      where: { id: dto.reviewId },
    });

    if (!review) {
      throw new NotFoundException('待审核记录不存在');
    }

    if (review.reviewStatus !== 'pending') {
      throw new BadRequestException('该记录已被审核，不能重复操作');
    }

    switch (dto.action) {
      case 'approve':
        // 直接批准
        await this.approveKnowledge(review, userId);
        await this.pendingReviewRepository.update(dto.reviewId, {
          reviewStatus: 'approved',
          reviewerId: userId,
          reviewTime: new Date(),
        });
        break;

      case 'edit_approve':
        // 编辑后批准
        if (!dto.editedQuestion || !dto.editedAnswer) {
          throw new BadRequestException('编辑模式必须提供问题和答案');
        }
        review.question = dto.editedQuestion;
        review.answer = dto.editedAnswer;

        // 应用手动分类
        if (dto.sceneCategory) review.sceneCategory = dto.sceneCategory;
        if (dto.productCategory) review.productCategory = dto.productCategory;
        if (dto.customerType) review.customerType = dto.customerType;
        if (dto.questionType) review.questionType = dto.questionType;

        await this.approveKnowledge(review, userId, dto.priority);
        await this.pendingReviewRepository.update(dto.reviewId, {
          reviewStatus: 'approved',
          reviewerId: userId,
          reviewTime: new Date(),
          question: dto.editedQuestion,
          answer: dto.editedAnswer,
        });
        break;

      case 'reject':
        // 拒绝
        await this.pendingReviewRepository.update(dto.reviewId, {
          reviewStatus: 'rejected',
          reviewerId: userId,
          reviewTime: new Date(),
          reviewComment: dto.rejectReason,
        });
        break;

      default:
        throw new BadRequestException('不支持的审核操作');
    }

    return {
      success: true,
      message: `审核完成: ${dto.action}`,
    };
  }

  /**
   * 批准知识到知识库
   */
  private async approveKnowledge(review: KnowledgePendingReview, userId: number, priority?: number) {
    const knowledge = this.knowledgeRepository.create({
      title: review.question,
      content: review.answer,
      sceneCategory: review.sceneCategory || '未分类',
      productCategory: review.productCategory,
      customerType: review.customerType,
      questionType: review.questionType,
      sourceType: review.sourceType,
      sourceId: review.sourceId,
      creatorId: userId,
      status: 'active',
      priority: priority || 60,
    });

    await this.knowledgeRepository.save(knowledge);
  }

  /**
   * 批量审核操作
   */
  async batchReview(dto: BatchReviewDto, userId: number) {
    if (dto.reviewIds.length === 0) {
      throw new BadRequestException('审核ID列表不能为空');
    }

    const reviews = await this.pendingReviewRepository.findByIds(dto.reviewIds);

    if (reviews.length === 0) {
      throw new NotFoundException('未找到待审核记录');
    }

    let successCount = 0;

    for (const review of reviews) {
      if (review.reviewStatus !== 'pending') {
        continue; // 跳过已审核的
      }

      try {
        if (dto.action === 'approve') {
          await this.approveKnowledge(review, userId);
          await this.pendingReviewRepository.update(review.id, {
            reviewStatus: 'approved',
            reviewerId: userId,
            reviewTime: new Date(),
          });
        } else if (dto.action === 'reject') {
          await this.pendingReviewRepository.update(review.id, {
            reviewStatus: 'rejected',
            reviewerId: userId,
            reviewTime: new Date(),
            reviewComment: dto.rejectReason,
          });
        }

        successCount++;
      } catch (error) {
        this.logger.error(`批量审核失败 ID=${review.id}: ${error.message}`);
      }
    }

    return {
      success: true,
      message: `批量审核完成: ${successCount}/${dto.reviewIds.length}`,
      successCount,
      totalCount: dto.reviewIds.length,
    };
  }

  /**
   * 获取挖掘统计
   */
  async getMiningStats() {
    // 总挖掘批次（通过miningBatchId去重计数）
    const batches = await this.pendingReviewRepository
      .createQueryBuilder('pr')
      .select('DISTINCT pr.miningBatchId', 'batchId')
      .where('pr.miningBatchId IS NOT NULL')
      .getRawMany();

    const totalMiningTimes = batches.length;

    // 总提取Q&A数量（包括已批准+待审核+已拒绝）
    const totalFromMining = await this.knowledgeRepository.count({
      where: { sourceType: 'ai_mining' },
    });

    const totalPending = await this.pendingReviewRepository.count({
      where: { sourceType: 'ai_mining' },
    });

    const totalQAExtracted = totalFromMining + totalPending;

    // 自动批准数量（status=active, sourceType=ai_mining）
    const autoApprovedCount = await this.knowledgeRepository.count({
      where: { sourceType: 'ai_mining', status: 'active' },
    });

    // 待审核数量
    const pendingReviewCount = await this.pendingReviewRepository.count({
      where: { reviewStatus: 'pending', sourceType: 'ai_mining' },
    });

    // 已拒绝数量
    const rejectedCount = await this.pendingReviewRepository.count({
      where: { reviewStatus: 'rejected', sourceType: 'ai_mining' },
    });

    // 最近一次挖掘时间
    const lastReview = await this.pendingReviewRepository.findOne({
      where: { sourceType: 'ai_mining' },
      order: { createTime: 'DESC' },
    });

    return {
      totalMiningTimes,
      totalQAExtracted,
      autoApprovedCount,
      pendingReviewCount,
      rejectedCount,
      lastMiningTime: lastReview?.createTime,
      nextScheduledTime: '每天凌晨2:00（Asia/Shanghai）',
    };
  }
}
