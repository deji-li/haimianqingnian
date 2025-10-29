import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OperationLog } from './entities/operation-log.entity';

export interface CreateLogDto {
  userId?: number;
  username?: string;
  module: string;
  action: string;
  detail?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: number;
  errorMsg?: string;
}

export interface QueryLogDto {
  page?: number;
  pageSize?: number;
  username?: string;
  module?: string;
  startTime?: string;
  endTime?: string;
  status?: number;
}

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(OperationLog)
    private logRepository: Repository<OperationLog>,
  ) {}

  /**
   * 创建操作日志
   */
  async create(data: CreateLogDto): Promise<OperationLog> {
    const log = this.logRepository.create(data);
    return await this.logRepository.save(log);
  }

  /**
   * 查询操作日志列表
   */
  async findAll(query: QueryLogDto) {
    const { page = 1, pageSize = 20, username, module, startTime, endTime, status } = query;

    const qb = this.logRepository.createQueryBuilder('log');

    // 按用户名搜索
    if (username) {
      qb.andWhere('log.username LIKE :username', { username: `%${username}%` });
    }

    // 按模块筛选
    if (module) {
      qb.andWhere('log.module = :module', { module });
    }

    // 按状态筛选
    if (status !== undefined) {
      qb.andWhere('log.status = :status', { status });
    }

    // 时间范围筛选
    if (startTime && endTime) {
      qb.andWhere('log.create_time BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    }

    // 按创建时间倒序排列
    qb.orderBy('log.create_time', 'DESC');

    // 分页
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取操作模块列表（用于筛选）
   */
  async getModules(): Promise<string[]> {
    const result = await this.logRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.module', 'module')
      .getRawMany();

    return result.map(item => item.module);
  }

  /**
   * 批量删除日志（按时间）
   */
  async deleteByTime(beforeDate: Date): Promise<number> {
    const result = await this.logRepository
      .createQueryBuilder()
      .delete()
      .where('create_time < :beforeDate', { beforeDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * 获取日志详情
   */
  async findOne(id: number): Promise<OperationLog> {
    return await this.logRepository.findOne({ where: { id } });
  }
}
