import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  EnterpriseKnowledgeBase,
  KnowledgeFeedback,
  KnowledgePendingReview,
  EnterpriseBasicInfo,
  IndustryQuestionLibrary,
  KnowledgeUsageLog,
} from './entities/index';
import {
  CreateKnowledgeDto,
  UpdateKnowledgeDto,
  QueryKnowledgeDto,
  IntelligentSearchDto,
  BatchImportKnowledgeDto,
} from './dto/knowledge.dto';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';

@Injectable()
export class EnterpriseKnowledgeService {
  private readonly logger = new Logger(EnterpriseKnowledgeService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(KnowledgeFeedback)
    private readonly feedbackRepository: Repository<KnowledgeFeedback>,
    @InjectRepository(KnowledgePendingReview)
    private readonly pendingReviewRepository: Repository<KnowledgePendingReview>,
    @InjectRepository(EnterpriseBasicInfo)
    private readonly basicInfoRepository: Repository<EnterpriseBasicInfo>,
    @InjectRepository(IndustryQuestionLibrary)
    private readonly industryQuestionRepository: Repository<IndustryQuestionLibrary>,
    @InjectRepository(KnowledgeUsageLog)
    private readonly usageLogRepository: Repository<KnowledgeUsageLog>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 创建知识库条目
   */
  async create(createDto: CreateKnowledgeDto, creatorId: number) {
    const knowledge = this.knowledgeRepository.create({
      ...createDto,
      creatorId,
      status: 'active',
    });

    return await this.knowledgeRepository.save(knowledge);
  }

  /**
   * 更新知识库条目
   */
  async update(id: number, updateDto: UpdateKnowledgeDto) {
    const knowledge = await this.knowledgeRepository.findOne({ where: { id } });

    if (!knowledge) {
      throw new NotFoundException('知识库条目不存在');
    }

    Object.assign(knowledge, updateDto);
    return await this.knowledgeRepository.save(knowledge);
  }

  /**
   * 删除知识库条目（软删除）
   */
  async remove(id: number) {
    const result = await this.knowledgeRepository.update(id, {
      status: 'inactive',
    });

    return {
      success: result.affected > 0,
      message: result.affected > 0 ? '删除成功' : '知识库条目不存在',
    };
  }

  /**
   * 查询知识库列表
   */
  async findAll(query: QueryKnowledgeDto) {
    const {
      page = 1,
      limit = 20,
      sceneCategory,
      productCategory,
      customerType,
      questionType,
      keyword,
      status,
      sourceType,
    } = query;

    const queryBuilder = this.knowledgeRepository.createQueryBuilder('kb');

    if (sceneCategory) {
      queryBuilder.andWhere('kb.sceneCategory = :sceneCategory', { sceneCategory });
    }

    if (productCategory) {
      queryBuilder.andWhere('kb.productCategory = :productCategory', { productCategory });
    }

    if (customerType) {
      queryBuilder.andWhere('kb.customerType = :customerType', { customerType });
    }

    if (questionType) {
      queryBuilder.andWhere('kb.questionType = :questionType', { questionType });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(kb.title LIKE :keyword OR kb.content LIKE :keyword OR kb.keywords LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('kb.status = :status', { status });
    } else {
      // 默认只查询active状态
      queryBuilder.andWhere('kb.status = :status', { status: 'active' });
    }

    if (sourceType) {
      queryBuilder.andWhere('kb.sourceType = :sourceType', { sourceType });
    }

    const [list, total] = await queryBuilder
      .orderBy('kb.priority', 'DESC')
      .addOrderBy('kb.createTime', 'DESC')
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
   * 获取单个知识库条目
   */
  async findOne(id: number) {
    const knowledge = await this.knowledgeRepository.findOne({ where: { id } });

    if (!knowledge) {
      throw new NotFoundException('知识库条目不存在');
    }

    // 增加使用次数
    await this.knowledgeRepository.update(id, {
      usageCount: knowledge.usageCount + 1,
      lastUsedTime: new Date(),
    });

    return knowledge;
  }

  /**
   * 智能搜索知识库（基于AI语义匹配）
   */
  async intelligentSearch(searchDto: IntelligentSearchDto) {
    try {
      this.logger.log(`智能搜索: ${searchDto.question}`);

      // 1. 先做基础关键词搜索
      const keywords = this.extractKeywords(searchDto.question);
      let candidates = await this.searchByKeywords(keywords);

      // 2. 如果候选结果少于3个，扩大搜索范围
      if (candidates.length < 3) {
        candidates = await this.knowledgeRepository.find({
          where: { status: 'active' },
          order: { priority: 'DESC', usageCount: 'DESC' },
          take: 10,
        });
      }

      // 3. 使用AI评分和排序（调用配置化提示词）
      const scoredResults = await this.scoreKnowledgeWithAI(
        searchDto.question,
        candidates,
      );

      // 4. 返回Top N
      const topResults = scoredResults.slice(0, searchDto.limit || 5);

      return {
        question: searchDto.question,
        results: topResults,
        total: topResults.length,
      };
    } catch (error) {
      this.logger.error(`智能搜索失败: ${error.message}`, error.stack);
      // 降级：返回基础搜索结果
      return this.basicSearch(searchDto);
    }
  }

  /**
   * 基础搜索（降级方案）
   */
  private async basicSearch(searchDto: IntelligentSearchDto) {
    const keywords = this.extractKeywords(searchDto.question);
    const results = await this.searchByKeywords(keywords);

    return {
      question: searchDto.question,
      results: results.slice(0, searchDto.limit || 5),
      total: results.length,
    };
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
   * 按关键词搜索
   */
  private async searchByKeywords(keywords: string[]) {
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

    return await queryBuilder
      .orderBy('kb.priority', 'DESC')
      .addOrderBy('kb.usageCount', 'DESC')
      .take(10)
      .getMany();
  }

  /**
   * 使用AI对知识库条目评分和排序（调用配置化提示词）
   */
  private async scoreKnowledgeWithAI(
    question: string,
    candidates: EnterpriseKnowledgeBase[],
  ) {
    try {
      // 格式化候选知识库列表
      const knowledgeList = candidates
        .map((k, i) => `${i + 1}. 标题：${k.title}\n   内容：${k.content.substring(0, 100)}...`)
        .join('\n\n');

      // 调用AI配置（knowledge_semantic_scoring场景）
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_semantic_scoring',
        {
          userQuestion: question,
          knowledgeList,
        },
      );

      // 按AI排序重组结果
      if (result && result.rankings && Array.isArray(result.rankings)) {
        return result.rankings
          .map((rank: any) => ({
            knowledge: candidates[rank.knowledgeId - 1],
            score: rank.score,
            matchReason: rank.matchReason,
          }))
          .filter((item: any) => item.knowledge); // 过滤掉无效的
      }

      // 如果AI返回格式不正确，返回原始顺序
      return candidates.map(k => ({ knowledge: k, score: 50, matchReason: '默认排序' }));
    } catch (error) {
      this.logger.warn(`AI评分失败，使用默认排序: ${error.message}`);
      return candidates.map(k => ({ knowledge: k, score: 50, matchReason: '默认排序' }));
    }
  }

  /**
   * 批量导入知识库
   */
  async batchImport(batchDto: BatchImportKnowledgeDto, creatorId: number) {
    const entities = batchDto.knowledgeList.map((k) =>
      this.knowledgeRepository.create({
        ...k,
        creatorId,
        status: 'active',
      }),
    );

    const saved = await this.knowledgeRepository.save(entities);

    return {
      success: true,
      imported: saved.length,
      message: `成功导入${saved.length}条知识`,
    };
  }

  /**
   * 获取知识库分类统计
   */
  async getCategories() {
    try {
      const sceneCategories = await this.knowledgeRepository
        .createQueryBuilder('kb')
        .select('kb.sceneCategory', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('kb.status = :status', { status: 'active' })
        .andWhere('kb.sceneCategory IS NOT NULL')
        .groupBy('kb.sceneCategory')
        .getRawMany();

      const productCategories = await this.knowledgeRepository
        .createQueryBuilder('kb')
        .select('kb.productCategory', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('kb.status = :status', { status: 'active' })
        .andWhere('kb.productCategory IS NOT NULL')
        .groupBy('kb.productCategory')
        .getRawMany();

      return {
        sceneCategories: sceneCategories
          .filter((c) => c.category)
          .map((c) => ({
            category: c.category,
            count: parseInt(c.count) || 0,
          })),
        productCategories: productCategories
          .filter((c) => c.category)
          .map((c) => ({
            category: c.category,
            count: parseInt(c.count) || 0,
          })),
      };
    } catch (error) {
      this.logger.error('获取分类统计失败:', error);
      return {
        sceneCategories: [],
        productCategories: [],
      };
    }
  }

  /**
   * 获取统计概览
   */
  async getOverview() {
    const total = await this.knowledgeRepository.count();
    const active = await this.knowledgeRepository.count({ where: { status: 'active' } });
    const pendingReview = await this.pendingReviewRepository.count({ where: { reviewStatus: 'pending' } });

    // 高负反馈预警（负反馈>=3次）
    const highNegativeFeedback = await this.knowledgeRepository.count({
      where: {
        negativeFeedbackCount: 3, // TypeORM的MoreThanOrEqual需要导入
        status: 'active',
      },
    });

    return {
      total,
      active,
      inactive: total - active,
      pendingReview,
      highNegativeFeedback,
    };
  }
}
