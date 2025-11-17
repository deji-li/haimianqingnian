import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  EnterpriseKnowledgeBase,
  KnowledgeFeedback,
} from './entities/index';
import {
  SubmitFeedbackDto,
  QueryFeedbackDto,
  HandleFeedbackDto,
  QueryHighNegativeFeedbackDto,
} from './dto/feedback.dto';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';

@Injectable()
export class FeedbackKnowledgeService {
  private readonly logger = new Logger(FeedbackKnowledgeService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(KnowledgeFeedback)
    private readonly feedbackRepository: Repository<KnowledgeFeedback>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 定时任务: 每天凌晨3点自动检查并禁用高负反馈知识（>=5次）
   */
  @Cron('0 3 * * *', {
    name: 'auto-disable-high-negative-feedback',
    timeZone: 'Asia/Shanghai',
  })
  async scheduledAutoDisable() {
    this.logger.log('定时任务: 开始检查高负反馈知识条目');

    try {
      // 查找负反馈次数>=5的知识条目
      const highNegativeKnowledge = await this.knowledgeRepository.find({
        where: {
          negativeFeedbackCount: MoreThanOrEqual(5),
          status: 'active', // 只禁用活跃状态的
        },
      });

      let disabledCount = 0;

      for (const knowledge of highNegativeKnowledge) {
        // 自动禁用
        await this.knowledgeRepository.update(knowledge.id, {
          status: 'auto_disabled',
        });

        this.logger.log(`自动禁用知识ID=${knowledge.id}, 标题="${knowledge.title}", 负反馈次数=${knowledge.negativeFeedbackCount}`);
        disabledCount++;
      }

      this.logger.log(`定时任务完成: 自动禁用${disabledCount}条知识`);

      return { disabledCount };
    } catch (error) {
      this.logger.error(`定时任务失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 提交负面反馈（4个场景通用）
   */
  async submitFeedback(dto: SubmitFeedbackDto, userId: number) {
    this.logger.log(`提交负面反馈 - 知识ID: ${dto.knowledgeId}, 场景: ${dto.feedbackScene}`);

    // 1. 验证知识条目存在
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id: dto.knowledgeId },
    });

    if (!knowledge) {
      throw new NotFoundException('知识库条目不存在');
    }

    // 2. AI分析反馈（调用配置化提示词）
    const aiAnalysisResult = await this.analyzeFeedbackWithAI(dto);

    // 3. 保存反馈记录
    // TODO: Entity fields 'userQuestion' and 'knowledgeAnswer' don't exist
    // Storing them in conversationContext instead
    const feedback = this.feedbackRepository.create({
      knowledgeId: dto.knowledgeId,
      userId,
      customerId: dto.customerId,
      feedbackScene: dto.feedbackScene,
      // userQuestion: dto.userQuestion, // REMOVED: Field doesn't exist in entity
      // knowledgeAnswer: dto.knowledgeAnswer, // REMOVED: Field doesn't exist in entity
      feedbackReason: dto.feedbackReason,
      conversationContext: {
        ...dto.conversationContext,
        userQuestion: dto.userQuestion, // Storing in context instead
        knowledgeAnswer: dto.knowledgeAnswer, // Storing in context instead
        expectedAnswer: dto.expectedAnswer,
      },
      // expectedAnswer: dto.expectedAnswer, // REMOVED: Field doesn't exist, moved to conversationContext
      aiAnalysis: aiAnalysisResult.analysis,
      optimizationSuggestion: aiAnalysisResult.optimizationSuggestion,
      handled: false,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // 4. 更新知识库的负反馈计数
    await this.knowledgeRepository.update(dto.knowledgeId, {
      negativeFeedbackCount: knowledge.negativeFeedbackCount + 1,
    });

    // 5. 检查是否达到自动禁用阈值（>=5次）
    const newNegativeCount = knowledge.negativeFeedbackCount + 1;
    let autoDisabled = false;

    if (newNegativeCount >= 5) {
      await this.knowledgeRepository.update(dto.knowledgeId, {
        status: 'auto_disabled',
      });
      autoDisabled = true;
      this.logger.warn(`知识ID=${dto.knowledgeId}已自动禁用，负反馈次数=${newNegativeCount}`);
    } else if (newNegativeCount >= 3) {
      this.logger.warn(`知识ID=${dto.knowledgeId}负反馈预警，当前次数=${newNegativeCount}`);
    }

    return {
      success: true,
      message: autoDisabled ? '反馈已提交，该知识条目已自动禁用' : '反馈已提交',
      feedbackId: savedFeedback.id,
      autoDisabled,
      currentNegativeCount: newNegativeCount,
      aiAnalysis: aiAnalysisResult,
    };
  }

  /**
   * AI分析反馈（调用配置化提示词）
   */
  private async analyzeFeedbackWithAI(dto: SubmitFeedbackDto) {
    try {
      this.logger.log('AI分析反馈中...');

      const result = await this.aiConfigCallerService.callAI(
        'knowledge_optimization',
        {
          userQuestion: dto.userQuestion,
          knowledgeAnswer: dto.knowledgeAnswer,
          feedbackReason: dto.feedbackReason || '用户未提供具体原因',
          expectedAnswer: dto.expectedAnswer || '未提供',
          conversationContext: JSON.stringify(dto.conversationContext || {}),
        },
      );

      return {
        analysis: result.analysis || '无AI分析',
        optimizationSuggestion: result.optimizationSuggestion || '暂无优化建议',
        severity: result.severity || 'medium', // low, medium, high
        suggestedAction: result.suggestedAction || 'review', // review, update, disable
      };
    } catch (error) {
      this.logger.error(`AI分析反馈失败: ${error.message}`);
      return {
        analysis: 'AI分析失败',
        optimizationSuggestion: '请人工审核',
        severity: 'medium',
        suggestedAction: 'review',
      };
    }
  }

  /**
   * 查询反馈列表
   */
  async getFeedbackList(query: QueryFeedbackDto) {
    const {
      page = 1,
      limit = 20,
      knowledgeId,
      feedbackScene,
      customerId,
      handled,
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.feedbackRepository.createQueryBuilder('fb');

    if (knowledgeId) {
      queryBuilder.andWhere('fb.knowledgeId = :knowledgeId', { knowledgeId });
    }

    if (feedbackScene) {
      queryBuilder.andWhere('fb.feedbackScene = :feedbackScene', { feedbackScene });
    }

    if (customerId) {
      queryBuilder.andWhere('fb.customerId = :customerId', { customerId });
    }

    if (handled !== undefined) {
      queryBuilder.andWhere('fb.handled = :handled', { handled });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('fb.createTime BETWEEN :start AND :end', {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    }

    // 关联知识库信息
    queryBuilder.leftJoinAndSelect('fb.knowledge', 'knowledge');

    const [list, total] = await queryBuilder
      .orderBy('fb.createTime', 'DESC')
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
   * 处理反馈
   */
  async handleFeedback(dto: HandleFeedbackDto, userId: number) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: dto.feedbackId },
      relations: ['knowledge'],
    });

    if (!feedback) {
      throw new NotFoundException('反馈记录不存在');
    }

    if (feedback.handled) {
      throw new BadRequestException('该反馈已被处理');
    }

    const knowledge = await this.knowledgeRepository.findOne({
      where: { id: feedback.knowledgeId },
    });

    if (!knowledge) {
      throw new NotFoundException('关联的知识库条目不存在');
    }

    switch (dto.action) {
      case 'update_knowledge':
        // 更新知识内容
        if (!dto.updatedAnswer) {
          throw new BadRequestException('更新操作必须提供新的答案');
        }

        await this.knowledgeRepository.update(feedback.knowledgeId, {
          content: dto.updatedAnswer,
        });

        await this.feedbackRepository.update(dto.feedbackId, {
          handled: true,
          handlerId: userId,
          handleTime: new Date(),
          // handleAction: 'updated', // REMOVED: Field doesn't exist - using handleResult instead
          handleResult: `已更新知识库内容${dto.handlerNote ? ': ' + dto.handlerNote : ''}`,
        });

        this.logger.log(`更新知识ID=${feedback.knowledgeId}内容`);
        break;

      case 'disable_knowledge':
        // 手动禁用知识
        await this.knowledgeRepository.update(feedback.knowledgeId, {
          status: 'inactive',
        });

        await this.feedbackRepository.update(dto.feedbackId, {
          handled: true,
          handlerId: userId,
          handleTime: new Date(),
          // handleAction: 'disabled', // REMOVED: Field doesn't exist - using handleResult instead
          handleResult: `已禁用知识库${dto.handlerNote ? ': ' + dto.handlerNote : ''}`,
        });

        this.logger.log(`手动禁用知识ID=${feedback.knowledgeId}`);
        break;

      case 'ignore':
        // 忽略反馈
        await this.feedbackRepository.update(dto.feedbackId, {
          handled: true,
          handlerId: userId,
          handleTime: new Date(),
          // handleAction: 'ignored', // REMOVED: Field doesn't exist - using handleResult instead
          handleResult: `已忽略反馈${dto.handlerNote ? ': ' + dto.handlerNote : ''}`,
        });

        this.logger.log(`忽略反馈ID=${dto.feedbackId}`);
        break;

      default:
        throw new BadRequestException('不支持的处理操作');
    }

    return {
      success: true,
      message: `反馈处理完成: ${dto.action}`,
    };
  }

  /**
   * 获取反馈统计
   */
  async getFeedbackStats() {
    // 总反馈数
    const totalFeedbackCount = await this.feedbackRepository.count();

    // 各场景反馈数
    const aiChatFeedbackCount = await this.feedbackRepository.count({
      where: { feedbackScene: 'ai_chat' },
    });

    const knowledgeSearchFeedbackCount = await this.feedbackRepository.count({
      where: { feedbackScene: 'knowledge_search' },
    });

    const aiAnalysisFeedbackCount = await this.feedbackRepository.count({
      where: { feedbackScene: 'ai_analysis' },
    });

    const aiRecommendationFeedbackCount = await this.feedbackRepository.count({
      where: { feedbackScene: 'ai_recommendation' },
    });

    // 已处理/待处理
    const handledFeedbackCount = await this.feedbackRepository.count({
      where: { handled: true },
    });

    const pendingFeedbackCount = await this.feedbackRepository.count({
      where: { handled: false },
    });

    // 高负反馈知识条目数（>=3次）
    const highNegativeFeedbackKnowledgeCount = await this.knowledgeRepository.count({
      where: {
        negativeFeedbackCount: MoreThanOrEqual(3),
        status: 'active',
      },
    });

    // 自动禁用知识条目数（>=5次）
    const autoDisabledKnowledgeCount = await this.knowledgeRepository.count({
      where: { status: 'auto_disabled' },
    });

    return {
      totalFeedbackCount,
      aiChatFeedbackCount,
      knowledgeSearchFeedbackCount,
      aiAnalysisFeedbackCount,
      aiRecommendationFeedbackCount,
      handledFeedbackCount,
      pendingFeedbackCount,
      highNegativeFeedbackKnowledgeCount,
      autoDisabledKnowledgeCount,
    };
  }

  /**
   * 获取高负反馈知识列表
   */
  async getHighNegativeFeedbackKnowledge(query: QueryHighNegativeFeedbackDto) {
    const {
      page = 1,
      limit = 20,
      minNegativeFeedbackCount = 3,
      status,
    } = query;

    const queryBuilder = this.knowledgeRepository.createQueryBuilder('kb');

    queryBuilder.andWhere('kb.negativeFeedbackCount >= :minCount', {
      minCount: minNegativeFeedbackCount,
    });

    if (status) {
      queryBuilder.andWhere('kb.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('kb.negativeFeedbackCount', 'DESC')
      .addOrderBy('kb.updateTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 为每个知识条目附加最近的反馈记录
    const listWithFeedback = await Promise.all(
      list.map(async (knowledge) => {
        const recentFeedbacks = await this.feedbackRepository.find({
          where: { knowledgeId: knowledge.id },
          order: { createTime: 'DESC' },
          take: 3,
        });

        return {
          ...knowledge,
          recentFeedbacks,
        };
      }),
    );

    return {
      list: listWithFeedback,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
