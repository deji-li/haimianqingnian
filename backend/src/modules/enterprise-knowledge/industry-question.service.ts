import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EnterpriseKnowledgeBase,
  IndustryQuestionLibrary,
} from './entities/index';
import {
  QueryIndustryQuestionDto,
  GenerateIndustryQuestionDto,
  AdoptIndustryQuestionDto,
  BatchAdoptIndustryQuestionDto,
} from './dto/industry-question.dto';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';

@Injectable()
export class IndustryQuestionService {
  private readonly logger = new Logger(IndustryQuestionService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(IndustryQuestionLibrary)
    private readonly industryQuestionRepository: Repository<IndustryQuestionLibrary>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 查询行业问题库
   */
  async getIndustryQuestions(query: QueryIndustryQuestionDto) {
    const {
      page = 1,
      limit = 20,
      industry,
      category,
      importance,
      keyword,
    } = query;

    const queryBuilder = this.industryQuestionRepository.createQueryBuilder('iq');

    if (industry) {
      queryBuilder.andWhere('iq.industry = :industry', { industry });
    }

    if (category) {
      queryBuilder.andWhere('iq.category = :category', { category });
    }

    if (importance) {
      queryBuilder.andWhere('iq.importance = :importance', { importance });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(iq.question LIKE :keyword OR iq.answer LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const [list, total] = await queryBuilder
      .orderBy('iq.importance', 'DESC') // high > medium > low
      .addOrderBy('iq.usageCount', 'DESC') // 优先显示高使用率的
      .addOrderBy('iq.createTime', 'DESC')
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
   * AI生成行业问题（调用配置化提示词）
   */
  async generateIndustryQuestions(dto: GenerateIndustryQuestionDto) {
    this.logger.log(`AI生成行业问题 - 行业: ${dto.industry}, 数量: ${dto.count}`);

    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_industry_questions',
        {
          industry: dto.industry,
          count: dto.count || 10,
          specificScenario: dto.specificScenario || '',
          targetCustomerType: dto.targetCustomerType || '',
        },
      );

      // AI返回格式: { questions: [{question, suggestedAnswer, category, importance, reason}] }
      if (result && result.questions && Array.isArray(result.questions)) {
        // 保存到行业问题库
        const entities = result.questions.map((q: any) =>
          this.industryQuestionRepository.create({
            industryName: dto.industry, // Using industryName instead of industry
            question: q.question,
            answerTemplate: q.suggestedAnswer, // Using answerTemplate instead of answer
            sceneCategory: q.category || '常见问题', // Using sceneCategory instead of category
            // importance: q.importance || 'medium', // REMOVED: Field doesn't exist
            usageCount: 0,
            // tags: q.tags || null, // REMOVED: Field doesn't exist
            sourceType: 'ai_generate', // Changed from 'ai_generated' to match enum value
          }),
        );

        const saved = await this.industryQuestionRepository.save(entities);

        return {
          success: true,
          message: `成功生成${saved.length}个行业问题`,
          count: saved.length,
          questions: saved,
        };
      }

      throw new Error('AI返回格式错误');
    } catch (error) {
      this.logger.error(`AI生成行业问题失败: ${error.message}`, error.stack);
      throw new BadRequestException('AI生成失败，请稍后重试');
    }
  }

  /**
   * 采纳单个行业问题到知识库
   */
  async adoptIndustryQuestion(dto: AdoptIndustryQuestionDto, userId: number) {
    const industryQuestion = await this.industryQuestionRepository.findOne({
      where: { id: dto.questionId },
    });

    if (!industryQuestion) {
      throw new NotFoundException('行业问题不存在');
    }

    // 准备知识库数据
    let question = industryQuestion.question;
    let answer = industryQuestion.answerTemplate; // Using answerTemplate instead of answer

    if (dto.editBeforeAdopt) {
      if (!dto.editedQuestion || !dto.editedAnswer) {
        throw new BadRequestException('编辑模式必须提供问题和答案');
      }
      question = dto.editedQuestion;
      answer = dto.editedAnswer;
    }

    // 创建知识库条目
    const knowledge = this.knowledgeRepository.create({
      title: question,
      content: answer,
      sceneCategory: dto.sceneCategory || industryQuestion.sceneCategory, // Using sceneCategory instead of category
      productCategory: dto.productCategory || '通用',
      questionType: '行业常见问题',
      sourceType: 'industry_recommend',
      sourceId: dto.questionId,
      creatorId: userId,
      status: 'active',
      priority: dto.priority || 70,
      keywords: null, // industryQuestion.tags doesn't exist - using null
    });

    await this.knowledgeRepository.save(knowledge);

    // 更新行业问题使用次数
    await this.industryQuestionRepository.update(dto.questionId, {
      usageCount: industryQuestion.usageCount + 1,
    });

    this.logger.log(`采纳行业问题ID=${dto.questionId}到知识库`);

    return {
      success: true,
      message: '成功采纳到知识库',
      knowledgeId: knowledge.id,
    };
  }

  /**
   * 批量采纳行业问题
   */
  async batchAdoptIndustryQuestions(dto: BatchAdoptIndustryQuestionDto, userId: number) {
    if (dto.questionIds.length === 0) {
      throw new BadRequestException('问题ID列表不能为空');
    }

    const industryQuestions = await this.industryQuestionRepository.findByIds(dto.questionIds);

    if (industryQuestions.length === 0) {
      throw new NotFoundException('未找到行业问题');
    }

    let successCount = 0;

    for (const iq of industryQuestions) {
      try {
        const knowledge = this.knowledgeRepository.create({
          title: iq.question,
          content: iq.answerTemplate, // Using answerTemplate instead of answer
          sceneCategory: iq.sceneCategory, // Using sceneCategory instead of category
          productCategory: '通用',
          questionType: '行业常见问题',
          sourceType: 'industry_recommend',
          sourceId: iq.id,
          creatorId: userId,
          status: 'active',
          priority: 70, // importance field doesn't exist - using fixed value
          keywords: null, // tags field doesn't exist - using null
        });

        await this.knowledgeRepository.save(knowledge);

        // 更新使用次数
        await this.industryQuestionRepository.update(iq.id, {
          usageCount: iq.usageCount + 1,
        });

        successCount++;
      } catch (error) {
        this.logger.error(`批量采纳失败 ID=${iq.id}: ${error.message}`);
      }
    }

    return {
      success: true,
      message: `批量采纳完成: ${successCount}/${dto.questionIds.length}`,
      successCount,
      totalCount: dto.questionIds.length,
    };
  }

  /**
   * 获取行业问题统计
   */
  async getIndustryQuestionStats() {
    // 总问题数
    const totalQuestions = await this.industryQuestionRepository.count();

    // 已采纳数量（被使用过的）
    const adoptedCount = await this.industryQuestionRepository
      .createQueryBuilder('iq')
      .where('iq.usageCount > 0')
      .getCount();

    // 按行业分组统计
    const byIndustryRaw = await this.industryQuestionRepository
      .createQueryBuilder('iq')
      .select('iq.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN iq.usageCount > 0 THEN 1 ELSE 0 END)', 'adoptedCount')
      .groupBy('iq.industry')
      .getRawMany();

    const byIndustry = byIndustryRaw.map((row) => ({
      industry: row.industry,
      count: parseInt(row.count),
      adoptedCount: parseInt(row.adoptedCount || '0'),
    }));

    // 按重要程度分组统计
    const byImportanceRaw = await this.industryQuestionRepository
      .createQueryBuilder('iq')
      .select('iq.importance', 'importance')
      .addSelect('COUNT(*)', 'count')
      .groupBy('iq.importance')
      .getRawMany();

    const byImportance = byImportanceRaw.map((row) => ({
      importance: row.importance,
      count: parseInt(row.count),
    }));

    return {
      totalQuestions,
      adoptedCount,
      byIndustry,
      byImportance,
    };
  }
}
