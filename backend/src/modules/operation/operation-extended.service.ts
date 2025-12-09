import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, SelectQueryBuilder } from 'typeorm';
import { OperationCustomerConversion } from './entities/operation-customer-conversion.entity';
import { OperationNotification } from './entities/operation-notification.entity';
import { OperationDailyRecord } from './entities/operation-daily-record.entity';
import { OperationAccount } from './entities/operation-account.entity';
import { OperationCommissionRecord } from './entities/operation-commission-record.entity';

@Injectable()
export class OperationExtendedService {
  constructor(
    @InjectRepository(OperationCustomerConversion)
    private readonly conversionRepository: Repository<OperationCustomerConversion>,
    @InjectRepository(OperationNotification)
    private readonly notificationRepository: Repository<OperationNotification>,
    @InjectRepository(OperationDailyRecord)
    private readonly dailyRecordRepository: Repository<OperationDailyRecord>,
    @InjectRepository(OperationAccount)
    private readonly accountRepository: Repository<OperationAccount>,
    @InjectRepository(OperationCommissionRecord)
    private readonly commissionRepository: Repository<OperationCommissionRecord>,
  ) {}

  // ==================== 客户转化相关 ====================

  /**
   * 获取运营引流客户列表
   */
  async getOperationCustomers(params: {
    page: number;
    pageSize: number;
    operatorId?: number;
    status?: string;
    conversionStage?: string;
    platform?: string;
    city?: string;
  }) {
    const { page = 1, pageSize = 20, operatorId, status, conversionStage, platform, city } = params;

    const queryBuilder: SelectQueryBuilder<any> = this.conversionRepository
      .createQueryBuilder('conversion')
      .leftJoin('conversion.customerId', 'customer')
      .leftJoin('conversion.operatorId', 'operator')
      .leftJoin('customer.orders', 'orders')
      .select([
        'conversion.id',
        'conversion.conversionStage',
        'conversion.conversionTime',
        'conversion.createdAt',
        'customer.id',
        'customer.name',
        'customer.phone',
        'customer.status',
        'customer.createdAt',
        'operator.id',
        'operator.name',
        'conversion.trafficPlatform',
        'conversion.trafficCity',
        'COUNT(orders.id) as orderCount',
        'SUM(orders.amount) as totalAmount'
      ])
      .groupBy('conversion.id')
      .addGroupBy('customer.id')
      .addGroupBy('operator.id');

    // 筛选条件
    if (operatorId) {
      queryBuilder.andWhere('conversion.operatorId = :operatorId', { operatorId });
    }
    if (conversionStage) {
      queryBuilder.andWhere('conversion.conversionStage = :conversionStage', { conversionStage });
    }
    if (platform) {
      queryBuilder.andWhere('conversion.trafficPlatform = :platform', { platform });
    }
    if (city) {
      queryBuilder.andWhere('conversion.trafficCity = :city', { city });
    }

    const [list, total] = await queryBuilder
      .orderBy('conversion.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany();

    // 处理数据格式
    const result = list.map(item => ({
      id: item.conversion_id,
      name: item.customer_name,
      phone: item.customer_phone,
      operatorId: item.conversion_operatorId,
      operatorName: item.operator_name,
      trafficPlatform: item.conversion_trafficPlatform,
      trafficCity: item.conversion_trafficCity,
      status: item.customer_status,
      conversionStage: item.conversion_conversionStage,
      orderCount: parseInt(item.orderCount) || 0,
      totalAmount: parseFloat(item.totalAmount) || 0,
      createdAt: item.conversion_createdAt,
      lastOrderDate: null, // 需要额外查询
      conversionRate: 0, // 需要计算
    }));

    return { list: result, total };
  }

  /**
   * 获取转化漏斗数据
   */
  async getConversionFunnel(params: {
    operatorId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { operatorId, startDate, endDate } = params;

    const queryBuilder = this.conversionRepository
      .createQueryBuilder('conversion')
      .select([
        'conversion.conversionStage as stage',
        'COUNT(DISTINCT conversion.customerId) as count'
      ])
      .groupBy('conversion.conversionStage');

    if (operatorId) {
      queryBuilder.andWhere('conversion.operatorId = :operatorId', { operatorId });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('conversion.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    }

    const results = await queryBuilder.getRawMany();

    // 定义转化阶段顺序
    const stageOrder = ['引流', '初步接触', '深度咨询', '试听体验', '成交转化'];

    // 构建漏斗数据
    const funnelData = stageOrder.map(stage => {
      const found = results.find(r => r.stage === stage);
      return {
        name: stage,
        value: found ? parseInt(found.count) : 0
      };
    });

    return { stages: funnelData };
  }

  // ==================== 业绩指标相关 ====================

  /**
   * 获取运营业绩指标
   */
  async getPerformanceMetrics(params: {
    operatorId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { operatorId, startDate, endDate } = params;
    const dateFilter = startDate && endDate ?
      Between(new Date(startDate), new Date(endDate)) : null;

    // 获取日报统计数据
    const dailyStatsQuery = this.dailyRecordRepository
      .createQueryBuilder('daily')
      .select([
        'SUM(daily.view_max) as totalViews',
        'SUM(daily.play_max) as totalPlays',
        'COUNT(DISTINCT daily.accountId) as activeAccounts',
        'AVG(daily.view_max) as avgViews'
      ]);

    if (operatorId) {
      dailyStatsQuery.andWhere('daily.operatorId = :operatorId', { operatorId });
    }
    if (dateFilter) {
      dailyStatsQuery.andWhere('daily.reportDate >= :startDate AND daily.reportDate <= :endDate', {
        startDate,
        endDate
      });
    }

    const dailyStats = await dailyStatsQuery.getRawOne();

    // 获取客户转化统计
    const conversionStats = await this.getOperationCustomers({
      page: 1,
      pageSize: 999999,
      operatorId
    });

    const totalCustomers = conversionStats.list.length;
    const convertedCustomers = conversionStats.list.filter(c => c.orderCount > 0).length;
    const conversionRate = totalCustomers > 0 ? (convertedCustomers / totalCustomers * 100) : 0;

    // 获取提成统计
    const commissionStatsQuery = this.commissionRepository
      .createQueryBuilder('commission')
      .select([
        'COUNT(DISTINCT commission.id) as totalCommissions',
        'SUM(commission.commissionAmount) as totalAmount',
        'COUNT(CASE WHEN commission.status = "已发放" THEN 1 END) as paidCommissions'
      ]);

    if (operatorId) {
      commissionStatsQuery.andWhere('commission.operatorId = :operatorId', { operatorId });
    }
    if (dateFilter) {
      commissionStatsQuery.andWhere('commission.createdAt >= :startDate AND commission.createdAt <= :endDate', {
        startDate,
        endDate
      });
    }

    const commissionStats = await commissionStatsQuery.getRawOne();

    // 计算增长率（需要对比上一周期数据）
    const growth = await this.calculateGrowth(operatorId, startDate, endDate);

    return {
      totalViews: parseInt(dailyStats.totalViews) || 0,
      totalPlays: parseInt(dailyStats.totalPlays) || 0,
      totalCustomers,
      totalCommission: parseFloat(commissionStats.totalAmount) || 0,
      viewsGrowth: growth.viewsGrowth,
      playsGrowth: growth.playsGrowth,
      customersGrowth: growth.customersGrowth,
      commissionGrowth: growth.commissionGrowth,
      avgViews: parseFloat(dailyStats.avgViews) || 0,
      activeAccounts: parseInt(dailyStats.activeAccounts) || 0,
      conversionRate: parseFloat(conversionRate.toFixed(2))
    };
  }

  /**
   * 获取平台效果对比
   */
  async getPlatformComparison(params: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = params;
    const dateFilter = startDate && endDate ?
      Between(new Date(startDate), new Date(endDate)) : null;

    // 按平台统计账号数据
    const accountStats = await this.accountRepository
      .createQueryBuilder('account')
      .select([
        'account.platform_type as platformType',
        'COUNT(DISTINCT account.id) as accountCount',
        'SUM(account.fans_count) as totalFans',
        'AVG(account.engagement_rate) as avgEngagementRate'
      ])
      .groupBy('account.platformType')
      .getRawMany();

    // 按平台统计日报数据
    const dailyStats = await this.dailyRecordRepository
      .createQueryBuilder('daily')
      .leftJoin('daily.accountId', 'account')
      .select([
        'account.platform_type as platformType',
        'SUM(daily.view_max) as totalViews',
        'SUM(daily.play_max) as totalPlays',
        'AVG(daily.view_max) as avgViews'
      ])
      .groupBy('account.platformType');

    if (dateFilter) {
      dailyStats.andWhere('daily.reportDate >= :startDate AND daily.reportDate <= :endDate', {
        startDate,
        endDate
      });
    }

    const dailyData = await dailyStats.getRawMany();

    // 合并数据
    const platforms = ['小红书', '抖音', '视频号'];
    const result = platforms.map(platform => {
      const accStat = accountStats.find(s => s.platformType === platform) || {};
      const dayStat = dailyData.find(s => s.platformType === platform) || {};

      return {
        platform,
        accountCount: parseInt(accStat.accountCount) || 0,
        totalFans: parseInt(accStat.totalFans) || 0,
        avgEngagementRate: parseFloat(accStat.avgEngagementRate) || 0,
        totalViews: parseInt(dayStat.totalViews) || 0,
        totalPlays: parseInt(dayStat.totalPlays) || 0,
        avgViews: parseFloat(dayStat.avgViews) || 0
      };
    });

    return result;
  }

  // ==================== 通知管理 ====================

  /**
   * 获取未读通知数量
   */
  async getUnreadNotificationCount(operatorId: number) {
    const count = await this.notificationRepository.count({
      where: {
        operatorId,
        isRead: false
      }
    });
    return { count };
  }

  /**
   * 获取通知列表
   */
  async getNotifications(params: {
    page: number;
    pageSize: number;
    operatorId: number;
    isRead?: boolean;
  }) {
    const { page = 1, pageSize = 20, operatorId, isRead } = params;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.operatorId = :operatorId', { operatorId })
      .orderBy('notification.createdAt', 'DESC');

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total };
  }

  /**
   * 标记通知为已读
   */
  async markNotificationAsRead(id: number, operatorId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id, operatorId }
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);
    return notification;
  }

  /**
   * 标记所有通知为已读
   */
  async markAllNotificationsAsRead(operatorId: number) {
    await this.notificationRepository.update(
      { operatorId, isRead: false },
      { isRead: true }
    );
    return { success: true };
  }

  /**
   * 创建通知
   */
  async createNotification(data: {
    operatorId: number;
    customerId?: number;
    orderId?: number;
    type: 'conversion' | 'reminder' | 'alert';
    title: string;
    content: string;
  }) {
    const notification = this.notificationRepository.create(data);
    return await this.notificationRepository.save(notification);
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 计算增长率
   */
  private async calculateGrowth(operatorId?: number, startDate?: string, endDate?: string) {
    // 这里简化处理，实际应该计算同比或环比增长率
    // 返回模拟数据
    return {
      viewsGrowth: 15.5,
      playsGrowth: 12.3,
      customersGrowth: 8.7,
      commissionGrowth: 22.1
    };
  }
}