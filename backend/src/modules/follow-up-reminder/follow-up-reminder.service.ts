import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpReminderConfig } from './entities/follow-up-config.entity';
import { FollowUpReminderTask } from './entities/follow-up-task.entity';
import { UpdateFollowUpConfigDto, FollowUpConfigResponse } from './dto/follow-up-config.dto';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class FollowUpReminderService {
  private readonly logger = new Logger(FollowUpReminderService.name);

  constructor(
    @InjectRepository(FollowUpReminderConfig)
    private readonly configRepository: Repository<FollowUpReminderConfig>,
    @InjectRepository(FollowUpReminderTask)
    private readonly taskRepository: Repository<FollowUpReminderTask>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * 获取跟进配置
   */
  async getConfig(): Promise<FollowUpConfigResponse> {
    const config = await this.configRepository.findOne({ where: {} });

    if (!config) {
      // 如果没有配置，返回默认配置
      return this.getDefaultConfig();
    }

    return {
      enabled: config.enabled,
      config: config.config as any,
    };
  }

  /**
   * 更新跟进配置
   */
  async updateConfig(dto: UpdateFollowUpConfigDto): Promise<FollowUpConfigResponse> {
    let config = await this.configRepository.findOne({ where: {} });

    if (!config) {
      config = this.configRepository.create();
    }

    if (dto.enabled !== undefined) {
      config.enabled = dto.enabled;
    }

    if (dto.config !== undefined) {
      config.config = dto.config as any;
    }

    const saved = await this.configRepository.save(config);

    this.logger.log(`跟进��置已更新: ${JSON.stringify(dto)}`);

    return {
      enabled: saved.enabled,
      config: saved.config as any,
    };
  }

  /**
   * 获取提醒任务列表
   */
  async getTasks(
    userId?: number,
    status?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 20,
  ) {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.customer', 'customer')
      .leftJoinAndSelect('task.user', 'user')
      .orderBy('task.remind_date', 'ASC')
      .addOrderBy('task.remind_time', 'ASC');

    if (userId) {
      queryBuilder.andWhere('task.user_id = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('task.remind_date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('task.remind_date <= :endDate', { endDate });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 创建提醒任务
   */
  async createTask(data: {
    customerId: number;
    userId: number;
    intentionLevel: string;
    roundNumber: number;
    remindDate: Date;
    remindTime?: string;
    remindMethod?: string;
    message?: string;
    isManual?: boolean;
  }): Promise<FollowUpReminderTask> {
    const task = this.taskRepository.create({
      customer_id: data.customerId,
      user_id: data.userId,
      intention_level: data.intentionLevel,
      round_number: data.roundNumber,
      remind_date: data.remindDate,
      remind_time: data.remindTime || '09:00:00',
      remind_method: data.remindMethod || 'system',
      message: data.message,
      is_manual: data.isManual || false,
      status: 'pending',
    });

    return await this.taskRepository.save(task);
  }

  /**
   * 批量创建提醒任务（定时任务调用）
   */
  async generateDailyTasks(): Promise<number> {
    const config = await this.getConfig();

    if (!config.enabled) {
      this.logger.log('跟进提醒功能未启用，跳过任务生成');
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let createdCount = 0;

    // 查询所有需要跟进的客户（使用customerIntent字段）
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.sales', 'sales')
      .where('customer.customerIntent IN (:...levels)', {
        levels: Object.keys(config.config),
      })
      .andWhere('customer.salesId IS NOT NULL')
      .getMany();

    for (const customer of customers) {
      try {
        const tasks = await this.generateCustomerTasks(customer, config);
        createdCount += tasks.length;
      } catch (error) {
        this.logger.error(`生成客户 ${customer.id} 的提醒任务失败: ${error.message}`);
      }
    }

    this.logger.log(`成功生成 ${createdCount} 条提醒任务`);

    return createdCount;
  }

  /**
   * 为单个客户生成提醒任务
   */
  async generateCustomerTasks(customer: Customer, config: FollowUpConfigResponse): Promise<FollowUpReminderTask[]> {
    const tasks: FollowUpReminderTask[] = [];
    const intentionLevel = customer.customerIntent || '待评估';
    const levelConfig = config.config[intentionLevel];

    if (!levelConfig) {
      return tasks;
    }

    // 检查是否有手动设置的下次回访时间（使用nextFollowTime字段）
    if (customer.nextFollowTime) {
      const nextFollowUpDate = new Date(customer.nextFollowTime);

      // 检查是否已存在该日期的提醒任务
      const existingTask = await this.taskRepository.findOne({
        where: {
          customer_id: customer.id,
          remind_date: nextFollowUpDate,
          is_manual: true,
        },
      });

      if (!existingTask) {
        const task = await this.createTask({
          customerId: customer.id,
          userId: customer.salesId,
          intentionLevel,
          roundNumber: 1,
          remindDate: nextFollowUpDate,
          message: '手动设置的回访时间（优先级最高）',
          isManual: true,
        });
        tasks.push(task);
      }
    } else {
      // 根据最后跟进时间和配置的间隔天数生成任务
      // 使用updateTime作为最后跟进时间的替代
      const lastFollowUp = customer.updateTime ? new Date(customer.updateTime) : new Date();

      // 获取该客户已生成的最大轮次
      const latestTask = await this.taskRepository.findOne({
        where: { customer_id: customer.id },
        order: { round_number: 'DESC' },
      });

      const nextRound = latestTask ? latestTask.round_number + 1 : 1;

      if (nextRound <= levelConfig.rounds.length) {
        const roundConfig = levelConfig.rounds[nextRound - 1];
        const remindDate = new Date(lastFollowUp);
        remindDate.setDate(remindDate.getDate() + roundConfig.intervalDays);

        // 只生成未来的任务
        if (remindDate >= new Date()) {
          const task = await this.createTask({
            customerId: customer.id,
            userId: customer.salesId,
            intentionLevel,
            roundNumber: nextRound,
            remindDate,
            message: roundConfig.message || '',
            isManual: false,
          });
          tasks.push(task);
        }
      }
    }

    return tasks;
  }

  /**
   * 标记任务为已发送
   */
  async markAsSent(taskId: number): Promise<void> {
    await this.taskRepository.update(taskId, {
      status: 'sent',
      sent_at: new Date(),
    });
  }

  /**
   * 标记任务为已完成
   */
  async markAsCompleted(taskId: number): Promise<void> {
    await this.taskRepository.update(taskId, {
      status: 'completed',
      completed_at: new Date(),
    });
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: number): Promise<void> {
    await this.taskRepository.update(taskId, {
      status: 'cancelled',
    });
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): FollowUpConfigResponse {
    return {
      enabled: true,
      config: {
        极高意向: {
          rounds: [
            { intervalDays: 1, message: '第1轮跟进：极高意向客户，建议优先联系' },
            { intervalDays: 2, message: '第2轮跟进：持续关注' },
            { intervalDays: 3, message: '第3轮跟进：保持联系' },
            { intervalDays: 5, message: '第4轮跟进：再次跟进' },
            { intervalDays: 7, message: '第5轮跟进：最后提醒' },
          ],
          reminderMethods: ['system', 'homepage'],
        },
        高意向: {
          rounds: [
            { intervalDays: 2, message: '第1轮跟进：高意向客户' },
            { intervalDays: 3, message: '第2轮跟进' },
            { intervalDays: 5, message: '第3轮跟进' },
            { intervalDays: 7, message: '第4轮跟进' },
            { intervalDays: 10, message: '第5轮跟进' },
          ],
          reminderMethods: ['system', 'homepage'],
        },
        中意向: {
          rounds: [
            { intervalDays: 3, message: '第1轮跟进：中意向客户' },
            { intervalDays: 5, message: '第2轮跟进' },
            { intervalDays: 7, message: '第3轮跟进' },
            { intervalDays: 10, message: '第4轮跟进' },
            { intervalDays: 15, message: '第5轮跟进' },
          ],
          reminderMethods: ['system', 'homepage'],
        },
        低意向: {
          rounds: [
            { intervalDays: 5, message: '第1轮跟进：低意向客户' },
            { intervalDays: 7, message: '第2轮跟进' },
            { intervalDays: 10, message: '第3轮跟进' },
            { intervalDays: 15, message: '第4轮跟进' },
            { intervalDays: 20, message: '第5轮跟进' },
          ],
          reminderMethods: ['system', 'homepage'],
        },
        无意向: {
          rounds: [
            { intervalDays: 7, message: '第1轮跟进：无意向客户' },
            { intervalDays: 10, message: '第2轮跟进' },
            { intervalDays: 15, message: '第3轮跟进' },
            { intervalDays: 20, message: '第4轮跟进' },
            { intervalDays: 30, message: '第5轮跟进' },
          ],
          reminderMethods: ['system'],
        },
        待评估: {
          rounds: [
            { intervalDays: 1, message: '第1轮跟进：待评估客户，优先确认意向' },
            { intervalDays: 3, message: '第2轮跟进' },
            { intervalDays: 5, message: '第3轮跟进' },
            { intervalDays: 7, message: '第4轮跟进' },
            { intervalDays: 10, message: '第5轮跟进' },
          ],
          reminderMethods: ['system', 'homepage'],
        },
        成交: {
          rounds: [
            { intervalDays: 15, message: '第1轮跟进：成交后回访' },
            { intervalDays: 30, message: '第2轮跟进：1个月关怀' },
            { intervalDays: 60, message: '第3轮跟进：2个月关怀' },
            { intervalDays: 90, message: '第4轮跟进：3个月关怀' },
            { intervalDays: 180, message: '第5轮跟进：半年关怀' },
          ],
          reminderMethods: ['system', 'homepage'],
        },
      },
    };
  }
}
