import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AiMarketingContent } from './entities/ai-marketing-content.entity';
import {
  CreateMarketingContentDto,
  UpdateMarketingContentDto,
  QueryMarketingContentDto,
  RecordUsageDto,
} from './dto/marketing-content.dto';

@Injectable()
export class MarketingContentService {
  private readonly logger = new Logger(MarketingContentService.name);

  constructor(
    @InjectRepository(AiMarketingContent)
    private readonly contentRepository: Repository<AiMarketingContent>,
  ) {}

  /**
   * 创建文案
   */
  async create(userId: number, dto: CreateMarketingContentDto) {
    const content = this.contentRepository.create({
      ...dto,
      userId,
    });

    await this.contentRepository.save(content);

    this.logger.log(`用户${userId}保存文案到文案库: ${dto.title}`);

    return content;
  }

  /**
   * 查询文案列表
   */
  async findAll(userId: number, query: QueryMarketingContentDto, userRole: string) {
    const {
      page = 1,
      limit = 20,
      contentType,
      isFavorite,
      category,
      keyword,
    } = query;

    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .orderBy('content.createTime', 'DESC');

    // 权限过滤：普通用户只能看自己的
    if (userRole === 'sales') {
      queryBuilder.andWhere('content.userId = :userId', { userId });
    }

    // 条件筛选
    if (contentType) {
      queryBuilder.andWhere('content.contentType = :contentType', { contentType });
    }

    if (isFavorite !== undefined) {
      queryBuilder.andWhere('content.isFavorite = :isFavorite', { isFavorite });
    }

    if (category) {
      queryBuilder.andWhere('content.category = :category', { category });
    }

    // 关键词搜索（标题或内容）
    if (keyword) {
      queryBuilder.andWhere(
        '(content.title LIKE :keyword OR content.content LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 分页
    const [list, total] = await queryBuilder
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
   * 获取单个文案详情
   */
  async findOne(id: number) {
    const content = await this.contentRepository.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException('文案不存在');
    }

    return content;
  }

  /**
   * 更新文案
   */
  async update(id: number, dto: UpdateMarketingContentDto) {
    const content = await this.findOne(id);

    Object.assign(content, dto);

    await this.contentRepository.save(content);

    this.logger.log(`更新文案: ${id}`);

    return content;
  }

  /**
   * 删除文案
   */
  async remove(id: number) {
    const result = await this.contentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('文案不存在');
    }

    this.logger.log(`删除文案: ${id}`);

    return { message: '删除成功' };
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(id: number) {
    const content = await this.findOne(id);

    content.isFavorite = content.isFavorite === 1 ? 0 : 1;

    await this.contentRepository.save(content);

    return {
      message: content.isFavorite === 1 ? '已收藏' : '已取消收藏',
      isFavorite: content.isFavorite,
    };
  }

  /**
   * 记录使用
   */
  async recordUsage(id: number, dto: RecordUsageDto) {
    const content = await this.findOne(id);

    // 更新使用次数和最后使用时间
    content.useCount += 1;
    content.lastUsedTime = new Date();

    await this.contentRepository.save(content);

    // TODO: 如果需要详细记录，可以保存到ai_marketing_content_usage表

    this.logger.log(`记录文案使用: ${id}, 总使用次数: ${content.useCount}`);

    return {
      message: '使用记录已保存',
      useCount: content.useCount,
    };
  }

  /**
   * 获取统计数据
   */
  async getStatistics(userId: number, userRole: string) {
    const queryBuilder = this.contentRepository.createQueryBuilder('content');

    // 权限过滤
    if (userRole === 'sales') {
      queryBuilder.where('content.userId = :userId', { userId });
    }

    const [
      totalCount,
      favoriteCount,
      朋友圈Count,
      微信群发Count,
      抖音Count,
      小红书Count,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().where('content.isFavorite = 1').getCount(),
      queryBuilder.clone().where('content.contentType = :type', { type: '朋友圈文案' }).getCount(),
      queryBuilder.clone().where('content.contentType = :type', { type: '微信群发文案' }).getCount(),
      queryBuilder.clone().where('content.contentType = :type', { type: '抖音营销文案' }).getCount(),
      queryBuilder.clone().where('content.contentType = :type', { type: '小红书营销文案' }).getCount(),
    ]);

    // 获取总使用次数
    const usageResult = await queryBuilder
      .clone()
      .select('SUM(content.useCount)', 'totalUsage')
      .getRawOne();

    return {
      totalCount,
      favoriteCount,
      totalUsage: Number(usageResult?.totalUsage || 0),
      typeDistribution: {
        朋友圈: 朋友圈Count,
        微信群发: 微信群发Count,
        抖音: 抖音Count,
        小红书: 小红书Count,
      },
    };
  }

  /**
   * 获取所有分类
   */
  async getCategories(userId: number, userRole: string) {
    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .select('DISTINCT content.category', 'category')
      .where('content.category IS NOT NULL');

    // 权限过滤
    if (userRole === 'sales') {
      queryBuilder.andWhere('content.userId = :userId', { userId });
    }

    const results = await queryBuilder.getRawMany();

    return results.map(r => r.category).filter(Boolean);
  }
}
