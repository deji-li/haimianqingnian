import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { OperationAccount } from './entities/operation-account.entity';
import { OperationDailyRecord } from './entities/operation-daily-record.entity';
import { OperationCommissionRecord } from './entities/operation-commission-record.entity';
import {
  CreateOperationAccountDto,
  UpdateOperationAccountDto,
  OperationAccountQueryDto,
  CreateDailyReportDto,
  UpdateDailyReportDto,
  DailyReportQueryDto,
  CommissionRecordQueryDto,
  UpdateCommissionStatusDto,
} from './dto';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(OperationAccount)
    private readonly accountRepository: Repository<OperationAccount>,
    @InjectRepository(OperationDailyRecord)
    private readonly dailyRecordRepository: Repository<OperationDailyRecord>,
    @InjectRepository(OperationCommissionRecord)
    private readonly commissionRepository: Repository<OperationCommissionRecord>,
  ) {}

  // ==================== 辅助方法 ====================

  /**
   * 从校区名称提取城市
   */
  private extractCityFromCampus(campusName: string): string | null {
    if (!campusName) return null;
    const cities = ['广州', '上海', '深圳', '北京'];
    for (const city of cities) {
      if (campusName.includes(city)) {
        return city;
      }
    }
    return null;
  }

  // ==================== 账号管理 ====================

  async createAccount(dto: CreateOperationAccountDto) {
    const account = this.accountRepository.create(dto);
    return await this.accountRepository.save(account);
  }

  async findAllAccounts(query: OperationAccountQueryDto) {
    const { page = 1, pageSize = 10, platformType, city, status, operatorId, keyword } = query;

    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.operator', 'operator')
      .leftJoinAndSelect('account.campus', 'campus');

    if (platformType) {
      queryBuilder.andWhere('account.platform_type = :platformType', { platformType });
    }

    if (status) {
      queryBuilder.andWhere('account.status = :status', { status });
    }

    if (operatorId) {
      queryBuilder.andWhere('account.operator_id = :operatorId', { operatorId });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(account.account_name LIKE :keyword OR account.account_id LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder.orderBy('account.create_time', 'DESC');

    // 先查询所有数据
    const allData = await queryBuilder.getMany();

    // 添加虚拟字段并提取城市
    let formattedList = allData.map((account) => ({
      ...account,
      operatorName: account.operator?.realName || account.operator?.username,
      campusName: account.campus?.campusName,
      city: this.extractCityFromCampus(account.campus?.campusName || ''),
    }));

    // 如果有城市过滤，在内存中过滤
    if (city) {
      formattedList = formattedList.filter((item) => item.city === city);
    }

    const total = formattedList.length;

    // 分页
    const startIndex = (page - 1) * pageSize;
    const paginatedList = formattedList.slice(startIndex, startIndex + pageSize);

    return {
      list: paginatedList,
      total,
      page,
      pageSize,
    };
  }

  async findAccountById(id: number) {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['operator', 'campus'],
    });

    if (!account) {
      throw new NotFoundException(`账号ID ${id} 不存在`);
    }

    return {
      ...account,
      operatorName: account.operator?.realName || account.operator?.username,
      campusName: account.campus?.campusName,
      city: this.extractCityFromCampus(account.campus?.campusName || ''),
    };
  }

  async updateAccount(id: number, dto: UpdateOperationAccountDto) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`账号ID ${id} 不存在`);
    }

    Object.assign(account, dto);
    return await this.accountRepository.save(account);
  }

  async deleteAccount(id: number) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`账号ID ${id} 不存在`);
    }

    await this.accountRepository.remove(account);
    return { message: '删除成功' };
  }

  // ==================== 日报管理 ====================

  async createDailyReport(dto: CreateDailyReportDto) {
    // 检查是否已存在该日期的该账号的日报
    const existing = await this.dailyRecordRepository.findOne({
      where: {
        reportDate: new Date(dto.reportDate),
        accountId: dto.accountId,
      },
    });

    if (existing) {
      throw new BadRequestException('该账号在此日期已存在日报记录，请使用更新功能');
    }

    const record = this.dailyRecordRepository.create(dto);
    const saved = await this.dailyRecordRepository.save(record);

    // 如果账号状态发生变化，同步更新账号表
    if (dto.accountStatusChanged === 1 && dto.newStatus) {
      await this.accountRepository.update(dto.accountId, {
        status: dto.newStatus,
        lastUpdateTime: new Date(),
      });
    }

    return saved;
  }

  async findAllDailyReports(query: DailyReportQueryDto) {
    const {
      page = 1,
      pageSize = 10,
      startDate,
      endDate,
      accountId,
      operatorId,
      platformType,
      city,
    } = query;

    const queryBuilder = this.dailyRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.account', 'account')
      .leftJoinAndSelect('account.campus', 'campus')
      .leftJoinAndSelect('record.operator', 'operator');

    if (startDate && endDate) {
      queryBuilder.andWhere('record.report_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('record.report_date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('record.report_date <= :endDate', { endDate });
    }

    if (accountId) {
      queryBuilder.andWhere('record.account_id = :accountId', { accountId });
    }

    if (operatorId) {
      queryBuilder.andWhere('record.operator_id = :operatorId', { operatorId });
    }

    if (platformType) {
      queryBuilder.andWhere('account.platform_type = :platformType', { platformType });
    }

    queryBuilder.orderBy('record.report_date', 'DESC');

    // 先查询所有数据
    const allData = await queryBuilder.getMany();

    // 添加虚拟字段并提取城市
    let formattedList = allData.map((record) => ({
      ...record,
      accountName: record.account?.accountName,
      operatorName: record.operator?.realName || record.operator?.username,
      platformType: record.account?.platformType,
      city: this.extractCityFromCampus(record.account?.campus?.campusName || ''),
    }));

    // 如果有城市过滤，在内存中过滤
    if (city) {
      formattedList = formattedList.filter((item) => item.city === city);
    }

    const total = formattedList.length;

    // 分页
    const startIndex = (page - 1) * pageSize;
    const paginatedList = formattedList.slice(startIndex, startIndex + pageSize);

    return {
      list: paginatedList,
      total,
      page,
      pageSize,
    };
  }

  async findDailyReportById(id: number) {
    const record = await this.dailyRecordRepository.findOne({
      where: { id },
      relations: ['account', 'operator'],
    });

    if (!record) {
      throw new NotFoundException(`日报ID ${id} 不存在`);
    }

    return {
      ...record,
      accountName: record.account?.accountName,
      operatorName: record.operator?.realName || record.operator?.username,
      platformType: record.account?.platformType,
    };
  }

  async updateDailyReport(id: number, dto: UpdateDailyReportDto) {
    const record = await this.dailyRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`日报ID ${id} 不存在`);
    }

    Object.assign(record, dto);
    const saved = await this.dailyRecordRepository.save(record);

    // 如果账号状态发生变化，同步更新账号表
    if (dto.accountStatusChanged === 1 && dto.newStatus) {
      await this.accountRepository.update(record.accountId, {
        status: dto.newStatus,
        lastUpdateTime: new Date(),
      });
    }

    return saved;
  }

  async deleteDailyReport(id: number) {
    const record = await this.dailyRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`日报ID ${id} 不存在`);
    }

    await this.dailyRecordRepository.remove(record);
    return { message: '删除成功' };
  }

  // ==================== 提成管理 ====================

  async findAllCommissions(query: CommissionRecordQueryDto) {
    const { page = 1, pageSize = 10, operatorId, status, startDate, endDate } = query;

    const queryBuilder = this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.operator', 'operator')
      .leftJoinAndSelect('commission.customer', 'customer')
      .leftJoinAndSelect('commission.order', 'order')
      .leftJoinAndSelect('commission.approver', 'approver');

    if (operatorId) {
      queryBuilder.andWhere('commission.operator_id = :operatorId', { operatorId });
    }

    if (status) {
      queryBuilder.andWhere('commission.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('commission.create_time BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('commission.create_time >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('commission.create_time <= :endDate', { endDate });
    }

    queryBuilder.orderBy('commission.create_time', 'DESC');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 添加虚拟字段
    const formattedList = list.map((commission) => ({
      ...commission,
      operatorName: commission.operator?.realName || commission.operator?.username,
      customerName: commission.customer?.realName || commission.customer?.wechatNickname,
      orderNo: commission.order?.orderNo,
      approverName: commission.approver?.realName || commission.approver?.username,
    }));

    return {
      list: formattedList,
      total,
      page,
      pageSize,
    };
  }

  async updateCommissionStatus(id: number, dto: UpdateCommissionStatusDto) {
    const commission = await this.commissionRepository.findOne({ where: { id } });
    if (!commission) {
      throw new NotFoundException(`提成记录ID ${id} 不存在`);
    }

    Object.assign(commission, dto);
    return await this.commissionRepository.save(commission);
  }

  // ==================== 统计数据 ====================

  async getOperatorStats(operatorId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.dailyRecordRepository
      .createQueryBuilder('record')
      .where('record.operator_id = :operatorId', { operatorId });

    if (startDate && endDate) {
      queryBuilder.andWhere('record.report_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const records = await queryBuilder.getMany();

    // 统计数据
    const stats = {
      totalUpdateCount: records.reduce((sum, r) => sum + r.updateCount, 0),
      totalViewMin: records.reduce((sum, r) => sum + r.viewMin, 0),
      totalViewMax: records.reduce((sum, r) => sum + r.viewMax, 0),
      totalPlayMin: records.reduce((sum, r) => sum + r.playMin, 0),
      totalPlayMax: records.reduce((sum, r) => sum + r.playMax, 0),
      totalCommentMin: records.reduce((sum, r) => sum + r.commentMin, 0),
      totalCommentMax: records.reduce((sum, r) => sum + r.commentMax, 0),
      totalMessageMin: records.reduce((sum, r) => sum + r.messageMin, 0),
      totalMessageMax: records.reduce((sum, r) => sum + r.messageMax, 0),
      recordCount: records.length,
    };

    // 查询提成统计
    const commissionQueryBuilder = this.commissionRepository
      .createQueryBuilder('commission')
      .where('commission.operator_id = :operatorId', { operatorId });

    if (startDate && endDate) {
      commissionQueryBuilder.andWhere('commission.create_time BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const commissions = await commissionQueryBuilder.getMany();

    stats['totalCommissionAmount'] = commissions.reduce(
      (sum, c) => sum + Number(c.commissionAmount),
      0,
    );
    stats['paidCommissionAmount'] = commissions
      .filter((c) => c.status === '已发放')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    stats['pendingCommissionAmount'] = commissions
      .filter((c) => c.status === '待发放')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    stats['commissionCount'] = commissions.length;

    return stats;
  }
}
