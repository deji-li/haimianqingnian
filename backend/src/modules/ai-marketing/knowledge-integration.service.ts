import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnterpriseKnowledgeBase } from '../enterprise-knowledge/entities/enterprise-knowledge-base.entity';

export interface KnowledgeSearchParams {
  scenario: string;
  painPoints: string[];
  interests: string[];
  customerType?: string;
  limit?: number;
}

export interface KnowledgeSearchResult {
  id: number;
  title: string;
  content: string;
  relevanceScore: number;
  usageCount: number;
  qualityScore: number;
  sceneCategory: string;
  keywords: string;
}

export interface ContentFeedbackParams {
  knowledgeId: number;
  isPositive: boolean;
  userId: number;
  feedback?: string;
}

@Injectable()
export class KnowledgeIntegrationService {
  private readonly logger = new Logger(KnowledgeIntegrationService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly enterpriseKnowledgeRepository: Repository<EnterpriseKnowledgeBase>,
  ) {}

  /**
   * 搜索相关企业知识库内容
   * 优先级策略：场景分类 > 关键词匹配 > 相关度评分 > 使用频率
   */
  async searchRelevantKnowledge(params: KnowledgeSearchParams): Promise<KnowledgeSearchResult[]> {
    const { scenario, painPoints, interests, customerType, limit = 5 } = params;

    try {
      // 构建查询条件
      const queryBuilder = this.enterpriseKnowledgeRepository
        .createQueryBuilder('knowledge')
        .where('knowledge.status = :status', { status: 'active' });

      // 场景分类优先级最高
      if (scenario) {
        // 映射营销场景到知识库场景分类
        const sceneCategory = this.mapScenarioToSceneCategory(scenario);
        if (sceneCategory) {
          queryBuilder.andWhere('knowledge.sceneCategory = :sceneCategory', { sceneCategory });
        }
      }

      // 客户类型过滤
      if (customerType) {
        queryBuilder.andWhere('knowledge.customerType = :customerType', { customerType });
      }

      // 获取基础查询结果
      let results = await queryBuilder
        .orderBy('knowledge.relevanceScore', 'DESC')
        .addOrderBy('knowledge.usageCount', 'DESC')
        .addOrderBy('knowledge.qualityScore', 'DESC')
        .limit(limit * 2) // 获取更多结果用于后续筛选
        .getMany();

      // 关键词匹配评分
      const allKeywords = [...painPoints, ...interests];
      if (allKeywords.length > 0) {
        results = this.scoreByKeywordMatching(results, allKeywords);
      }

      // 按综合评分排序
      results.sort((a, b) => {
        const scoreA = this.calculateCompositeScore(a, allKeywords);
        const scoreB = this.calculateCompositeScore(b, allKeywords);
        return scoreB - scoreA;
      });

      // 返回前N个结果
      return results.slice(0, limit).map(k => ({
        id: k.id,
        title: k.title,
        content: k.content,
        relevanceScore: k.relevanceScore,
        usageCount: k.usageCount,
        qualityScore: k.qualityScore,
        sceneCategory: k.sceneCategory,
        keywords: k.keywords,
      }));

    } catch (error) {
      this.logger.error('搜索企业知识库失败:', error);
      return [];
    }
  }

  /**
   * 映射营销场景到知识库场景分类
   */
  private mapScenarioToSceneCategory(scenario: string): string {
    const scenarioMapping: { [key: string]: string } = {
      'marketing_moments': '产品介绍',        // 朋友圈营销
      'marketing_wechat': '产品介绍',         // 微信群发
      'marketing_douyin': '产品介绍',         // 抖音营销
      'marketing_xiaohongshu': '产品介绍',     // 小红书营销
      'marketing_video_script': '产品介绍',    // 短视频脚本
      'marketing_official': '产品介绍',        // 公众号推文
    };

    return scenarioMapping[scenario] || '产品介绍';
  }

  /**
   * 根据关键词匹配评分
   */
  private scoreByKeywordMatching(
    knowledgeList: EnterpriseKnowledgeBase[],
    keywords: string[],
  ): EnterpriseKnowledgeBase[] {
    return knowledgeList.map(knowledge => {
      const knowledgeText = `${knowledge.title} ${knowledge.content} ${knowledge.keywords}`.toLowerCase();
      let keywordScore = 0;

      keywords.forEach(keyword => {
        if (keyword && knowledgeText.includes(keyword.toLowerCase())) {
          keywordScore += 10; // 每个匹配关键词加10分
        }
      });

      // 临时存储关键词匹配分数
      (knowledge as any).keywordScore = keywordScore;
      return knowledge;
    });
  }

  /**
   * 计算综合评分
   */
  private calculateCompositeScore(
    knowledge: EnterpriseKnowledgeBase,
    keywords: string[],
  ): number {
    const keywordScore = (knowledge as any).keywordScore || 0;
    const relevanceScore = knowledge.relevanceScore || 0;
    const usageScore = Math.log(knowledge.usageCount + 1) * 5; // 使用频率评分
    const qualityScore = knowledge.qualityScore || 0;

    return keywordScore + relevanceScore + usageScore + qualityScore;
  }

  /**
   * 记录知识库内容使用
   */
  async recordKnowledgeUsage(knowledgeId: number): Promise<void> {
    try {
      await this.enterpriseKnowledgeRepository.update(knowledgeId, {
        usageCount: () => `usage_count + 1`,
        lastUsedTime: new Date(),
      });
    } catch (error) {
      this.logger.error(`记录知识库使用失败, ID: ${knowledgeId}:`, error);
    }
  }

  /**
   * 处理用户反馈
   */
  async handleContentFeedback(params: ContentFeedbackParams): Promise<void> {
    const { knowledgeId, isPositive, userId, feedback } = params;

    try {
      const knowledge = await this.enterpriseKnowledgeRepository.findOne({
        where: { id: knowledgeId },
      });

      if (!knowledge) {
        throw new Error('知识库内容不存在');
      }

      // 更新反馈计数
      const updateData: any = {};
      if (isPositive) {
        updateData.positiveFeedbackCount = () => `positive_feedback_count + 1`;
      } else {
        updateData.negativeFeedbackCount = () => `negative_feedback_count + 1`;

        // 负反馈过多时自动禁用
        const newNegativeCount = (knowledge.negativeFeedbackCount || 0) + 1;
        const totalCount = (knowledge.positiveFeedbackCount || 0) + newNegativeCount;

        if (totalCount >= 5 && newNegativeCount / totalCount > 0.6) {
          updateData.status = 'auto_disabled';
          this.logger.warn(`知识库内容因负反馈过多被自动禁用, ID: ${knowledgeId}`);
        }
      }

      await this.enterpriseKnowledgeRepository.update(knowledgeId, updateData);

      // 记录反馈详情（可选，如果有反馈记录表）
      if (feedback) {
        this.logger.log(`用户反馈 - 知识ID: ${knowledgeId}, 用户: ${userId}, 反馈: ${feedback}`);
      }

    } catch (error) {
      this.logger.error('处理用户反馈失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门知识库内容
   */
  async getPopularKnowledge(limit: number = 10): Promise<KnowledgeSearchResult[]> {
    try {
      const results = await this.enterpriseKnowledgeRepository
        .createQueryBuilder('knowledge')
        .where('knowledge.status = :status', { status: 'active' })
        .orderBy('knowledge.usageCount', 'DESC')
        .addOrderBy('knowledge.qualityScore', 'DESC')
        .limit(limit)
        .getMany();

      return results.map(k => ({
        id: k.id,
        title: k.title,
        content: k.content,
        relevanceScore: k.relevanceScore,
        usageCount: k.usageCount,
        qualityScore: k.qualityScore,
        sceneCategory: k.sceneCategory,
        keywords: k.keywords,
      }));

    } catch (error) {
      this.logger.error('获取热门知识库内容失败:', error);
      return [];
    }
  }

  /**
   * 获取推荐知识库内容
   */
  async getRecommendedKnowledge(
    scenario: string,
    limit: number = 5,
  ): Promise<KnowledgeSearchResult[]> {
    try {
      const sceneCategory = this.mapScenarioToSceneCategory(scenario);

      const results = await this.enterpriseKnowledgeRepository
        .createQueryBuilder('knowledge')
        .where('knowledge.status = :status', { status: 'active' })
        .andWhere('knowledge.sceneCategory = :sceneCategory', { sceneCategory })
        .orderBy('knowledge.qualityScore', 'DESC')
        .addOrderBy('knowledge.positiveFeedbackCount', 'DESC')
        .limit(limit)
        .getMany();

      return results.map(k => ({
        id: k.id,
        title: k.title,
        content: k.content,
        relevanceScore: k.relevanceScore,
        usageCount: k.usageCount,
        qualityScore: k.qualityScore,
        sceneCategory: k.sceneCategory,
        keywords: k.keywords,
      }));

    } catch (error) {
      this.logger.error('获取推荐知识库内容失败:', error);
      return [];
    }
  }
}