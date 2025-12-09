import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Between } from 'typeorm';
import { AiMarketingHistory } from './entities/ai-marketing-history.entity';
import { AiMarketingFeedback } from './entities/ai-marketing-feedback.entity';
import { AiCustomerInsights } from './entities/ai-customer-insights.entity';
import { AiMarketingContent } from './entities/ai-marketing-content.entity';
import { Customer } from '../customer/entities/customer.entity';
import { EnterpriseKnowledgeBase } from '../enterprise-knowledge/entities/enterprise-knowledge-base.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiConfigService } from '../ai-config/ai-config.service';
import { EnterpriseKnowledgeService } from '../enterprise-knowledge/enterprise-knowledge.service';
import { KnowledgeIntegrationService, KnowledgeSearchParams } from './knowledge-integration.service';
import {
  GenerateMarketingContentDto,
  SubmitFeedbackDto,
  RecommendContentDto,
  QueryHistoryDto,
  BatchDeleteDto,
  AddCustomerInsightDto,
} from './dto/marketing-assistant.dto';

@Injectable()
export class MarketingAssistantService {
  private readonly logger = new Logger(MarketingAssistantService.name);

  constructor(
    @InjectRepository(AiMarketingHistory)
    private historyRepository: Repository<AiMarketingHistory>,
    @InjectRepository(AiMarketingFeedback)
    private feedbackRepository: Repository<AiMarketingFeedback>,
    @InjectRepository(AiCustomerInsights)
    private insightsRepository: Repository<AiCustomerInsights>,
    @InjectRepository(AiMarketingContent)
    private contentRepository: Repository<AiMarketingContent>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(EnterpriseKnowledgeBase)
    private enterpriseKnowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    private deepseekService: DeepseekAnalysisService,
    private aiConfigService: AiConfigService,
    private knowledgeService: EnterpriseKnowledgeService,
    private knowledgeIntegrationService: KnowledgeIntegrationService,
  ) {}

  // ==================== 获取客户洞察数据 ====================
  async getCustomerInsights(userId: number) {
    // 获取当前用户负责的所有客户的洞察数据
    const insights = await this.insightsRepository.find({
      where: { userId, isActive: 1 },
      order: { mentionCount: 'DESC' },
    });

    // 按类型分组并排序
    const painPoints = insights
      .filter((i) => i.insightType === 'pain_point')
      .map((item, index) => ({
        id: item.id,
        rank: index + 1,
        content: item.content,
        count: item.mentionCount,
        canEdit: false,
      }));

    const needs = insights
      .filter((i) => i.insightType === 'need')
      .map((item, index) => ({
        id: item.id,
        rank: index + 1,
        content: item.content,
        count: item.mentionCount,
        canEdit: false,
      }));

    const interests = insights
      .filter((i) => i.insightType === 'interest')
      .map((item, index) => ({
        id: item.id,
        rank: index + 1,
        content: item.content,
        count: item.mentionCount,
        canEdit: false,
      }));

    // 添加可编辑行
    painPoints.push({ id: 0, rank: 0, content: '', count: 0, canEdit: true });
    needs.push({ id: 0, rank: 0, content: '', count: 0, canEdit: true });
    interests.push({ id: 0, rank: 0, content: '', count: 0, canEdit: true });

    return {
      painPoints,
      needs,
      interests,
    };
  }

  // ==================== 获取特定客户的洞察数据 ====================
  async getCustomerInsightsByCustomerId(customerId: number, userId?: number) {
    try {
      // 1. 获取客户基本信息
      const customer = await this.customerRepository.findOne({
        where: { id: customerId, isDeleted: false },
      });

      if (!customer) {
        throw new NotFoundException('客户不存在');
      }

      // 2. 从客户资料中提取洞察数据
      const profileInsights = {
        painPoints: customer.painPoints || [],
        interests: customer.interestPoints || [],
        needs: customer.needKeywords || [],
        customerType: customer.customerIntent || '中意向',
      };

      // 3. 获取AI洞察记录
      const aiInsights = await this.insightsRepository.find({
        where: { customerId, isActive: 1 },
        order: { mentionCount: 'DESC' },
      });

      // 4. 合并数据，优先使用AI洞察，补充客户资料数据
      const combinedInsights = {
        customerId: customer.id,
        customerName: customer.wechatNickname || customer.realName || '未命名',
        painPoints: this.mergeInsightData(
          aiInsights.filter(i => i.insightType === 'pain_point'),
          profileInsights.painPoints,
        ),
        needs: this.mergeInsightData(
          aiInsights.filter(i => i.insightType === 'need'),
          profileInsights.needs,
        ),
        interests: this.mergeInsightData(
          aiInsights.filter(i => i.insightType === 'interest'),
          profileInsights.interests,
        ),
        customerType: profileInsights.customerType,
        lastUpdated: customer.updateTime,
      };

      return {
        success: true,
        data: combinedInsights,
      };

    } catch (error) {
      this.logger.error(`获取客户洞察失败, customerId: ${customerId}`, error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // ==================== 合并洞察数据 ====================
  private mergeInsightData(aiInsights: any[], profileData: string[]): any[] {
    const result = [];

    // 添加AI洞察数据（优先级高）
    aiInsights.forEach((insight, index) => {
      result.push({
        id: insight.id,
        content: insight.content,
        count: insight.mentionCount,
        source: 'ai_analysis',
        rank: index + 1,
      });
    });

    // 添加客户资料数据（去重）
    profileData.forEach(item => {
      if (item && !result.some(r => r.content === item)) {
        result.push({
          id: 0,
          content: item,
          count: 1,
          source: 'customer_profile',
          rank: result.length + 1,
        });
      }
    });

    // 限制返回数量，按重要性和频率排序
    return result.slice(0, 10);
  }

  // ==================== 添加客户洞察 ====================
  async addCustomerInsight(dto: AddCustomerInsightDto, userId: number) {
    const insight = this.insightsRepository.create({
      customerId: dto.customerId || 0, // 如果没有customerId，设为0表示通用洞察
      userId,
      insightType: dto.insightType,
      content: dto.content,
      source: 'manual',
      mentionCount: 1,
    });

    return await this.insightsRepository.save(insight);
  }

  // ==================== 生成营销文案 ====================
  async generateMarketingContent(dto: GenerateMarketingContentDto, userId: number) {
    try {
      this.logger.log(`开始生成营销文案, 场景: ${dto.contentType}, 用户: ${userId}`);

      // 1. 场景映射
      const scenarioKeyMap = {
        moments: 'marketing_moments',
        wechat: 'marketing_wechat',
        douyin: 'marketing_douyin',
        xiaohongshu: 'marketing_xiaohongshu',
        video_script: 'marketing_video_script',
        official: 'marketing_official',
      };

      const scenarioKey = scenarioKeyMap[dto.contentType] || 'marketing_moments';

      // 2. 获取客户洞察数据（如果提供了客户ID）
      let customerInsights = null;
      let customerType = '中意向';

      if (dto.customerId) {
        const insightsResult = await this.getCustomerInsightsByCustomerId(dto.customerId, userId);
        if (insightsResult.success) {
          customerInsights = insightsResult.data;
          customerType = customerInsights.customerType;
        }
      }

      // 3. 使用知识库集成服务搜索相关内容
      const searchParams: KnowledgeSearchParams = {
        scenario: scenarioKey,
        painPoints: dto.selectedPainPoints || [],
        interests: dto.selectedInterests || [],
        customerType,
        limit: 5,
      };

      const knowledgeResults = await this.knowledgeIntegrationService.searchRelevantKnowledge(searchParams);
      this.logger.log(`知识库搜索结果: 找到 ${knowledgeResults.length} 条相关内容`);

      // 4. 构建AI调用参数（知识库优先）
      const aiParams = {
        knowledgeContent: this.formatKnowledgeContent(knowledgeResults),
        knowledgeReferences: knowledgeResults.map(k => k.id),
        painPoints: (dto.selectedPainPoints || []).join('、'),
        needs: (dto.selectedNeeds || []).join('、'),
        interests: (dto.selectedInterests || []).join('、'),
        customerInsights: customerInsights ? JSON.stringify(customerInsights) : '',
        customerType,
        ...dto.configParams,
      };

      let generatedContent: string;
      let generationMode: 'knowledge_ai' | 'pure_ai' = 'knowledge_ai';
      let qualityScore = 0;

      // 5. 调用AI生成文案（知识库优先模式）
      try {
        if (knowledgeResults.length > 0) {
          // 知识库优先模式
          generatedContent = await this.callAIForContent(scenarioKey, aiParams);
          qualityScore = await this.assessContentQuality(generatedContent, knowledgeResults);
          this.logger.log(`知识库优先生成成功, 质量评分: ${qualityScore}`);
        } else {
          // 降级到纯AI模式
          generationMode = 'pure_ai';
          generatedContent = await this.callAIForContent('marketing_pure_ai', {
            contentType: dto.contentType,
            ...aiParams,
            configParams: JSON.stringify(dto.configParams),
          });
          qualityScore = 0.6; // 纯AI模式默认评分
          this.logger.log(`纯AI模式生成成功`);
        }
      } catch (error) {
        // AI调用失败，降级到纯AI模式重试
        this.logger.warn(`知识库优先模式失败，降级到纯AI模式: ${error.message}`);
        generationMode = 'pure_ai';
        generatedContent = await this.callAIForContent('marketing_pure_ai', {
          contentType: dto.contentType,
          ...aiParams,
          configParams: JSON.stringify(dto.configParams),
        });
        qualityScore = 0.5;
      }

      // 6. 记录知识库使用情况
      if (knowledgeResults.length > 0) {
        await Promise.all(
          knowledgeResults.map(knowledge =>
            this.knowledgeIntegrationService.recordKnowledgeUsage(knowledge.id)
          )
        );
      }

      // 7. 保存历史记录
      const history = await this.saveHistory({
        userId,
        customerId: dto.customerId,
        contentType: dto.contentType,
        selectedPainPoints: dto.selectedPainPoints,
        selectedNeeds: dto.selectedNeeds,
        selectedInterests: dto.selectedInterests,
        configParams: dto.configParams,
        generatedContent,
        knowledgeUsed: knowledgeResults,
        generationMode,
        qualityScore,
      });

      return {
        success: true,
        content: generatedContent,
        historyId: history.id,
        generationMode,
        knowledgeCount: knowledgeResults.length,
        knowledgeReferences: knowledgeResults.map(k => k.id),
        qualityScore,
        customerInsights,
      };
    } catch (error) {
      this.logger.error('生成营销文案失败:', error);
      throw error;
    }
  }

  // ==================== 搜索相关知识库 ====================
  private async searchRelevantKnowledge(
    painPoints?: string[],
    needs?: string[],
    interests?: string[],
  ) {
    const searchTerms = [...(painPoints || []), ...(needs || []), ...(interests || [])];

    if (searchTerms.length === 0) {
      return [];
    }

    // 使用知识库服务搜索相关内容
    const results = [];
    for (const term of searchTerms.slice(0, 3)) {
      // 限制搜索3个关键词
      try {
        const knowledge = await this.knowledgeService.intelligentSearch({
          question: term,
          limit: 2,
        });
        if (knowledge.results && knowledge.results.length > 0) {
          results.push(...knowledge.results);
        }
      } catch (error) {
        console.error(`搜索知识库失败 (${term}):`, error);
      }
    }

    return results;
  }

  // ==================== 格式化知识库内容 ====================
  private formatKnowledgeContent(knowledgeResults: any[]): string {
    if (knowledgeResults.length === 0) {
      return '暂无相关知识库内容，请发挥���意进行文案创作';
    }

    return knowledgeResults
      .map((k, index) => {
        return `【参考资料${index + 1}】\n标题：${k.title}\n内容：${k.content}\n相关度评分：${k.relevanceScore}\n`;
      })
      .join('\n');
  }

  // ==================== 内容质量评估 ====================
  private async assessContentQuality(content: string, knowledgeResults: any[]): Promise<number> {
    let score = 0.5; // 基础分数

    try {
      // 1. 长度评分（20%权重）
      const length = content.length;
      if (length >= 50 && length <= 500) {
        score += 0.2;
      } else if (length > 0) {
        score += 0.1;
      }

      // 2. 知识库引用评分（30%权重）
      if (knowledgeResults.length > 0) {
        const avgRelevanceScore = knowledgeResults.reduce((sum, k) => sum + (k.relevanceScore || 0), 0) / knowledgeResults.length;
        score += (avgRelevanceScore / 100) * 0.3;
      }

      // 3. 关键词匹配评分（30%权重）
      const marketingKeywords = ['优惠', '活动', '限时', '免费', '体验', '专业', '效果好', '安全', '有效', '推荐'];
      const keywordMatches = marketingKeywords.filter(keyword => content.includes(keyword)).length;
      score += Math.min(keywordMatches / marketingKeywords.length * 0.3, 0.3);

      // 4. 结构完整性评分（20%权重）
      if (content.includes('。') && content.includes('，')) {
        score += 0.1;
      }
      if (content.includes('！') || content.includes('？')) {
        score += 0.1;
      }

      // 确保分数在0-1范围内
      return Math.min(Math.max(score, 0), 1);
    } catch (error) {
      this.logger.warn('内容质量评估失败:', error);
      return 0.5; // 评估失败时返回默认分数
    }
  }

  // ==================== 内容反哺到知识库 ====================
  async feedbackContentToKnowledge(historyId: number, userId: number): Promise<any> {
    try {
      // 1. 获取历史记录
      const history = await this.historyRepository.findOne({
        where: { id: historyId, userId },
      });

      if (!history) {
        throw new NotFoundException('历史记录不存在');
      }

      // 2. 评估内容质量
      const qualityScore = history.qualityScore || await this.assessContentQuality(
        history.generatedContent,
        history.knowledgeUsed || []
      );

      // 3. 质量阈值检查
      const MIN_QUALITY_THRESHOLD = 0.7;
      if (qualityScore < MIN_QUALITY_THRESHOLD) {
        return {
          success: false,
          message: `内容质量评分 ${qualityScore.toFixed(2)} 低于阈值 ${MIN_QUALITY_THRESHOLD}，暂不反哺到知识库`,
          qualityScore,
        };
      }

      // 4. 场景映射
      const sceneCategoryMap = {
        moments: '产品介绍',
        wechat: '产品介绍',
        douyin: '产品介绍',
        xiaohongshu: '产品介绍',
        video_script: '产品介绍',
        official: '产品介绍',
      };

      // 5. 创建知识库条目
      const knowledgeEntry = this.enterpriseKnowledgeRepository.create({
        title: `AI生成-${history.contentType}-${Date.now()}`,
        content: history.generatedContent,
        sceneCategory: sceneCategoryMap[history.contentType] || '产品介绍',
        keywords: [
          ...(history.selectedPainPoints || []),
          ...(history.selectedInterests || []),
          ...(history.selectedNeeds || []),
        ].join(','),
        sourceType: 'ai_generated',
        relevanceScore: Math.round(qualityScore * 100),
        qualityScore: Math.round(qualityScore * 100),
        status: 'pending_review',
        creatorId: userId,
        sourceId: historyId,
      });

      const savedKnowledge = await this.enterpriseKnowledgeRepository.save(knowledgeEntry);

      this.logger.log(`优质内容已反哺到知识库, ID: ${savedKnowledge.id}, 质量评分: ${qualityScore}`);

      return {
        success: true,
        message: '高质量内容已成功提交至知识库审核',
        knowledgeId: savedKnowledge.id,
        qualityScore,
        reviewStatus: 'pending_review',
      };

    } catch (error) {
      this.logger.error('内容反哺到知识库失败:', error);
      return {
        success: false,
        message: '内容反哺失败：' + error.message,
        error: error.message,
      };
    }
  }

  // ==================== 保存历史记录 ====================
  private async saveHistory(data: Partial<AiMarketingHistory>) {
    const history = this.historyRepository.create(data);
    return await this.historyRepository.save(history);
  }

  // ==================== 提交反馈 ====================
  async submitFeedback(dto: SubmitFeedbackDto, userId: number) {
    const feedback = this.feedbackRepository.create({
      historyId: dto.historyId,
      userId,
      rating: dto.rating,
      feedbackType: dto.feedbackType,
      suggestion: dto.suggestion,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // 如果有优化建议，可以记录到知识库反馈系统（未来扩展）
    if (dto.suggestion) {
      // TODO: 将优化建议反馈到知识库优化系统
    }

    return savedFeedback;
  }

  // ==================== 推荐到文案库 ====================
  async recommendToLibrary(dto: RecommendContentDto, userId: number) {
    // 1. 获取历史记录
    const history = await this.historyRepository.findOne({
      where: { id: dto.historyId },
    });

    if (!history) {
      throw new NotFoundException('历史记录不存在');
    }

    // 2. 类型映射
    const typeNameMap = {
      moments: '朋友圈文案',
      wechat: '微信群发文案',
      douyin: '抖音营销文案',
      xiaohongshu: '小红书营销文案',
      video_script: '短视频拍摄脚本',
      official: '公众号推文',
    };

    const typeName = typeNameMap[history.contentType] || history.contentType;
    const purpose = history.configParams?.purpose || history.configParams?.topic || '';
    const title = purpose ? `${typeName} - ${purpose}` : `${typeName} - ${new Date().toLocaleDateString()}`;

    // 3. 保存到文案库
    const content = this.contentRepository.create({
      contentType: typeName,
      title: title,
      content: history.generatedContent,
      painPoints: history.selectedPainPoints,
      interestPoints: history.selectedInterests,
      generationParams: history.configParams,
      purpose: history.configParams?.purpose || history.configParams?.topic,
      style: history.configParams?.style,
      wordCount: history.configParams?.wordCount,
      category: history.configParams?.purpose || history.configParams?.topic || '其他',
      isFavorite: 0,
      useCount: 0,
      userId,
      remark: dto.recommendReason,
    });

    return await this.contentRepository.save(content);
  }

  // ==================== 查询历史记录 ====================
  async queryHistory(dto: QueryHistoryDto, userId: number) {
    const { page = 1, limit = 10, contentType, startDate, endDate, keyword } = dto;

    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere('history.isActive = 1');

    // 场景筛选
    if (contentType) {
      queryBuilder.andWhere('history.contentType = :contentType', { contentType });
    }

    // 时间筛选
    if (startDate && endDate) {
      queryBuilder.andWhere('history.createTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere('history.generatedContent LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // 分页和排序
    const [data, total] = await queryBuilder
      .orderBy('history.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==================== 批量删除 ====================
  async batchDelete(dto: BatchDeleteDto, userId: number) {
    await this.historyRepository.update(
      {
        id: In(dto.ids),
        userId, // 确保只能删除自己的记录
      },
      {
        isActive: 0,
      },
    );

    return { success: true, deletedCount: dto.ids.length };
  }

  // ==================== 获取历史记录详情 ====================
  async getHistoryDetail(id: number, userId: number) {
    const history = await this.historyRepository.findOne({
      where: { id, userId },
    });

    if (!history) {
      throw new NotFoundException('历史记录不存在');
    }

    // 获取反馈信息
    const feedback = await this.feedbackRepository.findOne({
      where: { historyId: id },
      order: { createTime: 'DESC' },
    });

    return {
      ...history,
      feedback,
    };
  }

  // ==================== 私有方法：调用AI生成内容 ====================
  private async callAIForContent(scenarioKey: string, variables: Record<string, any>): Promise<string> {
    try {
      // 1. 获取配置
      const config = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');

      if (!config || !config.isActive) {
        throw new Error(`场景 ${scenarioKey} 的 AI配置不存在或未启用`);
      }

      // 2. 替换变量
      let promptContent = config.promptContent;
      let systemPrompt = config.systemPrompt || '';

      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        const stringValue = this.convertToString(value);

        promptContent = promptContent.replace(new RegExp(placeholder, 'g'), stringValue);
        systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), stringValue);
      }

      // 3. 调用AI
      const result = await this.deepseekService.callAI(systemPrompt, promptContent, {
        temperature: parseFloat(String(config.temperature || 0.7)),
        maxTokens: parseInt(String(config.maxTokens || 1000), 10),
        modelName: config.modelName,
      });

      // 4. 尝试解析JSON结果
      try {
        const jsonResult = JSON.parse(result.trim());
        return jsonResult.content || jsonResult;
      } catch {
        // 如果不是JSON格式，返回原文
        return result;
      }
    } catch (error) {
      console.error(`AI调用失败: scenarioKey=${scenarioKey}, error=${error.message}`);
      throw error;
    }
  }

  // ==================== 将值转换为字符串 ====================
  private convertToString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}

