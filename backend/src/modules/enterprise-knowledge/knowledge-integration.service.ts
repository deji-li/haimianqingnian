import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnterpriseKnowledgeBase } from './entities/index';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';
import { KnowledgeUsageService } from './knowledge-usage.service';

/**
 * 知识库集成服务
 * 提供统一接口供其他模块（AI聊天、分析、推荐等）调用
 */
@Injectable()
export class KnowledgeIntegrationService {
  private readonly logger = new Logger(KnowledgeIntegrationService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    private readonly aiConfigCallerService: AiConfigCallerService,
    private readonly knowledgeUsageService: KnowledgeUsageService,
  ) {}

  /**
   * 查询知识库并返回AI决策结果
   * 供AI聊天助手调用
   */
  async queryKnowledgeForAiChat(params: {
    userQuestion: string;
    conversationContext?: any;
    customerId?: number;
    userId?: number;
  }) {
    this.logger.log(`AI聊天查询知识库: ${params.userQuestion}`);

    // 1. 提取关键词并搜索候选知识
    const candidates = await this.searchCandidateKnowledge(params.userQuestion);

    if (candidates.length === 0) {
      this.logger.log('未找到相关知识，返回AI生成模式');
      return {
        decision: 'generate',
        knowledgeUsed: false,
        knowledge: null,
        reason: '知识库中未找到相关内容',
      };
    }

    // 2. AI决策：如何使用知识库（direct/hybrid/generate）
    const decision = await this.makeUsageDecision(
      params.userQuestion,
      candidates,
      params.conversationContext,
    );

    // 3. 根据决策返回结果
    const result = await this.handleDecision(decision, candidates, params);

    return result;
  }

  /**
   * 搜索候选知识库条目
   */
  private async searchCandidateKnowledge(question: string, limit: number = 5) {
    // 提取关键词
    const keywords = this.extractKeywords(question);

    if (keywords.length === 0) {
      return [];
    }

    const queryBuilder = this.knowledgeRepository
      .createQueryBuilder('kb')
      .where('kb.status = :status', { status: 'active' });

    // 构建OR条件
    keywords.forEach((keyword, index) => {
      if (index === 0) {
        queryBuilder.andWhere(
          '(kb.title LIKE :kw0 OR kb.content LIKE :kw0 OR kb.keywords LIKE :kw0)',
          { kw0: `%${keyword}%` },
        );
      } else {
        queryBuilder.orWhere(
          `(kb.title LIKE :kw${index} OR kb.content LIKE :kw${index} OR kb.keywords LIKE :kw${index})`,
          { [`kw${index}`]: `%${keyword}%` },
        );
      }
    });

    const candidates = await queryBuilder
      .orderBy('kb.priority', 'DESC')
      .addOrderBy('kb.usageCount', 'DESC')
      .take(limit)
      .getMany();

    return candidates;
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const regex = /[\u4e00-\u9fa5]{2,4}/g;
    const matches = text.match(regex);

    if (matches) {
      keywords.push(...matches);
    }

    return [...new Set(keywords)]; // 去重
  }

  /**
   * AI决策：如何使用知识库（调用配置化提示词）
   */
  private async makeUsageDecision(
    userQuestion: string,
    candidates: EnterpriseKnowledgeBase[],
    conversationContext?: any,
  ) {
    try {
      // 格式化候选知识库
      const knowledgeList = candidates
        .map((k, i) => `${i + 1}. ID:${k.id} 标题：${k.title}\n   内容：${k.content.substring(0, 150)}...`)
        .join('\n\n');

      // 调用AI决策配置
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_usage_decision',
        {
          userQuestion,
          knowledgeList,
          conversationContext: JSON.stringify(conversationContext || {}),
        },
      );

      return {
        decision: result.decision || 'generate', // direct, hybrid, generate
        selectedKnowledgeIds: result.selectedKnowledgeIds || [],
        reason: result.reason || '',
        confidence: result.confidence || 50,
      };
    } catch (error) {
      this.logger.error(`AI决策失败: ${error.message}`);
      // 降级：默认使用第一个候选
      return {
        decision: 'direct',
        selectedKnowledgeIds: candidates.length > 0 ? [candidates[0].id] : [],
        reason: 'AI决策失败，使用默认策略',
        confidence: 70,
      };
    }
  }

  /**
   * 处理AI决策结果
   */
  private async handleDecision(
    decision: any,
    candidates: EnterpriseKnowledgeBase[],
    params: any,
  ) {
    switch (decision.decision) {
      case 'direct':
        // 直接使用知识库答案
        const directKnowledge = candidates.find((k) =>
          decision.selectedKnowledgeIds.includes(k.id),
        ) || candidates[0];

        // 记录使用日志
        await this.knowledgeUsageService.logUsage({
          knowledgeId: directKnowledge.id,
          userId: params.userId,
          customerId: params.customerId,
          usageScene: 'ai_chat',
          userQuestion: params.userQuestion,
          matchScore: decision.confidence,
        });

        return {
          decision: 'direct',
          knowledgeUsed: true,
          knowledge: {
            id: directKnowledge.id,
            title: directKnowledge.title,
            content: directKnowledge.content,
            category: directKnowledge.sceneCategory,
          },
          reason: decision.reason,
          suggestedAnswer: directKnowledge.content,
        };

      case 'hybrid':
        // 混合模式：知识库作为参考，AI进行整合
        const hybridKnowledge = candidates.filter((k) =>
          decision.selectedKnowledgeIds.includes(k.id),
        );

        // 批量记录使用
        await this.knowledgeUsageService.logBatchUsage(
          hybridKnowledge.map((k) => ({
            knowledgeId: k.id,
            userId: params.userId,
            customerId: params.customerId,
            usageScene: 'ai_chat',
            userQuestion: params.userQuestion,
            matchScore: decision.confidence,
          })),
        );

        // 组合知识库内容供AI参考
        const referenceContent = hybridKnowledge
          .map((k) => `【${k.title}】\n${k.content}`)
          .join('\n\n---\n\n');

        return {
          decision: 'hybrid',
          knowledgeUsed: true,
          knowledge: hybridKnowledge.map((k) => ({
            id: k.id,
            title: k.title,
            content: k.content,
          })),
          reason: decision.reason,
          referenceContent, // AI可以基于此内容生成回答
        };

      case 'generate':
      default:
        // 完全AI生成（知识库无法提供有价值的信息）
        return {
          decision: 'generate',
          knowledgeUsed: false,
          knowledge: null,
          reason: decision.reason || '知识库中未找到相关内容，建议AI直接生成',
        };
    }
  }

  /**
   * 查询知识库用于分析报告
   */
  async queryKnowledgeForAnalysis(params: {
    topic: string;
    category?: string;
    customerId?: number;
    userId?: number;
  }) {
    this.logger.log(`分析报告查询知识库: ${params.topic}`);

    const queryBuilder = this.knowledgeRepository
      .createQueryBuilder('kb')
      .where('kb.status = :status', { status: 'active' });

    // 按主题搜索
    const keywords = this.extractKeywords(params.topic);
    keywords.forEach((keyword, index) => {
      if (index === 0) {
        queryBuilder.andWhere(
          '(kb.title LIKE :kw0 OR kb.content LIKE :kw0 OR kb.keywords LIKE :kw0)',
          { kw0: `%${keyword}%` },
        );
      } else {
        queryBuilder.orWhere(
          `(kb.title LIKE :kw${index} OR kb.content LIKE :kw${index} OR kb.keywords LIKE :kw${index})`,
          { [`kw${index}`]: `%${keyword}%` },
        );
      }
    });

    // 如果指定分类
    if (params.category) {
      queryBuilder.andWhere('kb.sceneCategory = :category', { category: params.category });
    }

    const knowledge = await queryBuilder
      .orderBy('kb.priority', 'DESC')
      .take(10)
      .getMany();

    // 记录使用日志
    if (knowledge.length > 0) {
      await this.knowledgeUsageService.logBatchUsage(
        knowledge.map((k) => ({
          knowledgeId: k.id,
          userId: params.userId,
          customerId: params.customerId,
          usageScene: 'ai_analysis',
          userQuestion: params.topic,
        })),
      );
    }

    return knowledge;
  }

  /**
   * 查询知识库用于推荐
   */
  async queryKnowledgeForRecommendation(params: {
    customerId: number;
    context?: any;
    userId?: number;
  }) {
    this.logger.log(`推荐查询知识库 - 客户: ${params.customerId}`);

    // 获取热门知识
    const hotKnowledge = await this.knowledgeRepository.find({
      where: { status: 'active' },
      order: { usageCount: 'DESC', priority: 'DESC' },
      take: 10,
    });

    // 记录使用日志
    if (hotKnowledge.length > 0) {
      await this.knowledgeUsageService.logBatchUsage(
        hotKnowledge.map((k) => ({
          knowledgeId: k.id,
          userId: params.userId,
          customerId: params.customerId,
          usageScene: 'ai_recommendation',
          userQuestion: '智能推荐',
        })),
      );
    }

    return hotKnowledge;
  }
}
