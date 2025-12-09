import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  EnterpriseKnowledgeBase,
  KnowledgeFeedback,
  KnowledgeUsageLog,
} from '../entities/index';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';
import { MiningKnowledgeService } from '../mining-knowledge.service';

/**
 * 知识库自学习和优化服务
 * 实现产品需求文档中的自学习机制：
 * 1. 处理用户负反馈
 * 2. 自动更新知识库
 * 3. 分析AI话术助手使用记录
 * 4. 识别新问题和知识缺口
 * 5. 同行业知识推荐
 */
export interface NegativeFeedbackProcess {
  feedbackId: number;
  knowledgeId: number;
  feedbackType: 'negative';
  feedbackReason?: string;
  userContext?: any;
}

export interface KnowledgeUpdateRecommendation {
  type: 'MODIFY' | 'DELETE' | 'REPLACE';
  knowledgeId: number;
  currentTitle: string;
  currentContent: string;
  suggestedTitle?: string;
  suggestedContent?: string;
  reason: string;
  confidence: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface KnowledgeGapAnalysis {
  newQuestions: Array<{
    question: string;
    frequency: number;
    sourceType: 'ai_assistant' | 'customer_analysis' | 'marketing_advice';
    suggestedCategory: string;
  }>;
  knowledgeDeficiencies: Array<{
    category: string;
    deficiencyType: 'MISSING_ANSWERS' | 'OUTDATED_INFO' | 'LOW_QUALITY';
    description: string;
  }>;
  improvementSuggestions: Array<{
    type: 'NEW_KNOWLEDGE' | 'UPDATE_EXISTING' | 'REMOVE_OUTDATED';
    details: any;
  }>;
}

@Injectable()
export class KnowledgeLearningService {
  private readonly logger = new Logger(KnowledgeLearningService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(KnowledgeFeedback)
    private readonly feedbackRepository: Repository<KnowledgeFeedback>,
    @InjectRepository(KnowledgeUsageLog)
    private readonly usageLogRepository: Repository<KnowledgeUsageLog>,
    private readonly aiConfigCallerService: AiConfigCallerService,
    private readonly miningKnowledgeService: MiningKnowledgeService,
  ) {}

  /**
   * 处理用户负反馈
   */
  async processNegativeFeedback(feedback: NegativeFeedbackProcess): Promise<void> {
    this.logger.log(`处理负反馈 - 知识ID: ${feedback.knowledgeId}, 反馈ID: ${feedback.feedbackId}`);

    try {
      // 1. 标记知识为待审核状态
      await this.knowledgeRepository.update(feedback.knowledgeId, {
        status: 'pending_review',
      });

      // 2. 分析影响范围
      const impact = await this.analyzeFeedbackImpact(feedback);

      // 3. 生成修正建议
      const suggestions = await this.generateCorrectionSuggestions(feedback, impact);

      // 4. 创建学习记录
      await this.createLearningRecord(feedback, impact, suggestions);

      // 5. 如果置信度高，自动修正
      const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 85);
      if (highConfidenceSuggestions.length > 0) {
        await this.applyHighConfidenceCorrections(feedback.knowledgeId, highConfidenceSuggestions);
      }

      this.logger.log(`负反馈处理完成 - 生成${suggestions.length}条修正建议`);

    } catch (error) {
      this.logger.error(`处理负反馈失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 自动更新知识库（定时任务）
   */
  @Cron('0 3 * * 1', {
    name: 'weekly-knowledge-update',
    timeZone: 'Asia/Shanghai',
  })
  async scheduleAutoUpdate(): Promise<void> {
    this.logger.log('定时任务: 开始每周知识库自动更新');

    try {
      // 1. 分析AI话术助手使用记录
      const usageAnalysis = await this.analyzeAIAssistantUsage();

      // 2. 识别知识缺口
      const knowledgeGaps = await this.identifyKnowledgeGaps(usageAnalysis);

      // 3. 生成新知识建议
      const newKnowledgeSuggestions = await this.generateNewKnowledge(knowledgeGaps);

      // 4. 获取同行业知识推荐
      const industryRecommendations = await this.getIndustryRecommendations();

      // 5. 执行自动更新
      const updateResult = await this.executeAutoUpdate({
        newKnowledgeSuggestions,
        industryRecommendations,
        usageAnalysis,
      });

      this.logger.log(`知识库自动更新完成 - 新增${updateResult.newKnowledgeCount}条知识`);

    } catch (error) {
      this.logger.error(`知识库自动更新失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 分析AI话术助手使用记录
   */
  private async analyzeAIAssistantUsage(): Promise<any> {
    // 查询最近一周的使用记录
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const usageLogs = await this.usageLogRepository.find({
      where: {
        usageTime: MoreThanOrEqual(oneWeekAgo),
        functionType: In(['AI_ASSISTANT', 'CUSTOMER_ANALYSIS', 'MARKETETING_ADVICE']),
      },
      relations: ['knowledge'],
    });

    const analysis = {
      totalUsage: usageLogs.length,
      knowledgeUsed: new Map<number, number>(),
      newQuestions: new Map<string, number>(),
      lowQualityKnowledge: new Map<number, number>(),
      popularCategories: new Map<string, number>(),
    };

    // 分析使用模式
    for (const log of usageLogs) {
      // 统计知识使用频率
      if (log.knowledgeId) {
        const count = analysis.knowledgeUsed.get(log.knowledgeId) || 0;
        analysis.knowledgeUsed.set(log.knowledgeId, count + 1);
      }

      // 提取新问题
      if (log.query && !log.knowledgeId) {
        // 简单的问题标准化
        const normalizedQuestion = this.normalizeQuestion(log.query);
        const count = analysis.newQuestions.get(normalizedQuestion) || 0;
        analysis.newQuestions.set(normalizedQuestion, count + 1);
      }

      // 统计低质量反馈
      if (log.hasFeedback && log.feedbackType === 'NEGATIVE' && log.knowledgeId) {
        const count = analysis.lowQualityKnowledge.get(log.knowledgeId) || 0;
        analysis.lowQualityKnowledge.set(log.knowledgeId, count + 1);
      }
    }

    return analysis;
  }

  /**
   * 识别知识缺口
   */
  private async identifyKnowledgeGaps(usageAnalysis: any): Promise<KnowledgeGapAnalysis> {
    const gaps: KnowledgeGapAnalysis = {
      newQuestions: [],
      knowledgeDeficiencies: [],
      improvementSuggestions: [],
    };

    // 1. 分析新问题
    for (const [question, frequency] of usageAnalysis.newQuestions.entries()) {
      if (frequency >= 3) { // 出现3次以上认为是重要问题
        const classification = await this.classifyNewQuestion(question);

        gaps.newQuestions.push({
          question,
          frequency,
          sourceType: 'ai_assistant',
          suggestedCategory: classification.category,
        });
      }
    }

    // 2. 分析现有知识质量
    for (const [knowledgeId, negativeCount] of usageAnalysis.lowQualityKnowledge.entries()) {
      if (negativeCount >= 2) { // 负反馈2次以上
        const knowledge = await this.knowledgeRepository.findOne({ where: { id: knowledgeId } });
        if (knowledge) {
          gaps.knowledgeDeficiencies.push({
            category: knowledge.sceneCategory || '未分类',
            deficiencyType: 'LOW_QUALITY',
            description: `知识"${knowledge.title}"收到${negativeCount}次负反馈`,
          });

          gaps.improvementSuggestions.push({
            type: 'UPDATE_EXISTING',
            details: {
              knowledgeId,
              currentContent: knowledge.content,
              negativeFeedbackCount: negativeCount,
            },
          });
        }
      }
    }

    // 3. 分析知识覆盖情况
    const categoryGaps = await this.analyzeCategoryCoverage();
    gaps.knowledgeDeficiencies.push(...categoryGaps);

    return gaps;
  }

  /**
   * 生成新知识建议
   */
  private async generateNewKnowledge(gaps: KnowledgeGapAnalysis): Promise<any[]> {
    const suggestions: any[] = [];

    // 为新问题生成答案
    for (const newQuestion of gaps.newQuestions) {
      try {
        const answer = await this.generateAnswerForNewQuestion(newQuestion.question, newQuestion.suggestedCategory);

        suggestions.push({
          type: 'NEW_KNOWLEDGE',
          title: newQuestion.question,
          content: answer.content,
          sceneCategory: newQuestion.suggestedCategory,
          productCategory: '通用',
          customerType: '全部客户',
          questionType: '咨询',
          sourceType: 'ai_recommend',
          confidence: answer.confidence,
          reason: `基于${newQuestion.frequency}次用户查询生成`,
        });
      } catch (error) {
        this.logger.warn(`为新问题生成答案失败: ${error.message}`);
      }
    }

    return suggestions;
  }

  /**
   * 获取行业知识推荐
   */
  private async getIndustryRecommendations(): Promise<any[]> {
    // TODO: 实现行业知识推荐逻辑
    // 这里可以基于企业信息和行业数据，推荐行业最佳实践
    return [];
  }

  /**
   * 执行自动更新
   */
  private async executeAutoUpdate(updateData: any): Promise<any> {
    let newKnowledgeCount = 0;
    let updatedKnowledgeCount = 0;

    try {
      // 1. 添加新知识（高置信度的）
      const highConfidenceKnowledge = updateData.newKnowledgeSuggestions.filter(s => s.confidence >= 80);

      for (const suggestion of highConfidenceKnowledge) {
        const knowledge = this.knowledgeRepository.create({
          title: suggestion.title,
          content: suggestion.content,
          sceneCategory: suggestion.sceneCategory,
          productCategory: suggestion.productCategory,
          customerType: suggestion.customerType,
          questionType: suggestion.questionType,
          sourceType: suggestion.sourceType,
          creatorId: 0, // 系统自动生成
          status: 'active',
          priority: 60,
          relevanceScore: suggestion.confidence,
          qualityScore: suggestion.confidence,
        });

        await this.knowledgeRepository.save(knowledge);
        newKnowledgeCount++;
      }

      // 2. 更新低质量知识
      for (const improvement of updateData.usageAnalysis.knowledgeDeficiencies) {
        if (improvement.deficiencyType === 'LOW_QUALITY') {
          await this.knowledgeRepository.update(improvement.details.knowledgeId, {
            status: 'pending_review',
          });
          updatedKnowledgeCount++;
        }
      }

    } catch (error) {
      this.logger.error(`执行自动更新失败: ${error.message}`);
    }

    return {
      newKnowledgeCount,
      updatedKnowledgeCount,
    };
  }

  /**
   * 分析反馈影响范围
   */
  private async analyzeFeedbackImpact(feedback: NegativeFeedbackProcess): Promise<any> {
    // 查询该知识的使用情况
    const usageCount = await this.usageLogRepository.count({
      where: { knowledgeId: feedback.knowledgeId },
    });

    // 查询该知识的反馈情况
    const feedbackCount = await this.feedbackRepository.count({
      where: { knowledgeId: feedback.knowledgeId },
    });

    // 获取知识详情
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id: feedback.knowledgeId },
    });

    return {
      usageCount,
      feedbackCount,
      priority: knowledge?.priority || 0,
      isHighUsage: usageCount > 10,
      isHighFeedback: feedbackCount > 3,
    };
  }

  /**
   * 生成修正建议
   */
  private async generateCorrectionSuggestions(
    feedback: NegativeFeedbackProcess,
    impact: any,
  ): Promise<KnowledgeUpdateRecommendation[]> {
    const suggestions: KnowledgeUpdateRecommendation[] = [];

    try {
      const knowledge = await this.knowledgeRepository.findOne({
        where: { id: feedback.knowledgeId },
      });

      if (!knowledge) {
        return suggestions;
      }

      // 使用AI生成修正建议
      const aiSuggestions = await this.aiConfigCallerService.callAI(
        'knowledge_correction_suggestion',
        {
          currentTitle: knowledge.title,
          currentContent: knowledge.content,
          feedbackReason: feedback.feedbackReason,
          userContext: feedback.userContext,
          usageCount: impact.usageCount,
          priority: impact.priority,
        },
      );

      if (aiSuggestions && aiSuggestions.suggestions && Array.isArray(aiSuggestions.suggestions)) {
        for (const suggestion of aiSuggestions.suggestions) {
          suggestions.push({
            type: suggestion.type || 'MODIFY',
            knowledgeId: feedback.knowledgeId,
            currentTitle: knowledge.title,
            currentContent: knowledge.content,
            suggestedTitle: suggestion.title,
            suggestedContent: suggestion.content,
            reason: suggestion.reason || '基于用户反馈AI生成',
            confidence: suggestion.confidence || 70,
            priority: impact.isHighUsage ? 'HIGH' : (impact.isHighFeedback ? 'MEDIUM' : 'LOW'),
          });
        }
      }

    } catch (error) {
      this.logger.warn(`生成修正建议失败: ${error.message}`);
    }

    return suggestions;
  }

  /**
   * 应用高置信度修正
   */
  private async applyHighConfidenceCorrections(
    knowledgeId: number,
    suggestions: KnowledgeUpdateRecommendation[],
  ): Promise<void> {
    for (const suggestion of suggestions) {
      try {
        const updateData: any = {
          status: 'active', // 修正后重新激活
          updateTime: new Date(),
        };

        if (suggestion.type === 'MODIFY') {
          if (suggestion.suggestedTitle) {
            updateData.title = suggestion.suggestedTitle;
          }
          if (suggestion.suggestedContent) {
            updateData.content = suggestion.suggestedContent;
          }
        }

        await this.knowledgeRepository.update(knowledgeId, updateData);

        this.logger.log(`应用高置信度修正 - 知识ID: ${knowledgeId}, 类型: ${suggestion.type}`);

      } catch (error) {
        this.logger.error(`应用修正失败: ${error.message}`);
      }
    }
  }

  /**
   * 创建学习记录
   */
  private async createLearningRecord(
    feedback: NegativeFeedbackProcess,
    impact: any,
    suggestions: KnowledgeUpdateRecommendation[],
  ): Promise<void> {
    // TODO: 实现学习记录保存逻辑
    this.logger.log(`创建学习记录 - 反馈ID: ${feedback.feedbackId}, 建议数: ${suggestions.length}`);
  }

  /**
   * 标准化问题
   */
  private normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 移除标点符号，保留中文
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 分类新问题
   */
  private async classifyNewQuestion(question: string): Promise<any> {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'question_classification',
        { question },
      );

      return {
        category: result.category || '未分类',
        confidence: result.confidence || 70,
      };

    } catch (error) {
      this.logger.warn(`问题分类失败: ${error.message}`);
      return { category: '未分类', confidence: 50 };
    }
  }

  /**
   * 为新问题生成答案
   */
  private async generateAnswerForNewQuestion(question: string, category: string): Promise<any> {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'answer_generation',
        { question, category },
      );

      return {
        content: result.answer || result.content,
        confidence: result.confidence || 70,
      };

    } catch (error) {
      this.logger.warn(`生成答案失败: ${error.message}`);
      throw new Error('无法为新问题生成答案');
    }
  }

  /**
   * 分析类别覆盖情况
   */
  private async analyzeCategoryCoverage(): Promise<any[]> {
    // TODO: 实现类别覆盖分析
    // 分析各个场景类别的知识数量，识别覆盖不足的类别
    return [];
  }
}