import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SalesTarget } from './entities/sales-target.entity';
import {
  CreateSalesTargetDto,
  UpdateSalesTargetDto,
  SalesTargetDto,
  TargetProgressDto,
} from './dto/sales-target.dto';

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(SalesTarget)
    private targetRepository: Repository<SalesTarget>,
  ) {}

  /**
   * 创建销售目标
   */
  async create(createTargetDto: CreateSalesTargetDto): Promise<SalesTarget> {
    const target = this.targetRepository.create({
      ...createTargetDto,
      actualAmount: 0,
      actualCount: 0,
      status: 1, // 默认进行中
    });

    return await this.targetRepository.save(target);
  }

  /**
   * 更新销售目标
   */
  async update(id: number, updateTargetDto: UpdateSalesTargetDto): Promise<SalesTarget> {
    const target = await this.targetRepository.findOne({ where: { id } });

    if (!target) {
      throw new NotFoundException('销售目标不存在');
    }

    Object.assign(target, updateTargetDto);
    return await this.targetRepository.save(target);
  }

  /**
   * 删除销售目标
   */
  async remove(id: number): Promise<void> {
    const result = await this.targetRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('销售目标不存在');
    }
  }

  /**
   * 获取销售目标列表（实时从订单表计算实际完成数据）
   */
  async findAll(userId?: number): Promise<SalesTargetDto[]> {
    const queryBuilder = this.targetRepository
      .createQueryBuilder('target')
      .leftJoin('users', 'user', 'target.user_id = user.id')
      .select([
        'target.id',
        'target.user_id',
        'target.target_type',
        'target.target_amount',
        'target.actual_amount',
        'target.target_count',
        'target.actual_count',
        'target.start_date',
        'target.end_date',
        'target.status',
        'target.remark',
        'target.create_time',
        'target.update_time',
      ])
      .addSelect('user.real_name', 'userName')
      .orderBy('target.create_time', 'DESC');

    if (userId) {
      queryBuilder.where('target.user_id = :userId', { userId });
    }

    const results = await queryBuilder.getRawMany();

    // 为每个目标实时计算实际完成情况
    const targetsWithActual = await Promise.all(
      results.map(async (item) => {
        // 从订单表统计实际完成数据
        const orderStats = await this.targetRepository.query(
          `
          SELECT
            COUNT(*) as orderCount,
            COALESCE(SUM(payment_amount), 0) as totalAmount
          FROM orders
          WHERE sales_id = ?
            AND payment_time BETWEEN ? AND ?
            AND order_status != '已退款'
        `,
          [item.user_id, item.start_date, item.end_date],
        );

        const actualAmount = orderStats && orderStats.length > 0 ? Number(orderStats[0].totalAmount) : 0;
        const actualCount = orderStats && orderStats.length > 0 ? Number(orderStats[0].orderCount) : 0;

        return {
          id: item.target_id,
          userId: item.user_id,
          userName: item.userName || '未知',
          targetType: item.target_type,
          targetAmount: Number(item.target_amount),
          actualAmount: actualAmount, // 实时计算
          targetCount: item.target_count,
          actualCount: actualCount, // 实时计算
          startDate: item.start_date,
          endDate: item.end_date,
          status: item.target_status,
          remark: item.target_remark,
          amountProgress:
            item.target_amount > 0
              ? (actualAmount / Number(item.target_amount)) * 100
              : 0,
          countProgress:
            item.target_count > 0
              ? (actualCount / item.target_count) * 100
              : 0,
          createTime: item.create_time,
          updateTime: item.update_time,
        };
      }),
    );

    return targetsWithActual;
  }

  /**
   * 获取销售目标详情
   */
  async findOne(id: number): Promise<SalesTargetDto> {
    const result = await this.targetRepository
      .createQueryBuilder('target')
      .leftJoin('users', 'user', 'target.user_id = user.id')
      .where('target.id = :id', { id })
      .select([
        'target.id',
        'target.user_id',
        'target.target_type',
        'target.target_amount',
        'target.actual_amount',
        'target.target_count',
        'target.actual_count',
        'target.start_date',
        'target.end_date',
        'target.status',
        'target.remark',
        'target.create_time',
        'target.update_time',
      ])
      .addSelect('user.real_name', 'userName')
      .getRawOne();

    if (!result) {
      throw new NotFoundException('销售目标不存在');
    }

    return {
      id: result.target_id,
      userId: result.target_user_id,
      userName: result.userName || '未知',
      targetType: result.target_target_type,
      targetAmount: Number(result.target_target_amount),
      actualAmount: Number(result.target_actual_amount),
      targetCount: result.target_target_count,
      actualCount: result.target_actual_count,
      startDate: result.target_start_date,
      endDate: result.target_end_date,
      status: result.target_status,
      remark: result.target_remark,
      amountProgress:
        result.target_target_amount > 0
          ? (Number(result.target_actual_amount) / Number(result.target_target_amount)) * 100
          : 0,
      countProgress:
        result.target_target_count > 0
          ? (result.target_actual_count / result.target_target_count) * 100
          : 0,
      createTime: result.target_create_time,
      updateTime: result.target_update_time,
    };
  }

  /**
   * 获取目标进度（用于工作台展示）
   */
  async getProgress(userId: number): Promise<TargetProgressDto[]> {
    const now = new Date();
    const results = await this.targetRepository
      .createQueryBuilder('target')
      .leftJoin('users', 'user', 'target.user_id = user.id')
      .where('target.user_id = :userId', { userId })
      .andWhere('target.status = 1') // 只查询进行中的目标
      .select('target.id', 'target_id')
      .addSelect('target.user_id', 'target_user_id')
      .addSelect('target.target_type', 'target_target_type')
      .addSelect('target.target_amount', 'target_target_amount')
      .addSelect('target.actual_amount', 'target_actual_amount')
      .addSelect('target.target_count', 'target_target_count')
      .addSelect('target.actual_count', 'target_actual_count')
      .addSelect('target.start_date', 'target_start_date')
      .addSelect('target.end_date', 'target_end_date')
      .addSelect('user.real_name', 'userName')
      .orderBy('target.start_date', 'DESC')
      .getRawMany();

    // 为每个目标实时计算实际完成情况
    const progressList = await Promise.all(
      results.map(async (item) => {
        const endDate = new Date(item.target_end_date);
        const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // 从订单表统计实际完成数据
        const orderStats = await this.targetRepository.query(
          `
          SELECT
            COUNT(*) as orderCount,
            COALESCE(SUM(payment_amount), 0) as totalAmount
          FROM orders
          WHERE sales_id = ?
            AND payment_time BETWEEN ? AND ?
            AND order_status != '已退款'
        `,
          [item.target_user_id, item.target_start_date, item.target_end_date],
        );

        const actualAmount = orderStats && orderStats.length > 0 ? Number(orderStats[0].totalAmount) : 0;
        const actualCount = orderStats && orderStats.length > 0 ? Number(orderStats[0].orderCount) : 0;

        return {
          targetId: item.target_id,
          userId: item.target_user_id,
          userName: item.userName || '未知',
          targetType: item.target_target_type,
          targetAmount: Number(item.target_target_amount),
          actualAmount: actualAmount,
          targetCount: item.target_target_count,
          actualCount: actualCount,
          amountProgress:
            item.target_target_amount > 0
              ? (actualAmount / Number(item.target_target_amount)) * 100
              : 0,
          countProgress:
            item.target_target_count > 0
              ? (actualCount / item.target_target_count) * 100
              : 0,
          remainingDays: remainingDays,
          startDate: item.target_start_date,
          endDate: item.target_end_date,
        };
      }),
    );

    return progressList;
  }

  /**
   * 更新目标的实际完成情况（从订单表统计）
   */
  async updateActualFromOrders(targetId: number): Promise<void> {
    const target = await this.targetRepository.findOne({ where: { id: targetId } });

    if (!target) {
      throw new NotFoundException('销售目标不存在');
    }

    // 统计该时间段内该用户的订单数据
    const orderStats = await this.targetRepository.query(
      `
      SELECT
        COUNT(*) as orderCount,
        COALESCE(SUM(payment_amount), 0) as totalAmount
      FROM orders
      WHERE sales_id = ?
        AND payment_time BETWEEN ? AND ?
        AND order_status != '已退款'
    `,
      [target.userId, target.startDate, target.endDate],
    );

    if (orderStats && orderStats.length > 0) {
      target.actualCount = Number(orderStats[0].orderCount);
      target.actualAmount = Number(orderStats[0].totalAmount);

      // 更新状态
      const amountProgress = target.targetAmount > 0 ? (target.actualAmount / target.targetAmount) * 100 : 0;
      const countProgress = target.targetCount > 0 ? (target.actualCount / target.targetCount) * 100 : 0;

      // 如果两个指标都完成，标记为已完成
      if (amountProgress >= 100 && countProgress >= 100) {
        target.status = 2; // 已完成
      }

      await this.targetRepository.save(target);
    }
  }

  /**
   * 批量更新所有活跃目标的实际完成情况
   */
  async updateAllActualFromOrders(): Promise<void> {
    const activeTargets = await this.targetRepository.find({
      where: { status: 1 }, // 进行中
    });

    for (const target of activeTargets) {
      await this.updateActualFromOrders(target.id);
    }
  }
}
