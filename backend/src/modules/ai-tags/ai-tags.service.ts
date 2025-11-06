import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiCustomerTag } from './entities/ai-customer-tag.entity';
import { CreateTagDto, QueryTagsDto } from './dto/tag.dto';
import { AiAnalysisResult } from '../../common/services/ai/deepseek-analysis.service';

@Injectable()
export class AiTagsService {
  private readonly logger = new Logger(AiTagsService.name);

  constructor(
    @InjectRepository(AiCustomerTag)
    private readonly aiTagRepository: Repository<AiCustomerTag>,
  ) {}

  /**
   * 基于AI分析结果自动打标签
   * @param customerId 客户ID
   * @param analysisResult AI分析结果
   * @param chatRecordId 聊天记录ID
   */
  async autoTagFromAnalysis(
    customerId: number,
    analysisResult: AiAnalysisResult,
    chatRecordId: number,
  ): Promise<void> {
    try {
      this.logger.log(`开始为客户${customerId}自动打标签`);

      const tags: Partial<AiCustomerTag>[] = [];

      // 1. 基础信息标签
      if (analysisResult.customerProfile) {
        const profile = analysisResult.customerProfile;

        if (profile.parentRole) {
          tags.push({
            customerId,
            tagCategory: '基础信息',
            tagName: '家长身份',
            tagValue: profile.parentRole,
            source: 'AI自动',
            confidence: 0.9,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        }

        if (profile.studentGrade) {
          tags.push({
            customerId,
            tagCategory: '基础信息',
            tagName: '学生年级',
            tagValue: profile.studentGrade,
            source: 'AI自动',
            confidence: 0.85,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        }

        if (profile.location) {
          tags.push({
            customerId,
            tagCategory: '基础信息',
            tagName: '所在地区',
            tagValue: profile.location,
            source: 'AI自动',
            confidence: 0.8,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        }

        if (profile.familyEconomicLevel) {
          tags.push({
            customerId,
            tagCategory: '基础信息',
            tagName: '经济水平',
            tagValue: profile.familyEconomicLevel,
            source: 'AI自动',
            confidence: 0.7,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        }

        if (profile.educationAttitude) {
          tags.push({
            customerId,
            tagCategory: '行为特征',
            tagName: '教育重视度',
            tagValue: profile.educationAttitude,
            source: 'AI自动',
            confidence: 0.8,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        }

        if (profile.decisionMakerRole) {
          tags.push({
            customerId,
            tagCategory: '行为特征',
            tagName: '决策模式',
            tagValue: profile.decisionMakerRole,
            source: 'AI自动',
            confidence: 0.75,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        }

        if (profile.communicationStyle) {
          tags.push({
            customerId,
            tagCategory: '行为特征',
            tagName: '沟通风格',
            tagValue: profile.communicationStyle,
            source: 'AI自动',
            confidence: 0.8,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        }
      }

      // 2. 需求痛点标签
      if (analysisResult.customerNeeds && analysisResult.customerNeeds.length > 0) {
        analysisResult.customerNeeds.forEach((need) => {
          tags.push({
            customerId,
            tagCategory: '需求痛点',
            tagName: '客户需求',
            tagValue: need,
            source: 'AI自动',
            confidence: 0.85,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        });
      }

      if (analysisResult.customerPainPoints && analysisResult.customerPainPoints.length > 0) {
        analysisResult.customerPainPoints.forEach((pain) => {
          tags.push({
            customerId,
            tagCategory: '需求痛点',
            tagName: '客户痛点',
            tagValue: pain,
            source: 'AI自动',
            confidence: 0.85,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        });
      }

      if (analysisResult.customerInterests && analysisResult.customerInterests.length > 0) {
        analysisResult.customerInterests.forEach((interest) => {
          tags.push({
            customerId,
            tagCategory: '需求痛点',
            tagName: '感兴趣的点',
            tagValue: interest,
            source: 'AI自动',
            confidence: 0.8,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        });
      }

      if (analysisResult.customerObjections && analysisResult.customerObjections.length > 0) {
        analysisResult.customerObjections.forEach((objection) => {
          tags.push({
            customerId,
            tagCategory: '需求痛点',
            tagName: '客户顾虑',
            tagValue: objection,
            source: 'AI自动',
            confidence: 0.85,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        });
      }

      // 3. 质量评估标签
      if (analysisResult.qualityLevel) {
        tags.push({
          customerId,
          tagCategory: '质量评估',
          tagName: '线索质量',
          tagValue: `${analysisResult.qualityLevel}级`,
          source: 'AI自动',
          confidence: 0.9,
          fromChatRecordId: chatRecordId,
          isActive: 1,
        });
      }

      if (analysisResult.intentionScore !== undefined) {
        let intentionLevel = '低意向';
        if (analysisResult.intentionScore >= 80) {
          intentionLevel = '高意向';
        } else if (analysisResult.intentionScore >= 50) {
          intentionLevel = '中意向';
        }

        tags.push({
          customerId,
          tagCategory: '质量评估',
          tagName: '意向程度',
          tagValue: intentionLevel,
          source: 'AI自动',
          confidence: 0.85,
          fromChatRecordId: chatRecordId,
          isActive: 1,
        });
      }

      if (analysisResult.dealOpportunity) {
        tags.push({
          customerId,
          tagCategory: '质量评估',
          tagName: '成交机会',
          tagValue: analysisResult.dealOpportunity,
          source: 'AI自动',
          confidence: 0.75,
          fromChatRecordId: chatRecordId,
          isActive: 1,
        });
      }

      // 4. 风险标签
      if (analysisResult.riskLevel && analysisResult.riskLevel !== '无风险') {
        tags.push({
          customerId,
          tagCategory: '风险标签',
          tagName: '流失风险',
          tagValue: analysisResult.riskLevel,
          source: 'AI自动',
          confidence: 0.8,
          fromChatRecordId: chatRecordId,
          isActive: 1,
        });
      }

      if (analysisResult.competitorMentioned && analysisResult.competitorMentioned.length > 0) {
        analysisResult.competitorMentioned.forEach((competitor) => {
          tags.push({
            customerId,
            tagCategory: '风险标签',
            tagName: '竞品关注',
            tagValue: competitor,
            source: 'AI自动',
            confidence: 0.9,
            fromChatRecordId: chatRecordId,
            isActive: 1,
          });
        });
      }

      // 5. 情绪态度标签
      if (analysisResult.customerMindset) {
        tags.push({
          customerId,
          tagCategory: '情绪态度',
          tagName: '客户心态',
          tagValue: analysisResult.customerMindset,
          source: 'AI自动',
          confidence: 0.75,
          fromChatRecordId: chatRecordId,
          isActive: 1,
        });
      }

      if (analysisResult.emotionalTone) {
        tags.push({
          customerId,
          tagCategory: '情绪态度',
          tagName: '情绪基调',
          tagValue: analysisResult.emotionalTone,
          source: 'AI自动',
          confidence: 0.7,
          fromChatRecordId: chatRecordId,
          isActive: 1,
        });
      }

      if (analysisResult.trustLevel) {
        tags.push({
          customerId,
          tagCategory: '情绪态度',
          tagName: '信任程度',
          tagValue: analysisResult.trustLevel,
          source: 'AI自动',
          confidence: 0.75,
          fromChatRecordId: chatRecordId,
          isActive: 1,
        });
      }

      // 6. 批量插入标签（先删除旧的AI自动标签，避免重复）
      if (tags.length > 0) {
        // 删除同一聊天记录产生的旧标签
        await this.aiTagRepository.delete({
          customerId,
          fromChatRecordId: chatRecordId,
          source: 'AI自动',
        });

        // 插入新标签
        await this.aiTagRepository.save(tags);

        this.logger.log(`成功为客户${customerId}添加${tags.length}个AI标签`);
      }
    } catch (error) {
      this.logger.error(`自动打标签失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 手动创建标签
   */
  async create(createTagDto: CreateTagDto, userId: number) {
    const tag = this.aiTagRepository.create({
      ...createTagDto,
      source: '人工添加',
      isActive: 1,
    });

    return this.aiTagRepository.save(tag);
  }

  /**
   * 查询客户标签
   */
  async findByCustomer(customerId: number) {
    const tags = await this.aiTagRepository.find({
      where: {
        customerId,
        isActive: 1,
      },
      order: {
        createTime: 'DESC',
      },
    });

    // 按分类分组
    const groupedTags = tags.reduce((acc, tag) => {
      if (!acc[tag.tagCategory]) {
        acc[tag.tagCategory] = [];
      }
      acc[tag.tagCategory].push(tag);
      return acc;
    }, {} as Record<string, AiCustomerTag[]>);

    return {
      tags,
      groupedTags,
      total: tags.length,
    };
  }

  /**
   * 查询标签列表
   */
  async findAll(query: QueryTagsDto) {
    const { customerId, tagCategory, source, isActive } = query;

    const queryBuilder = this.aiTagRepository.createQueryBuilder('tag');

    if (customerId) {
      queryBuilder.andWhere('tag.customerId = :customerId', { customerId });
    }

    if (tagCategory) {
      queryBuilder.andWhere('tag.tagCategory = :tagCategory', { tagCategory });
    }

    if (source) {
      queryBuilder.andWhere('tag.source = :source', { source });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('tag.isActive = :isActive', { isActive });
    }

    const tags = await queryBuilder
      .orderBy('tag.createTime', 'DESC')
      .getMany();

    return {
      list: tags,
      total: tags.length,
    };
  }

  /**
   * 删除标签
   */
  async remove(id: number) {
    // 软删除：设置为无效
    const result = await this.aiTagRepository.update(id, { isActive: 0 });

    return {
      success: result.affected > 0,
      message: result.affected > 0 ? '删除成功' : '标签不存在',
    };
  }

  /**
   * 获取标签统计
   */
  async getStatistics(customerId?: number) {
    const queryBuilder = this.aiTagRepository
      .createQueryBuilder('tag')
      .where('tag.isActive = 1');

    if (customerId) {
      queryBuilder.andWhere('tag.customerId = :customerId', { customerId });
    }

    const [
      totalTags,
      aiTags,
      manualTags,
      categories,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('tag.source = :source', { source: 'AI自动' }).getCount(),
      queryBuilder.clone().andWhere('tag.source = :source', { source: '人工添加' }).getCount(),
      queryBuilder
        .clone()
        .select('tag.tagCategory', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('tag.tagCategory')
        .getRawMany(),
    ]);

    return {
      totalTags,
      aiTags,
      manualTags,
      categories: categories.map((c) => ({
        category: c.category,
        count: parseInt(c.count),
      })),
    };
  }
}
