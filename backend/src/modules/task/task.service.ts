import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { CustomerFollowRecord } from '../customer/entities/customer-follow-record.entity';
import { SalesTarget } from '../target/entities/sales-target.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFollowRecord)
    private followRecordRepository: Repository<CustomerFollowRecord>,
    @InjectRepository(SalesTarget)
    private targetRepository: Repository<SalesTarget>,
    private notificationService: NotificationService,
  ) {}

  /**
   * 每天早上9点检查需要跟进的客户
   * 如果客户超过3天没有跟进记录，提醒负责销售
   */
  @Cron('0 9 * * *', {
    name: 'check-follow-up',
    timeZone: 'Asia/Shanghai',
  })
  async checkFollowUpReminders() {
    this.logger.log('开始检查客户跟进提醒...');

    try {
      // 查询所有有销售负责人的客户
      const customers = await this.customerRepository.find({
        where: {
          salesId: Not(IsNull()),
        },
      });

      const notifications = [];
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      for (const customer of customers) {
        // 查询最后一次跟进记录
        const lastFollow = await this.followRecordRepository.findOne({
          where: { customerId: customer.id },
          order: { createTime: 'DESC' },
        });

        // 如果没有跟进记录，或最后跟进时间超过3天
        if (!lastFollow || new Date(lastFollow.createTime) < threeDaysAgo) {
          const daysSinceFollow = lastFollow
            ? Math.floor(
                (Date.now() - new Date(lastFollow.createTime).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 999;

          notifications.push({
            userId: customer.salesId,
            type: 'follow_up_reminder',
            title: '客户跟进提醒',
            content: `客户"${customer.realName || customer.wechatNickname}"已经${daysSinceFollow}天没有跟进记录，请及时跟进`,
            relatedId: customer.id,
          });
        }
      }

      // 批量创建通知
      if (notifications.length > 0) {
        await this.notificationService.createBatch(notifications);
        this.logger.log(`创建了${notifications.length}条客户跟进提醒`);
      } else {
        this.logger.log('没有需要提醒的客户');
      }
    } catch (error) {
      this.logger.error('检查客户跟进提醒失败', error);
    }
  }

  /**
   * 每周一早上10点检查销售目标进度
   * 如果完成度低于50%且剩余时间少于30%，发送预警
   */
  @Cron('0 10 * * 1', {
    name: 'check-target-progress',
    timeZone: 'Asia/Shanghai',
  })
  async checkTargetProgressReminders() {
    this.logger.log('开始检查销售目标进度...');

    try {
      // 查询所有进行中的目标
      const targets = await this.targetRepository.find({
        where: { status: 1 },
      });

      const notifications = [];
      const now = new Date();

      for (const target of targets) {
        const startTime = new Date(target.startDate).getTime();
        const endTime = new Date(target.endDate).getTime();
        const currentTime = now.getTime();

        // 计算时间进度
        const totalDuration = endTime - startTime;
        const elapsedDuration = currentTime - startTime;
        const timeProgress = (elapsedDuration / totalDuration) * 100;

        // 计算金额完成进度
        const amountProgress =
          target.targetAmount > 0
            ? (target.actualAmount / target.targetAmount) * 100
            : 0;

        // 计算订单数完成进度
        const countProgress =
          target.targetCount > 0 ? (target.actualCount / target.targetCount) * 100 : 0;

        // 如果时间过去超过70%，但完成度低于50%，发送预警
        if (timeProgress > 70 && (amountProgress < 50 || countProgress < 50)) {
          const remainingDays = Math.ceil((endTime - currentTime) / (1000 * 60 * 60 * 24));

          notifications.push({
            userId: target.userId,
            type: 'target_warning',
            title: '销售目标预警',
            content: `您的${this.getTargetTypeName(target.targetType)}进度落后，仅剩${remainingDays}天。金额完成${amountProgress.toFixed(1)}%，订单完成${countProgress.toFixed(1)}%，请加油！`,
            relatedId: target.id,
          });
        }
        // 如果即将到期（剩余3天内），发送提醒
        else if (timeProgress > 90) {
          const remainingDays = Math.ceil((endTime - currentTime) / (1000 * 60 * 60 * 24));

          notifications.push({
            userId: target.userId,
            type: 'target_expiring',
            title: '销售目标即将到期',
            content: `您的${this.getTargetTypeName(target.targetType)}还有${remainingDays}天到期。当前金额完成${amountProgress.toFixed(1)}%，订单完成${countProgress.toFixed(1)}%`,
            relatedId: target.id,
          });
        }
      }

      // 批量创建通知
      if (notifications.length > 0) {
        await this.notificationService.createBatch(notifications);
        this.logger.log(`创建了${notifications.length}条销售目标提醒`);
      } else {
        this.logger.log('没有需要提醒的目标');
      }
    } catch (error) {
      this.logger.error('检查销售目标进度失败', error);
    }
  }

  /**
   * 每天凌晨2点检查高价值客户流失风险
   * 如果成交客户或复购客户超过30天没有新订单，发送提醒
   */
  @Cron('0 2 * * *', {
    name: 'check-churn-risk',
    timeZone: 'Asia/Shanghai',
  })
  async checkChurnRiskReminders() {
    this.logger.log('开始检查客户流失风险...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 查询成交客户和复购客户，且最近30天没有新订单
      const query = `
        SELECT
          c.id,
          c.real_name,
          c.wechat_nickname,
          c.sales_id,
          MAX(o.order_date) as last_order_date,
          DATEDIFF(NOW(), MAX(o.order_date)) as days_since_order
        FROM customers c
        INNER JOIN \`order\` o ON c.id = o.customer_id
        WHERE c.lifecycle_stage IN ('成交客户', '复购客户')
          AND c.sales_id IS NOT NULL
        GROUP BY c.id
        HAVING MAX(o.order_date) < ?
      `;

      const riskCustomers = await this.customerRepository.query(query, [thirtyDaysAgo]);

      const notifications = riskCustomers.map((customer: any) => ({
        userId: customer.sales_id,
        type: 'churn_risk',
        title: '客户流失风险提醒',
        content: `客户"${customer.real_name || customer.wechat_nickname}"已经${customer.days_since_order}天没有新订单，存在流失风险，请及时回访维护`,
        relatedId: customer.id,
      }));

      // 批量创建通知
      if (notifications.length > 0) {
        await this.notificationService.createBatch(notifications);
        this.logger.log(`创建了${notifications.length}条客户流失风险提醒`);
      } else {
        this.logger.log('没有流失风险客户');
      }
    } catch (error) {
      this.logger.error('检查客户流失风险失败', error);
    }
  }

  /**
   * 辅助方法：获取目标类型中文名称
   */
  private getTargetTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      monthly: '月度目标',
      quarterly: '季度目标',
      yearly: '年度目标',
    };
    return typeMap[type] || type;
  }

  /**
   * 手动触发检查（用于测试）
   */
  async manualCheckAll() {
    this.logger.log('手动触发所有检查任务...');
    await Promise.all([
      this.checkFollowUpReminders(),
      this.checkTargetProgressReminders(),
      this.checkChurnRiskReminders(),
    ]);
    this.logger.log('所有检查任务完成');
  }
}
