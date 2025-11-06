import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AiKnowledgeBase } from './entities/ai-knowledge-base.entity';
import {
  CreateKnowledgeDto,
  UpdateKnowledgeDto,
  QueryKnowledgeDto,
  SearchKnowledgeDto,
} from './dto/knowledge.dto';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';

@Injectable()
export class AiKnowledgeService {
  private readonly logger = new Logger(AiKnowledgeService.name);

  constructor(
    @InjectRepository(AiKnowledgeBase)
    private readonly knowledgeRepository: Repository<AiKnowledgeBase>,
    private readonly deepseekService: DeepseekAnalysisService,
  ) {}

  /**
   * 创建知识库条目
   */
  async create(createDto: CreateKnowledgeDto, creatorId: number) {
    const knowledge = this.knowledgeRepository.create({
      ...createDto,
      creatorId,
      isActive: 1,
    });

    return this.knowledgeRepository.save(knowledge);
  }

  /**
   * 更新知识库条目
   */
  async update(id: number, updateDto: UpdateKnowledgeDto) {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id },
    });

    if (!knowledge) {
      throw new NotFoundException('知识库条目不存在');
    }

    Object.assign(knowledge, updateDto);

    return this.knowledgeRepository.save(knowledge);
  }

  /**
   * 删除知识库条目（软删除）
   */
  async remove(id: number) {
    const result = await this.knowledgeRepository.update(id, {
      isActive: 0,
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
      category,
      keyword,
      isActive,
    } = query;

    const queryBuilder = this.knowledgeRepository.createQueryBuilder('kb');

    if (category) {
      queryBuilder.andWhere('kb.category = :category', { category });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(kb.title LIKE :keyword OR kb.content LIKE :keyword OR kb.keywords LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('kb.isActive = :isActive', { isActive });
    } else {
      // 默认只查询启用的
      queryBuilder.andWhere('kb.isActive = 1');
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
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id },
    });

    if (!knowledge) {
      throw new NotFoundException('知识库条目不存在');
    }

    // 增加使用次数
    await this.knowledgeRepository.update(id, {
      usageCount: knowledge.usageCount + 1,
    });

    return knowledge;
  }

  /**
   * 智能搜索知识库（基于AI语义匹配）
   */
  async intelligentSearch(searchDto: SearchKnowledgeDto) {
    try {
      this.logger.log(`智能搜索: ${searchDto.question}`);

      // 1. 先做基础关键词搜索
      const keywords = this.extractKeywords(searchDto.question);
      let candidates = await this.searchByKeywords(keywords);

      // 2. 如果候选结果少于3个，扩大搜索范围
      if (candidates.length < 3) {
        candidates = await this.knowledgeRepository.find({
          where: { isActive: 1 },
          order: { priority: 'DESC', usageCount: 'DESC' },
          take: 10,
        });
      }

      // 3. 使用AI评分和排序
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
  private async basicSearch(searchDto: SearchKnowledgeDto) {
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
    // 简单的中文关键词提取（可以使用更高级的NLP库）
    const keywords: string[] = [];

    // 提取2-4字的词组
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
      .where('kb.isActive = 1');

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

    return queryBuilder
      .orderBy('kb.priority', 'DESC')
      .addOrderBy('kb.usageCount', 'DESC')
      .take(10)
      .getMany();
  }

  /**
   * 使用AI对知识库条目评分和排序
   */
  private async scoreKnowledgeWithAI(
    question: string,
    candidates: AiKnowledgeBase[],
  ) {
    try {
      const scoringPrompt = `用户问题：${question}

候选知识库：
${candidates.map((k, i) => `${i + 1}. 标题：${k.title}\n   内容：${k.content.substring(0, 100)}...`).join('\n\n')}

请评估每个知识库条目与用户问题的相关度，按照相关度从高到低排序，输出JSON格式：
[1, 3, 2, ...]（数字代表条目序号）

只输出JSON数组，不要其他说明。`;

      const response = await this.deepseekService['httpClient'].post(
        this.deepseekService['apiUrl'],
        {
          model: this.deepseekService['model'],
          messages: [
            { role: 'system', content: '你是一个知识库搜索助手' },
            { role: 'user', content: scoringPrompt },
          ],
          temperature: 0.3,
          max_tokens: 200,
        },
      );

      const aiResponse = response.data.choices[0].message.content.trim();
      const ranking = JSON.parse(aiResponse);

      // 按AI排序重组结果
      return ranking.map((index: number) => candidates[index - 1]).filter(Boolean);
    } catch (error) {
      this.logger.warn(`AI评分失败，使用默认排序: ${error.message}`);
      // 失败时返回原始顺序
      return candidates;
    }
  }

  /**
   * 获取知识库分类列表
   */
  async getCategories() {
    const categories = await this.knowledgeRepository
      .createQueryBuilder('kb')
      .select('kb.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('kb.isActive = 1')
      .groupBy('kb.category')
      .getRawMany();

    return categories.map((c) => ({
      category: c.category,
      count: parseInt(c.count),
    }));
  }

  /**
   * 批量导入知识库
   */
  async batchImport(knowledgeList: CreateKnowledgeDto[], creatorId: number) {
    const entities = knowledgeList.map((k) =>
      this.knowledgeRepository.create({
        ...k,
        creatorId,
        isActive: 1,
      }),
    );

    const saved = await this.knowledgeRepository.save(entities);

    return {
      success: true,
      imported: saved.length,
      message: `成功导入${saved.length}条知识`,
    };
  }
}
