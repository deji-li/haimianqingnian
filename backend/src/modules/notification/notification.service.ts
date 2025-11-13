import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './entities/notification.entity';
import { Customer } from '../customer/entities/customer.entity';

export interface CreateNotificationDto {
  userId: number;
  type: string;
  title: string;
  content: string;
  relatedId?: number;
}

export interface QueryNotificationDto {
  page?: number;
  pageSize?: number;
  userId?: number;
  type?: string;
  isRead?: number;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * 创建通知
   */
  async create(data: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return await this.notificationRepository.save(notification);
  }

  /**
   * 批量创建通知
   */
  async createBatch(notifications: CreateNotificationDto[]): Promise<void> {
    const entities = this.notificationRepository.create(notifications);
    await this.notificationRepository.save(entities);
  }

  /**
   * 获取用户通知列表
   */
  async findByUser(query: QueryNotificationDto) {
    const { page = 1, pageSize = 20, userId, type, isRead } = query;

    const qb = this.notificationRepository.createQueryBuilder('notification');

    // 必须指定用户ID
    if (userId) {
      qb.where('notification.user_id = :userId', { userId });
    }

    // 按类型筛选
    if (type) {
      qb.andWhere('notification.type = :type', { type });
    }

    // 按已读/未读筛选
    if (isRead !== undefined) {
      qb.andWhere('notification.is_read = :isRead', { isRead });
    }

    // 按创建时间倒序
    qb.orderBy('notification.create_time', 'DESC');

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
   * 获取未读通知数量
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        userId,
        isRead: 0,
      },
    });
  }

  /**
   * 标记为已读
   */
  async markAsRead(id: number): Promise<void> {
    await this.notificationRepository.update(id, {
      isRead: 1,
      readTime: new Date(),
    });
  }

  /**
   * 批量标记为已读
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      {
        userId,
        isRead: 0,
      },
      {
        isRead: 1,
        readTime: new Date(),
      }
    );
  }

  /**
   * 删除通知
   */
  async remove(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  /**
   * 批量删除已读通知
   */
  async removeRead(userId: number): Promise<number> {
    const result = await this.notificationRepository.delete({
      userId,
      isRead: 1,
    });

    return result.affected || 0;
  }

  /**
   * 定时任务：每天早上9点检查待回访客户
   */
  @Cron('0 0 9 * * *', {
    name: 'check-follow-up-reminder',
    timeZone: 'Asia/Shanghai',
  })
  async checkFollowUpReminder() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 查询今天需要回访的客户
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.next_follow_time >= :today', { today })
      .andWhere('customer.next_follow_time < :tomorrow', { tomorrow })
      .andWhere('customer.sales_id IS NOT NULL')
      .getMany();

    // 为每个客户的负责销售创建通知
    const notifications: CreateNotificationDto[] = customers.map(customer => ({
      userId: customer.salesId,
      type: 'follow_reminder',
      title: '客户回访提醒',
      content: `客户【${customer.wechatNickname}】今天需要回访，请及时跟进！`,
      relatedId: customer.id,
    }));

    if (notifications.length > 0) {
      await this.createBatch(notifications);
    }
  }

  /**
   * 创建订单更新通知
   */
  async createOrderUpdateNotification(
    userId: number,
    orderNo: string,
    status: string
  ): Promise<void> {
    const statusText = {
      pending: '待支付',
      paid: '已支付',
      completed: '已完成',
      refunded: '已退款',
    }[status] || status;

    await this.create({
      userId,
      type: 'order_update',
      title: '订单状态更新',
      content: `订单【${orderNo}】状态已更新为：${statusText}`,
    });
  }

  /**
   * 创建提成发放通知
   */
  async createCommissionPaidNotification(
    userId: number,
    amount: number,
    month: string
  ): Promise<void> {
    await this.create({
      userId,
      type: 'commission_paid',
      title: '提成已发放',
      content: `您的${month}提成￥${amount.toFixed(2)}已发放，请注意查收！`,
    });
  }

  /**
   * 创建系统通知
   */
  async createSystemNotification(
    userIds: number[],
    title: string,
    content: string
  ): Promise<void> {
    const notifications: CreateNotificationDto[] = userIds.map(userId => ({
      userId,
      type: 'system',
      title,
      content,
    }));

    await this.createBatch(notifications);
  }
}
