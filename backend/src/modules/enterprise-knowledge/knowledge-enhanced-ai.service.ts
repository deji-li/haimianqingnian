import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EnterpriseKnowledgeBase, KnowledgeUsageLog } from './entities/index';
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
      this.logger.log('步骤1: 搜索相关知识...');
      const knowledgeResults = await this.searchRelevantKnowledge(request);
      this.logger.log(`搜索到 ${knowledgeResults.length} 条相关知识`);

      // 2. 使用智能融合策略
      this.logger.log('步骤2: 使用智能融合响应策略...');
      const response = await this.generateIntelligentFusionResponse(request, knowledgeResults);

      // 4. 记录使用日志
      this.logger.log('步骤4: 记录使用日志...');
      await this.logUsage(request, response, knowledgeResults);

      // 5. 计算处理时间
      response.processingTime = Date.now() - startTime;
      this.logger.log(`AI响应生成成功，处理时间: ${response.processingTime}ms`);

      return response;

    } catch (error) {
      this.logger.error(`生成增强AI响应失败: ${error.message}`, error.stack);
      this.logger.error(`错误详情: ${JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack,
        request: {
          functionType: request.functionType,
          queryLength: request.query?.length || 0
        }
      }, null, 2)}`);

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

    this.logger.log(`生成基于知识库的响应，主要知识: ${primaryKnowledge.knowledge.title}`);

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

      this.logger.log('调用AI配置服务: ai_script_mixed');
      const aiResponse = await this.aiConfigCallerService.callAI(
        'ai_script_mixed', // 使用现有的话术混合配置
        {
          prompt,
          userInput: request.query,
          scenarioInfo: request.context?.scenario ? `场景：${request.context.scenario}` : '',
          techniqueInfo: request.context?.technique ? `技巧：${request.context.technique}` : '',
          referenceContent: '', // 知识库内容
          context: request.context,
          functionType: request.functionType,
        },
      );

      this.logger.log(`AI配置服务调用成功，响应: ${JSON.stringify(aiResponse).substring(0, 200)}...`);

      return {
        content: typeof aiResponse === 'string' ? aiResponse : (aiResponse.content || aiResponse.answer),
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
      this.logger.error(`生成基于知识库的响应失败: ${error.message}`, error.stack);
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
        'knowledge_qa_extraction', // 使用现有的知识库问答提取配置
        {
          prompt,
          context: { ...request.context, knowledgeContext },
          functionType: request.functionType,
        },
      );

      return {
        content: typeof aiResponse === 'string' ? aiResponse : (aiResponse.content || aiResponse.answer),
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
        'ai_script_pure', // 使用现有的纯话术配置
        {
          prompt,
          userInput: request.query,
          scenarioInfo: request.context?.scenario ? `场景：${request.context.scenario}` : '',
          techniqueInfo: request.context?.technique ? `技巧：${request.context.technique}` : '',
          context: request.context,
          functionType: request.functionType,
        },
      );

      return {
        content: typeof aiResponse === 'string' ? aiResponse : (aiResponse.content || aiResponse.answer),
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
   * 智能融合响应生成
   */
  private async generateIntelligentFusionResponse(
    request: EnhancedAIRequest,
    knowledgeResults: KnowledgeSearchResult[],
  ): Promise<EnhancedAIResponse> {
    this.logger.log('开始智能融合响应生成...');

    try {
      // 1. 计算各因素的匹配度
      const scenarioMatchScore = await this.calculateScenarioMatch(request, knowledgeResults);
      const techniqueMatchScore = await this.calculateTechniqueMatch(request, knowledgeResults);
      const knowledgeRelevanceScore = knowledgeResults.length > 0 ? knowledgeResults[0].relevanceScore : 0;

      this.logger.log(`匹配度 - 场景: ${scenarioMatchScore}, 技巧: ${techniqueMatchScore}, 知识库: ${knowledgeRelevanceScore}`);

      // 2. 动态计算权重
      const weights = this.calculateDynamicWeights({
        scenarioMatch: scenarioMatchScore,
        techniqueMatch: techniqueMatchScore,
        knowledgeRelevance: knowledgeRelevanceScore,
      });

      this.logger.log(`权重分配 - 场景: ${weights.scenario.toFixed(2)}, 技巧: ${weights.technique.toFixed(2)}, 知识库: ${weights.knowledge.toFixed(2)}, AI: ${weights.ai.toFixed(2)}`);

      // 3. 构建融合的提示词变量
      const fusedVariables = await this.buildFusedPromptVariables(request, knowledgeResults, weights, scenarioMatchScore, techniqueMatchScore);

      // 4. 调用AI生成响应
      this.logger.log('调用AI配置服务: ai_script_intelligent_fusion');
      const aiResponse = await this.aiConfigCallerService.callAI(
        'ai_script_intelligent_fusion',
        fusedVariables,
      );

      // 5. 解析AI响应
      let content: string;
      let thinkingProcess: string = '';
      let keyPoints: string[] = [];
      let confidenceScore: number = 0.75;

      if (typeof aiResponse === 'string') {
        content = aiResponse;
      } else if (aiResponse.scriptSuggestion) {
        // JSON格式响应
        content = aiResponse.scriptSuggestion;
        thinkingProcess = aiResponse.thinkingProcess || '';
        keyPoints = aiResponse.keyPoints || [];
        confidenceScore = aiResponse.confidenceScore || 0.75;
      } else {
        content = aiResponse.content || aiResponse.answer || '无法生成话术';
      }

      return {
        content,
        knowledgeSources: knowledgeResults.map(kr => ({
          id: kr.knowledge.id,
          title: kr.knowledge.title,
          relevanceScore: kr.relevanceScore,
          usedSections: kr.matchedSections,
        })),
        confidence: confidenceScore,
        responseStrategy: 'INTELLIGENT_FUSION',
        processingTime: 0,
        metadata: {
          weights,
          scenarioMatchScore,
          techniqueMatchScore,
          knowledgeRelevanceScore,
          thinkingProcess,
          keyPoints,
        },
      };

    } catch (error) {
      this.logger.error(`智能融合响应生成失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 计算场景匹配度
   */
  private async calculateScenarioMatch(
    request: EnhancedAIRequest,
    knowledgeResults: KnowledgeSearchResult[],
  ): Promise<number> {
    const scenarioName = request.context?.scenario || request.context?.scenarioName || '';
    if (!scenarioName) return 0;

    let matchScore = 0;

    // 1. 查询中包含场景关键词
    const scenarioKeywords = scenarioName.split(/[、，,\s]+/).filter(k => k.length > 0);
    for (const keyword of scenarioKeywords) {
      if (request.query.includes(keyword)) {
        matchScore += 0.3;
      }
    }

    // 2. 知识库中有场景相关内容
    for (const kr of knowledgeResults) {
      if (kr.knowledge.title.includes(scenarioName) || kr.knowledge.content.includes(scenarioName)) {
        matchScore += kr.relevanceScore * 0.4;
      }
    }

    // 3. 基础匹配度（场景总是相关的）
    matchScore += 0.3;

    return Math.min(matchScore, 1);
  }

  /**
   * 计算技巧匹配度
   */
  private async calculateTechniqueMatch(
    request: EnhancedAIRequest,
    knowledgeResults: KnowledgeSearchResult[],
  ): Promise<number> {
    const techniqueName = request.context?.technique || request.context?.techniqueName || '';
    if (!techniqueName) return 0;

    let matchScore = 0;

    // 1. 查询中包含技巧关键词
    const techniqueKeywords = techniqueName.split(/[、，,\s]+/).filter(k => k.length > 0);
    for (const keyword of techniqueKeywords) {
      if (request.query.includes(keyword)) {
        matchScore += 0.3;
      }
    }

    // 2. 知识库中有技巧相关内容
    for (const kr of knowledgeResults) {
      if (kr.knowledge.title.includes(techniqueName) || kr.knowledge.content.includes(techniqueName)) {
        matchScore += kr.relevanceScore * 0.4;
      }
    }

    // 3. 基础匹配度（技巧总是相关的）
    matchScore += 0.3;

    return Math.min(matchScore, 1);
  }

  /**
   * 动态权重计算
   */
  private calculateDynamicWeights(scores: {
    scenarioMatch: number;
    techniqueMatch: number;
    knowledgeRelevance: number;
  }): { scenario: number; technique: number; knowledge: number; ai: number } {
    const total = scores.scenarioMatch + scores.techniqueMatch + scores.knowledgeRelevance;

    if (total === 0) {
      // 如果没有匹配，AI联想权重最高
      return { scenario: 0.1, technique: 0.1, knowledge: 0.1, ai: 0.7 };
    }

    // 根据匹配度动态分配权重
    // 场景和技巧总权重为0.6，知识库权重为0.2，AI联想保留0.2
    return {
      scenario: (scores.scenarioMatch / total) * 0.35,
      technique: (scores.techniqueMatch / total) * 0.35,
      knowledge: (scores.knowledgeRelevance / total) * 0.2,
      ai: 0.1, // AI联想始终保留一定权重用于补充
    };
  }

  /**
   * 构建融合的提示词变量
   */
  private async buildFusedPromptVariables(
    request: EnhancedAIRequest,
    knowledgeResults: KnowledgeSearchResult[],
    weights: { scenario: number; technique: number; knowledge: number; ai: number },
    scenarioMatchScore: number,
    techniqueMatchScore: number,
  ): Promise<Record<string, any>> {
    // 获取场景和技巧的详细信息
    const scenarioName = request.context?.scenario || request.context?.scenarioName || '未指定场景';
    const scenarioDescription = request.context?.scenarioDescription || '通用沟通场景';
    const techniqueName = request.context?.technique || request.context?.techniqueName || '未指定技巧';
    const techniqueDescription = request.context?.techniqueDescription || '专业销售技巧';

    // 构建知识库内容
    let knowledgeContent = '';
    if (knowledgeResults.length > 0) {
      knowledgeContent = knowledgeResults.slice(0, 3).map((kr, index) =>
        `${index + 1}. ${kr.knowledge.title}\n${kr.knowledge.content.substring(0, 200)}...`
      ).join('\n\n');
    } else {
      knowledgeContent = '暂无相关知识库内容';
    }

    const knowledgeRelevanceScore = knowledgeResults.length > 0 ? knowledgeResults[0].relevanceScore : 0;

    return {
      userInput: request.query,
      scenarioName,
      scenarioDescription,
      scenarioMatchScore: (scenarioMatchScore * 100).toFixed(0) + '%',
      techniqueName,
      techniqueDescription,
      techniqueMatchScore: (techniqueMatchScore * 100).toFixed(0) + '%',
      knowledgeContent,
      knowledgeRelevanceScore: (knowledgeRelevanceScore * 100).toFixed(0) + '%',
      scenarioWeight: (weights.scenario * 100).toFixed(0) + '%',
      techniqueWeight: (weights.technique * 100).toFixed(0) + '%',
      knowledgeWeight: (weights.knowledge * 100).toFixed(0) + '%',
      aiWeight: (weights.ai * 100).toFixed(0) + '%',
    };
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
        usageScene: request.functionType,
        queryText: request.query,
        finalAnswer: response.content,
        matchedKnowledgeIds: response.knowledgeSources?.map(source => source.id) || [],
        aiDecision: response.knowledgeSources && response.knowledgeSources.length > 0 ? 'use_knowledge' : 'use_ai_generate',
        createTime: new Date(),
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