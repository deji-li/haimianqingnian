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

    // 由于缺少必要的关联表，暂时返回空结果
    const mockData = [];
    const total = 0;

    return { list: mockData, total };
  }

  /**
   * 获取转化漏斗数据
   */
  async getConversionFunnel(params: {
    operatorId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    // 暂时返回模拟数据
    const stageOrder = ['引流', '初步接触', '深度咨询', '试听体验', '成交转化'];

    // 构建漏斗数据
    const funnelData = stageOrder.map((stage, index) => ({
      name: stage,
      value: Math.max(100 - index * 15, 10) // 模拟递减的漏斗数据
    }));

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
    // 暂时返回模拟数据
    return {
      totalViews: 12500,
      totalPlays: 8300,
      totalCustomers: 156,
      totalCommission: 15680.50,
      viewsGrowth: 15.5,
      playsGrowth: 12.3,
      customersGrowth: 8.7,
      commissionGrowth: 22.1,
      avgViews: 856.2,
      activeAccounts: 12,
      conversionRate: 65.8
    };
  }

  /**
   * 获取平台效果对比
   */
  async getPlatformComparison(params: {
    startDate?: string;
    endDate?: string;
  }) {
    // 暂时返回模拟数据
    const platforms = ['小红书', '抖音', '视频号'];
    const mockData = [
      {
        platform: '小红书',
        accountCount: 5,
        totalFans: 125000,
        avgEngagementRate: 3.2,
        totalViews: 8500,
        totalPlays: 3200,
        avgViews: 1700
      },
      {
        platform: '抖音',
        accountCount: 4,
        totalFans: 98000,
        avgEngagementRate: 4.1,
        totalViews: 12400,
        totalPlays: 5100,
        avgViews: 3100
      },
      {
        platform: '视频号',
        accountCount: 3,
        totalFans: 67000,
        avgEngagementRate: 2.8,
        totalViews: 6200,
        totalPlays: 2100,
        avgViews: 2067
      }
    ];

    return mockData;
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