import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, SelectQueryBuilder } from 'typeorm';
import { EnterpriseKnowledgeBase } from '../entities/index';
import { RedisService } from '@nestjs-modules/ioredis';

/**
 * 知识库搜索优化服务
 * 实现高性能搜索算法和缓存策略
 */
export interface SearchRequest {
  query: string;
  filters?: {
    category?: string;
    productCategory?: string;
    customerType?: string;
    sourceType?: string;
    minQualityScore?: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  searchStrategy?: 'semantic' | 'keyword' | 'hybrid';
  useCache?: boolean;
}

export interface SearchResult {
  knowledge: EnterpriseKnowledgeBase;
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'semantic';
  highlights: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  searchTime: number;
  fromCache: boolean;
  suggestions?: string[];
}

@Injectable()
export class KnowledgeSearchService {
  private readonly logger = new Logger(KnowledgeSearchService.name);
  private readonly CACHE_TTL = 300; // 5分钟缓存
  private readonly MAX_RESULTS = 50;

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 执行知识库搜索
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);

    try {
      // 1. 检查缓存
      if (request.useCache !== false) {
        const cachedResult = await this.getFromCache(cacheKey);
        if (cachedResult) {
          return {
            ...cachedResult,
            fromCache: true,
          };
        }
      }

      // 2. 执行搜索
      let searchResults: SearchResult[];
      let total = 0;

      switch (request.searchStrategy || 'hybrid') {
        case 'semantic':
          ({ results: searchResults, total } = await this.semanticSearch(request));
          break;
        case 'keyword':
          ({ results: searchResults, total } = await this.keywordSearch(request));
          break;
        case 'hybrid':
        default:
          ({ results: searchResults, total } = await this.hybridSearch(request));
          break;
      }

      const searchTime = Date.now() - startTime;

      // 3. 生成搜索建议
      const suggestions = await this.generateSearchSuggestions(request.query);

      const response: SearchResponse = {
        results: searchResults,
        total,
        page: request.pagination?.page || 1,
        limit: request.pagination?.limit || 20,
        searchTime,
        fromCache: false,
        suggestions,
      };

      // 4. 缓存结果
      if (request.useCache !== false && searchResults.length > 0) {
        await this.setCache(cacheKey, response);
      }

      return response;

    } catch (error) {
      this.logger.error(`知识搜索失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 语义搜索
   */
  private async semanticSearch(request: SearchRequest): Promise<{ results: SearchResult[], total: number }> {
    const queryBuilder = this.buildBaseQuery(request);

    // 语义搜索：基于关键词匹配和上下文相关性
    const keywords = this.extractKeywords(request.query);

    // 构建语义匹配条件
    const semanticConditions = keywords.map(keyword =>
      `(kb.title LIKE :${keyword} OR kb.content LIKE :${keyword} OR kb.keywords LIKE :${keyword})`
    ).join(' OR ');

    if (semanticConditions) {
      queryBuilder.andWhere(`(${semanticConditions})`,
        keywords.reduce((params, keyword, index) => {
          params[`keyword${index}`] = `%${keyword}%`;
          return params;
        }, {})
      );
    }

    // 执行查询
    const [knowledgeList, total] = await queryBuilder
      .orderBy('kb.qualityScore', 'DESC')
      .addOrderBy('kb.usageCount', 'DESC')
      .addOrderBy('kb.relevanceScore', 'DESC')
      .take(request.pagination?.limit || 20)
      .skip(((request.pagination?.page || 1) - 1) * (request.pagination?.limit || 20))
      .getManyAndCount();

    // 计算语义相关度
    const results = knowledgeList.map(knowledge => ({
      knowledge,
      relevanceScore: this.calculateSemanticRelevance(request.query, knowledge, keywords),
      matchType: 'semantic' as const,
      highlights: this.generateHighlights(request.query, knowledge),
    }));

    return { results: this.sortResults(results), total };
  }

  /**
   * 关键词搜索
   */
  private async keywordSearch(request: SearchRequest): Promise<{ results: SearchResult[], total: number }> {
    const queryBuilder = this.buildBaseQuery(request);

    // 精确关键词匹配
    const keywords = this.extractKeywords(request.query);

    if (keywords.length > 0) {
      // 使用全文搜索（如果支持）或 LIKE 查询
      queryBuilder.andWhere(
        keywords.map((keyword, index) => `kb.title LIKE :keyword${index} OR kb.content LIKE :keyword${index}`).join(' OR '),
        keywords.reduce((params, keyword, index) => {
          params[`keyword${index}`] = `%${keyword}%`;
          return params;
        }, {})
      );
    }

    const [knowledgeList, total] = await queryBuilder
      .orderBy('kb.priority', 'DESC')
      .addOrderBy('kb.qualityScore', 'DESC')
      .take(request.pagination?.limit || 20)
      .skip(((request.pagination?.page || 1) - 1) * (request.pagination?.limit || 20))
      .getManyAndCount();

    const results = knowledgeList.map(knowledge => ({
      knowledge,
      relevanceScore: this.calculateKeywordRelevance(request.query, knowledge),
      matchType: 'partial' as const,
      highlights: this.generateHighlights(request.query, knowledge),
    }));

    return { results: this.sortResults(results), total };
  }

  /**
   * 混合搜索（推荐使用）
   */
  private async hybridSearch(request: SearchRequest): Promise<{ results: SearchResult[], total: number }> {
    // 1. 精确匹配搜索
    const exactResults = await this.exactMatchSearch(request);

    // 2. 关键词搜索
    const { results: keywordResults, total: keywordTotal } = await this.keywordSearch(request);

    // 3. 语义搜索
    const { results: semanticResults, total: semanticTotal } = await this.semanticSearch(request);

    // 4. 合并和去重
    const allResults = new Map<number, SearchResult>();

    // 添加精确匹配结果（最高优先级）
    exactResults.forEach(result => {
      allResults.set(result.knowledge.id, {
        ...result,
        relevanceScore: Math.min(result.relevanceScore * 1.5, 1),
        matchType: 'exact',
      });
    });

    // 添加关键词匹配结果
    keywordResults.forEach(result => {
      if (!allResults.has(result.knowledge.id)) {
        allResults.set(result.knowledge.id, result);
      }
    });

    // 添加语义匹配结果
    semanticResults.forEach(result => {
      if (!allResults.has(result.knowledge.id)) {
        allResults.set(result.knowledge.id, result);
      }
    });

    const results = Array.from(allResults.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, request.pagination?.limit || 20);

    return {
      results,
      total: Math.max(exactResults.length, keywordTotal, semanticTotal),
    };
  }

  /**
   * 精确匹配搜索
   */
  private async exactMatchSearch(request: SearchRequest): Promise<SearchResult[]> {
    const queryBuilder = this.knowledgeRepository.createQueryBuilder('kb')
      .where('kb.status = :status', { status: 'active' })
      .andWhere(
        '(kb.title LIKE :query OR kb.content LIKE :query)',
        { query: `%${request.query}%` }
      );

    this.applyFilters(queryBuilder, request.filters);

    const knowledgeList = await queryBuilder
      .orderBy('kb.priority', 'DESC')
      .addOrderBy('kb.qualityScore', 'DESC')
      .take(10) // 精确匹配限制为10个结果
      .getMany();

    return knowledgeList.map(knowledge => ({
      knowledge,
      relevanceScore: this.calculateExactRelevance(request.query, knowledge),
      matchType: 'exact' as const,
      highlights: this.generateHighlights(request.query, knowledge),
    }));
  }

  /**
   * 构建基础查询
   */
  private buildBaseQuery(request: SearchRequest): SelectQueryBuilder<EnterpriseKnowledgeBase> {
    const queryBuilder = this.knowledgeRepository.createQueryBuilder('kb')
      .where('kb.status = :status', { status: 'active' });

    this.applyFilters(queryBuilder, request.filters);

    return queryBuilder;
  }

  /**
   * 应用过滤条件
   */
  private applyFilters(
    queryBuilder: SelectQueryBuilder<EnterpriseKnowledgeBase>,
    filters: SearchRequest['filters'],
  ): void {
    if (!filters) return;

    if (filters.category) {
      queryBuilder.andWhere('kb.sceneCategory = :category', { category: filters.category });
    }

    if (filters.productCategory) {
      queryBuilder.andWhere('kb.productCategory = :productCategory', {
        productCategory: filters.productCategory
      });
    }

    if (filters.customerType) {
      queryBuilder.andWhere('kb.customerType = :customerType', {
        customerType: filters.customerType
      });
    }

    if (filters.sourceType) {
      queryBuilder.andWhere('kb.sourceType = :sourceType', {
        sourceType: filters.sourceType
      });
    }

    if (filters.minQualityScore) {
      queryBuilder.andWhere('kb.qualityScore >= :minQualityScore', {
        minQualityScore: filters.minQualityScore
      });
    }
  }

  /**
   * 提取关键词
   */
  private extractKeywords(query: string): string[] {
    // 停用词列表
    const stopWords = ['的', '了', '是', '在', '有', '和', '与', '或', '但', '而', '等', '什么', '怎么', '如何'];

    return query
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .slice(0, 5); // 最多提取5个关键词
  }

  /**
   * 计算精确匹配相关度
   */
  private calculateExactRelevance(query: string, knowledge: EnterpriseKnowledgeBase): number {
    const queryLower = query.toLowerCase();
    const titleLower = knowledge.title.toLowerCase();
    const contentLower = knowledge.content.toLowerCase();

    let score = 0;

    // 标题完全匹配
    if (titleLower === queryLower) {
      score = 1.0;
    }
    // 标题包含查询
    else if (titleLower.includes(queryLower)) {
      score = 0.9;
    }
    // 内容包含完整查询
    else if (contentLower.includes(queryLower)) {
      score = 0.8;
    }
    // 部分匹配
    else if (titleLower.includes(queryLower.substring(0, 3))) {
      score = 0.7;
    }
    else {
      score = 0.6;
    }

    // 质量和优先级加权
    score *= (1 + (knowledge.qualityScore / 200)) * (1 + (knowledge.priority / 200));

    return Math.min(score, 1);
  }

  /**
   * 计算关键词匹配相关度
   */
  private calculateKeywordRelevance(query: string, knowledge: EnterpriseKnowledgeBase): number {
    const keywords = this.extractKeywords(query);
    const titleLower = knowledge.title.toLowerCase();
    const contentLower = knowledge.content.toLowerCase();

    let matchCount = 0;
    let totalKeywords = keywords.length;

    for (const keyword of keywords) {
      if (titleLower.includes(keyword) || contentLower.includes(keyword)) {
        matchCount++;
      }
    }

    const baseScore = totalKeywords > 0 ? matchCount / totalKeywords : 0;

    // 加权计算
    const titleWeight = 0.6;
    const contentWeight = 0.4;

    let titleScore = 0;
    let contentScore = 0;

    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) titleScore++;
      if (contentLower.includes(keyword)) contentScore++;
    }

    const weightedScore = (titleScore * titleWeight + contentScore * contentWeight) / totalKeywords;

    // 质量加权
    return Math.min(weightedScore * (1 + knowledge.qualityScore / 100), 1);
  }

  /**
   * 计算语义相关度
   */
  private calculateSemanticRelevance(
    query: string,
    knowledge: EnterpriseKnowledgeBase,
    keywords: string[]
  ): number {
    // 简化的语义相关度计算
    // 实际应用中可以使用向量嵌入等更复杂的方法

    const titleLower = knowledge.title.toLowerCase();
    const contentLower = knowledge.content.toLowerCase();
    const queryLower = query.toLowerCase();

    let semanticScore = 0;

    // 1. 关键词覆盖度
    const keywordCoverage = keywords.filter(keyword =>
      titleLower.includes(keyword) || contentLower.includes(keyword)
    ).length / Math.max(keywords.length, 1);

    semanticScore += keywordCoverage * 0.4;

    // 2. 长度相似度（避免过短或过长的匹配）
    const lengthRatio = Math.min(query.length / contentLower.length, contentLower.length / query.length);
    semanticScore += lengthRatio * 0.2;

    // 3. 词汇相似度（简化计算）
    const queryWords = new Set(queryLower.split(/\s+/));
    const contentWords = new Set(contentLower.split(/\s+/));
    const intersection = new Set([...queryWords].filter(word => contentWords.has(word)));
    const jaccardSimilarity = intersection.size / Math.max(queryWords.size + contentWords.size - intersection.size, 1);

    semanticScore += jaccardSimilarity * 0.4;

    return Math.min(semanticScore * (1 + knowledge.qualityScore / 100), 1);
  }

  /**
   * 生成高亮片段
   */
  private generateHighlights(query: string, knowledge: EnterpriseKnowledgeBase): string[] {
    const highlights: string[] = [];
    const keywords = this.extractKeywords(query);
    const content = knowledge.content;

    // 查找包含关键词的句子
    const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const hasKeyword = keywords.some(keyword => sentenceLower.includes(keyword.toLowerCase()));

      if (hasKeyword) {
        highlights.push(sentence.trim());
        if (highlights.length >= 3) break; // 最多返回3个高亮片段
      }
    }

    return highlights;
  }

  /**
   * 排序搜索结果
   */
  private sortResults(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
      // 1. 按相关度排序
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      // 2. 按质量评分排序
      if (b.knowledge.qualityScore !== a.knowledge.qualityScore) {
        return b.knowledge.qualityScore - a.knowledge.qualityScore;
      }

      // 3. 按优先级排序
      if (b.knowledge.priority !== a.knowledge.priority) {
        return b.knowledge.priority - a.knowledge.priority;
      }

      // 4. 按使用���率排序
      return b.knowledge.usageCount - a.knowledge.usageCount;
    });
  }

  /**
   * 生成搜索建议
   */
  private async generateSearchSuggestions(query: string): Promise<string[]> {
    // 基于搜索历史和热门知识生成搜索建议
    const suggestions: string[] = [];

    try {
      // 查找热门搜索词（简化实现）
      const hotKnowledge = await this.knowledgeRepository
        .createQueryBuilder('kb')
        .where('kb.status = :status', { status: 'active' })
        .andWhere('kb.usageCount > :usageCount', { usageCount: 10 })
        .orderBy('kb.usageCount', 'DESC')
        .take(5)
        .getMany();

      hotKnowledge.forEach(knowledge => {
        if (knowledge.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push(knowledge.title);
        }
      });

    } catch (error) {
      this.logger.warn(`生成搜索建议失败: ${error.message}`);
    }

    return suggestions.slice(0, 5);
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(request: SearchRequest): string {
    const keyData = {
      q: request.query,
      f: request.filters,
      s: request.searchStrategy,
      p: request.pagination,
    };

    return `knowledge:search:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  /**
   * 从缓存获取结果
   */
  private async getFromCache(key: string): Promise<SearchResponse | null> {
    try {
      const cached = await this.redisService.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn(`获取缓存失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  private async setCache(key: string, result: SearchResponse): Promise<void> {
    try {
      await this.redisService.setex(
        key,
        this.CACHE_TTL,
        JSON.stringify(result)
      );
    } catch (error) {
      this.logger.warn(`设置缓存失败: ${error.message}`);
    }
  }

  /**
   * 清除搜索缓存
   */
  async clearSearchCache(): Promise<void> {
    try {
      const keys = await this.redisService.keys('knowledge:search:*');
      if (keys.length > 0) {
        await this.redisService.del(...keys);
        this.logger.log(`清除了${keys.length}个搜索缓存`);
      }
    } catch (error) {
      this.logger.warn(`清除搜索缓存失败: ${error.message}`);
    }
  }
}