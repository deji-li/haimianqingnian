import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EnterpriseKnowledgeBase, KnowledgeUsageLog } from '../entities/index';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';

/**
 * 知识库增强的AI服务
 * 实现知识库作为AI底座的核心功能：
 * 1. 混合模式AI回答（基于知识库 + 通用AI）
 * 2. 智能知识检索和匹配
 * 3. 知识引用和来源追踪
 * 4. AI功能反哺知识库
 */
export interface EnhancedAIRequest {
  query: string;
  context?: any;
  functionType: 'AI_ASSISTANT' | 'CUSTOMER_ANALYSIS' | 'MARKETING_ADVICE' | 'KNOWLEDGE_MINING';
  userId?: number;
  customerId?: number;
  useKnowledgeBase?: boolean; // 是否使用知识库增强
}

export interface EnhancedAIResponse {
  content: string;
  knowledgeSources?: Array<{
    id: number;
    title: string;
    relevanceScore: number;
    usedSections: string[];
  }>;
  confidence: number;
  responseStrategy: 'KNOWLEDGE_BASED' | 'KNOWLEDGE_ENHANCED' | 'GENERAL_AI';
  processingTime: number;
  metadata?: any;
}

export interface KnowledgeSearchResult {
  knowledge: EnterpriseKnowledgeBase;
  relevanceScore: number;
  matchedSections: string[];
  matchReason: string;
}

@Injectable()
export class KnowledgeEnhancedAIService {
  private readonly logger = new Logger(KnowledgeEnhancedAIService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(KnowledgeUsageLog)
    private readonly usageLogRepository: Repository<KnowledgeUsageLog>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 生成增强的AI响应
   */
  async generateEnhancedResponse(request: EnhancedAIRequest): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    this.logger.log(`生成增强AI响应 - 功能: ${request.functionType}, 查询: ${request.query.substring(0, 50)}...`);

    try {
      // 1. 搜索相关知识
      const knowledgeResults = await this.searchRelevantKnowledge(request);

      // 2. 确定响应策略
      const responseStrategy = this.determineResponseStrategy(knowledgeResults, request);

      // 3. 生成响应
      let response: EnhancedAIResponse;

      switch (responseStrategy) {
        case 'KNOWLEDGE_BASED':
          response = await this.generateKnowledgeBasedResponse(request, knowledgeResults);
          break;
        case 'KNOWLEDGE_ENHANCED':
          response = await this.generateKnowledgeEnhancedResponse(request, knowledgeResults);
          break;
        case 'GENERAL_AI':
          response = await this.generateGeneralAIResponse(request);
          break;
        default:
          throw new Error(`不支持的响应策略: ${responseStrategy}`);
      }

      // 4. 记录使用日志
      await this.logUsage(request, response, knowledgeResults);

      // 5. 计算处理时间
      response.processingTime = Date.now() - startTime;

      return response;

    } catch (error) {
      this.logger.error(`生成增强AI响应失败: ${error.message}`, error.stack);

      // 降级到基础AI响应
      return {
        content: '抱歉，AI服务暂时不可用，请稍后再试。',
        confidence: 0,
        responseStrategy: 'GENERAL_AI',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 搜索相关知识
   */
  private async searchRelevantKnowledge(request: EnhancedAIRequest): Promise<KnowledgeSearchResult[]> {
    if (!request.useKnowledgeBase && request.useKnowledgeBase !== undefined) {
      return [];
    }

    try {
      // 1. 提取关键词
      const keywords = await this.extractKeywords(request.query);

      // 2. 构建搜索查询
      const searchResults = await this.knowledgeRepository
        .createQueryBuilder('kb')
        .where('kb.status = :status', { status: 'active' })
        .andWhere(
          '(kb.title LIKE :keyword OR kb.content LIKE :keyword OR kb.keywords LIKE :keyword)',
          { keyword: `%${keywords[0]}%` }
        )
        .orderBy('kb.priority', 'DESC')
        .addOrderBy('kb.qualityScore', 'DESC')
        .limit(10)
        .getMany();

      // 3. 计算相关度评分
      const scoredResults: KnowledgeSearchResult[] = [];

      for (const knowledge of searchResults) {
        const relevanceScore = this.calculateRelevanceScore(request.query, knowledge, keywords);

        if (relevanceScore > 0.3) { // 只保留相关度大于30%的结果
          scoredResults.push({
            knowledge,
            relevanceScore,
            matchedSections: await this.extractMatchedSections(request.query, knowledge),
            matchReason: this.getMatchReason(request.query, knowledge, relevanceScore),
          });
        }
      }

      // 4. 按相关度排序
      scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return scoredResults.slice(0, 5); // 返回最相关的5条

    } catch (error) {
      this.logger.warn(`知识搜索失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 确定响应策略
   */
  private determineResponseStrategy(
    knowledgeResults: KnowledgeSearchResult[],
    request: EnhancedAIRequest,
  ): string {
    const hasRelevantKnowledge = knowledgeResults.length > 0 &&
                                  knowledgeResults[0].relevanceScore > 0.7;

    const hasSomeKnowledge = knowledgeResults.length > 0 &&
                             knowledgeResults[0].relevanceScore > 0.4;

    const isStructuredQuery = this.isStructuredBusinessQuery(request.query);

    // 决策逻辑
    if (hasRelevantKnowledge && isStructuredQuery) {
      return 'KNOWLEDGE_BASED'; // 基于知识库回答
    } else if (hasSomeKnowledge) {
      return 'KNOWLEDGE_ENHANCED'; // 知识库增强回答
    } else {
      return 'GENERAL_AI'; // 通用AI回答
    }
  }

  /**
   * 生成基于知识库的响应
   */
  private async generateKnowledgeBasedResponse(
    request: EnhancedAIRequest,
    knowledgeResults: KnowledgeSearchResult[],
  ): Promise<EnhancedAIResponse> {
    const primaryKnowledge = knowledgeResults[0];
    const secondaryKnowledge = knowledgeResults.slice(1, 3);

    try {
      // 使用知识库内容生成回答
      const prompt = `
        基于以下知识库内容，回答用户问题：

        用户问题：${request.query}

        主要知识：
        标题：${primaryKnowledge.knowledge.title}
        内容：${primaryKnowledge.knowledge.content}

        ${secondaryKnowledge.length > 0 ? `
        补充知识：
        ${secondaryKnowledge.map(k => `- ${k.knowledge.title}: ${k.knowledge.content.substring(0, 200)}...`).join('\n')}
        ` : ''}

        请基于这些知识，直接、准确地回答用户问题。如果知识内容不够完整，可以适当补充，但要保持与知识库内容一致。
      `;

      const aiResponse = await this.aiConfigCallerService.callAI(
        'knowledge_based_response',
        {
          prompt,
          context: request.context,
          functionType: request.functionType,
        },
      );

      return {
        content: aiResponse.content || aiResponse.answer,
        knowledgeSources: knowledgeResults.map(kr => ({
          id: kr.knowledge.id,
          title: kr.knowledge.title,
          relevanceScore: kr.relevanceScore,
          usedSections: kr.matchedSections,
        })),
        confidence: Math.max(primaryKnowledge.relevanceScore, 0.8),
        responseStrategy: 'KNOWLEDGE_BASED',
        processingTime: 0, // 将在调用方设置
        metadata: {
          primaryKnowledgeId: primaryKnowledge.knowledge.id,
          knowledgeCount: knowledgeResults.length,
        },
      };

    } catch (error) {
      this.logger.error(`生成基于知识库的响应失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成知识库增强的响应
   */
  private async generateKnowledgeEnhancedResponse(
    request: EnhancedAIRequest,
    knowledgeResults: KnowledgeSearchResult[],
  ): Promise<EnhancedAIResponse> {
    try {
      // 将知识库内容作为上下文，结合通用AI
      const knowledgeContext = knowledgeResults.map(kr => ({
        title: kr.knowledge.title,
        content: kr.knowledge.content,
        relevance: kr.relevanceScore,
      }));

      const prompt = `
        用户问题：${request.query}

        参考知识：
        ${knowledgeContext.map(k => `
        ${k.title}（相关度：${Math.round(k.relevance * 100)}%）：
        ${k.content}
        `).join('\n')}

        请结合以上知识库内容，回答用户问题。如果知识库内容不足，可以基于通用知识进行补充，但要明确区分哪些是来自知识库，哪些是补充内容。
      `;

      const aiResponse = await this.aiConfigCallerService.callAI(
        'knowledge_enhanced_response',
        {
          prompt,
          context: { ...request.context, knowledgeContext },
          functionType: request.functionType,
        },
      );

      return {
        content: aiResponse.content || aiResponse.answer,
        knowledgeSources: knowledgeResults.map(kr => ({
          id: kr.knowledge.id,
          title: kr.knowledge.title,
          relevanceScore: kr.relevanceScore,
          usedSections: kr.matchedSections,
        })),
        confidence: 0.7, // 增强模式的中等置信度
        responseStrategy: 'KNOWLEDGE_ENHANCED',
        processingTime: 0,
        metadata: {
          knowledgeCount: knowledgeResults.length,
          hasSupplementaryContent: true,
        },
      };

    } catch (error) {
      this.logger.error(`生成知识库增强响应失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成通用AI响应
   */
  private async generateGeneralAIResponse(request: EnhancedAIRequest): Promise<EnhancedAIResponse> {
    try {
      const prompt = `
        ${request.functionType === 'AI_ASSISTANT' ? '作为AI助手，' : ''}
        ${request.functionType === 'CUSTOMER_ANALYSIS' ? '作为客户分析专家，' : ''}
        ${request.functionType === 'MARKETING_ADVICE' ? '作为营销顾问，' : ''}
        请回答以下问题：

        ${request.query}
      `;

      const aiResponse = await this.aiConfigCallerService.callAI(
        'general_ai_response',
        {
          prompt,
          context: request.context,
          functionType: request.functionType,
        },
      );

      return {
        content: aiResponse.content || aiResponse.answer,
        confidence: 0.6, // 通用AI的较低置信度
        responseStrategy: 'GENERAL_AI',
        processingTime: 0,
        metadata: {
          noKnowledgeFound: true,
        },
      };

    } catch (error) {
      this.logger.error(`生成通用AI响应失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 提取关键词
   */
  private async extractKeywords(query: string): Promise<string[]> {
    // 简单的关键词提取（实际应用中可以使用更复杂的NLP算法）
    const stopWords = ['的', '了', '是', '在', '有', '和', '与', '或', '但', '而', '等'];

    return query
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .slice(0, 5);
  }

  /**
   * 计算相关度评分
   */
  private calculateRelevanceScore(
    query: string,
    knowledge: EnterpriseKnowledgeBase,
    keywords: string[],
  ): number {
    let score = 0;

    // 标题匹配（权重最高）
    for (const keyword of keywords) {
      if (knowledge.title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.4;
      }
    }

    // 内容匹配
    const contentLower = knowledge.content.toLowerCase();
    const queryLower = query.toLowerCase();

    // 完整查询匹配
    if (contentLower.includes(queryLower)) {
      score += 0.3;
    }

    // 关键词匹配
    for (const keyword of keywords) {
      const matches = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      score += Math.min(matches * 0.1, 0.3);
    }

    // 质量和优先级加权
    score *= (1 + (knowledge.qualityScore / 200)) * (1 + (knowledge.priority / 200));

    return Math.min(score, 1);
  }

  /**
   * 提取匹配的文本片段
   */
  private async extractMatchedSections(query: string, knowledge: EnterpriseKnowledgeBase): Promise<string[]> {
    const sections: string[] = [];
    const sentences = knowledge.content.split(/[。！？]/).filter(s => s.trim().length > 0);

    const keywords = await this.extractKeywords(query);

    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(query.toLowerCase()) ||
          keywords.some(keyword =>
            sentence.toLowerCase().includes(keyword.toLowerCase())
          )) {
        sections.push(sentence.trim());
      }
    }

    return sections.slice(0, 3); // 最多返回3个相关片段
  }

  /**
   * 获取匹配原因
   */
  private getMatchReason(query: string, knowledge: EnterpriseKnowledgeBase, score: number): string {
    if (score > 0.8) {
      return '高度匹配';
    } else if (score > 0.6) {
      return '较好匹配';
    } else if (score > 0.4) {
      return '一般匹配';
    } else {
      return '弱匹配';
    }
  }

  /**
   * 判断是否为结构化业务查询
   */
  private isStructuredBusinessQuery(query: string): boolean {
    const businessKeywords = [
      '价格', '费用', '收费', '多少钱', '成本',
      '课程', '培训', '学习', '教育',
      '老师', '师资', '教学', '质量',
      '时间', '安排', ' schedule ', '什么时候',
      '报名', '入学', '注册', '申请',
      '效果', '成果', '提升', '进步',
      '适合', '年龄', '基础', '要求',
    ];

    return businessKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * 记录使用日志
   */
  private async logUsage(
    request: EnhancedAIRequest,
    response: EnhancedAIResponse,
    knowledgeResults: KnowledgeSearchResult[],
  ): Promise<void> {
    try {
      const usageLog = this.usageLogRepository.create({
        userId: request.userId || 0,
        customerId: request.customerId,
        functionType: request.functionType,
        query: request.query,
        response: response.content,
        knowledgeId: response.knowledgeSources?.[0]?.id,
        hasKnowledge: response.knowledgeSources && response.knowledgeSources.length > 0,
        responseStrategy: response.responseStrategy,
        confidence: response.confidence,
        usageTime: new Date(),
      });

      await this.usageLogRepository.save(usageLog);

      // 更新知识使用次数
      if (response.knowledgeSources) {
        for (const source of response.knowledgeSources) {
          await this.knowledgeRepository.increment({ id: source.id }, 'usageCount', 1);
        }
      }

    } catch (error) {
      this.logger.warn(`记录使用日志失败: ${error.message}`);
    }
  }
}