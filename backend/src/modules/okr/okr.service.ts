import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Okr } from './entities/okr.entity';
import { KeyResult } from './entities/key-result.entity';
import { CreateOkrDto } from './dto/create-okr.dto';
import { UpdateOkrDto } from './dto/update-okr.dto';
import { QueryOkrDto } from './dto/query-okr.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';

@Injectable()
export class OkrService {
  constructor(
    @InjectRepository(Okr)
    private okrRepository: Repository<Okr>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
  ) {}

  // 创建OKR
  async create(createOkrDto: CreateOkrDto) {
    const { keyResults, ...okrData } = createOkrDto;

    // 创建OKR
    const okr = this.okrRepository.create(okrData);
    const savedOkr = await this.okrRepository.save(okr);

    // 创建关键结果
    if (keyResults && keyResults.length > 0) {
      const krEntities = keyResults.map((kr) =>
        this.keyResultRepository.create({
          ...kr,
          okrId: savedOkr.id,
          currentValue: 0,
          progress: 0,
        }),
      );
      await this.keyResultRepository.save(krEntities);
    }

    return this.findOne(savedOkr.id);
  }

  // 分页查询OKR列表
  async findAll(queryDto: QueryOkrDto, dataScope: any = {}) {
    const { page = 1, pageSize = 20, ownerId, type, status } = queryDto;

    const queryBuilder = this.okrRepository
      .createQueryBuilder('okr')
      .leftJoinAndSelect('users', 'user', 'okr.owner_id = user.id')
      .select([
        'okr.*',
        'user.real_name as ownerName',
        'user.username as ownerUsername',
      ]);

    // 数据权限过滤
    if (dataScope.userId) {
      queryBuilder.andWhere('okr.owner_id = :userId', {
        userId: dataScope.userId,
      });
    }

    // 搜索条件
    if (ownerId) {
      queryBuilder.andWhere('okr.owner_id = :ownerId', { ownerId });
    }

    if (type) {
      queryBuilder.andWhere('okr.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('okr.status = :status', { status });
    }

    // 排序
    queryBuilder.orderBy('okr.create_time', 'DESC');

    // 分页
    const total = await queryBuilder.getCount();
    const list = await queryBuilder
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();

    // 转换字段名并获取关键结果数量
    const formattedList = await Promise.all(
      list.map(async (item) => {
        const krCount = await this.keyResultRepository.count({
          where: { okrId: item.okr_id },
        });

        return {
          id: item.okr_id,
          title: item.okr_title,
          description: item.okr_description,
          ownerId: item.okr_owner_id,
          ownerName: item.ownerName,
          type: item.okr_type,
          startDate: item.okr_start_date,
          endDate: item.okr_end_date,
          status: item.okr_status,
          progress: parseFloat(item.okr_progress),
          createTime: item.okr_create_time,
          updateTime: item.okr_update_time,
          keyResultCount: krCount,
        };
      }),
    );

    return {
      list: formattedList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 查询单个OKR详情（包含关键结果）
  async findOne(id: number) {
    const okr = await this.okrRepository.findOne({
      where: { id },
    });

    if (!okr) {
      throw new NotFoundException('OKR不存在');
    }

    // 获取负责人信息
    const ownerResult = await this.okrRepository.query(
      'SELECT real_name, username FROM user WHERE id = ?',
      [okr.ownerId],
    );

    const ownerName = ownerResult.length > 0 ? ownerResult[0].real_name : null;
    const ownerUsername =
      ownerResult.length > 0 ? ownerResult[0].username : null;

    // 获取关键结果
    const keyResults = await this.keyResultRepository.find({
      where: { okrId: id },
      order: { id: 'ASC' },
    });

    return {
      ...okr,
      ownerName,
      ownerUsername,
      keyResults,
    };
  }

  // 更新OKR
  async update(id: number, updateOkrDto: UpdateOkrDto) {
    const okr = await this.okrRepository.findOne({ where: { id } });

    if (!okr) {
      throw new NotFoundException('OKR不存在');
    }

    const { keyResults, ...okrData } = updateOkrDto as any;

    // 更新OKR基本信息
    Object.assign(okr, okrData);
    await this.okrRepository.save(okr);

    return this.findOne(id);
  }

  // 删除OKR
  async remove(id: number) {
    const okr = await this.okrRepository.findOne({ where: { id } });

    if (!okr) {
      throw new NotFoundException('OKR不存在');
    }

    // 删除关联的关键结果
    await this.keyResultRepository.delete({ okrId: id });

    // 删除OKR
    await this.okrRepository.remove(okr);
    return { message: '删除成功' };
  }

  // 更新关键结果
  async updateKeyResult(id: number, updateDto: UpdateKeyResultDto) {
    const keyResult = await this.keyResultRepository.findOne({
      where: { id },
    });

    if (!keyResult) {
      throw new NotFoundException('关键结果不存在');
    }

    // 更新关键结果
    Object.assign(keyResult, updateDto);

    // 重新计算进度
    if (
      updateDto.currentValue !== undefined ||
      updateDto.targetValue !== undefined
    ) {
      keyResult.progress =
        keyResult.targetValue > 0
          ? Math.min(
              (keyResult.currentValue / keyResult.targetValue) * 100,
              100,
            )
          : 0;
    }

    await this.keyResultRepository.save(keyResult);

    // 更新OKR的总进度
    await this.recalculateOkrProgress(keyResult.okrId);

    return keyResult;
  }

  // 重新计算OKR进度
  private async recalculateOkrProgress(okrId: number) {
    const keyResults = await this.keyResultRepository.find({
      where: { okrId },
    });

    if (keyResults.length === 0) {
      return;
    }

    // 计算加权平均进度
    const totalWeight = keyResults.reduce(
      (sum, kr) => sum + (kr.weight || 1),
      0,
    );
    const weightedProgress = keyResults.reduce(
      (sum, kr) => sum + kr.progress * (kr.weight || 1),
      0,
    );

    const avgProgress =
      totalWeight > 0 ? weightedProgress / totalWeight : 0;

    // 更新OKR进度
    await this.okrRepository.update(okrId, {
      progress: parseFloat(avgProgress.toFixed(2)),
    });
  }

  // 添加关键结果
  async addKeyResult(okrId: number, description: string, targetValue: number, unit?: string, weight?: number) {
    const okr = await this.okrRepository.findOne({ where: { id: okrId } });

    if (!okr) {
      throw new NotFoundException('OKR不存在');
    }

    const keyResult = this.keyResultRepository.create({
      okrId,
      description,
      targetValue,
      currentValue: 0,
      unit,
      weight: weight || 1,
      progress: 0,
    });

    return await this.keyResultRepository.save(keyResult);
  }

  // 删除关键结果
  async removeKeyResult(id: number) {
    const keyResult = await this.keyResultRepository.findOne({
      where: { id },
    });

    if (!keyResult) {
      throw new NotFoundException('关键结果不存在');
    }

    const okrId = keyResult.okrId;
    await this.keyResultRepository.remove(keyResult);

    // 重新计算OKR进度
    await this.recalculateOkrProgress(okrId);

    return { message: '删除成功' };
  }

  // 获取OKR统计
  async getStatistics(userId?: number) {
    const queryBuilder = this.okrRepository.createQueryBuilder('okr');

    if (userId) {
      queryBuilder.where('okr.owner_id = :userId', { userId });
    }

    const result = await queryBuilder
      .select('okr.status', 'status')
      .addSelect('COUNT(okr.id)', 'count')
      .addSelect('AVG(okr.progress)', 'avgProgress')
      .groupBy('okr.status')
      .getRawMany();

    const statistics = {
      draft: { count: 0, avgProgress: 0 },
      active: { count: 0, avgProgress: 0 },
      completed: { count: 0, avgProgress: 0 },
      cancelled: { count: 0, avgProgress: 0 },
      total: { count: 0, avgProgress: 0 },
    };

    let totalCount = 0;
    let totalProgress = 0;

    result.forEach((item) => {
      const count = parseInt(item.count) || 0;
      const avgProgress = parseFloat(item.avgProgress) || 0;
      statistics[item.status] = { count, avgProgress };
      totalCount += count;
      totalProgress += avgProgress * count;
    });

    statistics.total = {
      count: totalCount,
      avgProgress: totalCount > 0 ? totalProgress / totalCount : 0,
    };

    return statistics;
  }
}
