import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { FollowUpReminderService } from './follow-up-reminder.service';
import { FollowUpReminderTask } from './entities/follow-up-task.entity';
import { Notification } from '../notification/entities/notification.entity';

@Injectable()
export class FollowUpReminderScheduler {
  private readonly logger = new Logger(FollowUpReminderScheduler.name);

  constructor(
    private readonly followUpReminderService: FollowUpReminderService,
    @InjectRepository(FollowUpReminderTask)
    private readonly taskRepository: Repository<FollowUpReminderTask>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * 每天凌晨2点生成当日提醒任务
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyTaskGeneration() {
    this.logger.log('开始生成每日跟进提醒任务...');

    try {
      const count = await this.followUpReminderService.generateDailyTasks();

      this.logger.log(`每日跟进提醒任务生成完成，共生成 ${count} 条任务`);
    } catch (error) {
      this.logger.error('生成每日跟进提醒任务失败', error.stack);
    }
  }

  /**
   * 每天早上9点检查并发送当天到期的提醒
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyReminderSending() {
    this.logger.log('开始发送每日跟进提醒...');

    try {
      // 1. 查询当天到期的pending状态任务
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.customer', 'customer')
        .where('task.status = :status', { status: 'pending' })
        .andWhere('task.remind_date >= :startDate', { startDate: today })
        .andWhere('task.remind_date <= :endDate', { endDate: todayEnd })
        .getMany();

      this.logger.log(`找到 ${tasks.length} 条待发送的提醒任务`);

      let sentCount = 0;

      // 2. 根据remind_method发送提醒
      for (const task of tasks) {
        try {
          // 检查是否需要发送站内提醒
          if (task.remind_method === 'system' || task.remind_method === 'homepage') {
            // 创建站内通知
            const notification = this.notificationRepository.create({
              userId: task.user_id,
              type: 'follow_reminder',
              title: `客户跟进提醒 - ${task.intention_level}`,
              content: task.message || `第${task.round_number}轮跟进提醒：请及时跟进客户`,
              relatedId: task.customer_id,
              isRead: 0,
            });

            await this.notificationRepository.save(notification);

            // 3. 标记任务为sent状态
            await this.followUpReminderService.markAsSent(task.id);

            sentCount++;

            this.logger.log(
              `已发送提醒: 用户${task.user_id}, 客户${task.customer_id}, 轮次${task.round_number}`
            );
          } else {
            // 如果不是站内提醒，也标记为已发送（后续可扩展短信/邮件）
            await this.followUpReminderService.markAsSent(task.id);
            sentCount++;
          }
        } catch (error) {
          this.logger.error(`发送提醒失败: 任务ID=${task.id}, 错误=${error.message}`);
        }
      }

      this.logger.log(`每日跟进提醒发送完成，成功发送 ${sentCount}/${tasks.length} 条`);
    } catch (error) {
      this.logger.error('发送每日跟进提醒失败', error.stack);
    }
  }
}
