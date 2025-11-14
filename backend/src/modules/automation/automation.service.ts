import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  AutomationRule,
  RuleType,
  TriggerType,
  RuleStatus,
} from './entities/automation-rule.entity';
import { AutomationLog, ExecutionStatus } from './entities/automation-log.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CreateAutomationRuleDto } from './dto/create-rule.dto';
import { UpdateAutomationRuleDto } from './dto/update-rule.dto';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectRepository(AutomationRule)
    private ruleRepository: Repository<AutomationRule>,
    @InjectRepository(AutomationLog)
    private logRepository: Repository<AutomationLog>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  // ==================== 规则管理 ====================

  /**
   * 创建自动化规则
   */
  async createRule(dto: CreateAutomationRuleDto, userId: number) {
    const rule = this.ruleRepository.create({
      ...dto,
      createdBy: userId,
    });
    return await this.ruleRepository.save(rule);
  }

  /**
   * 获取规则列表
   */
  async getRules(ruleType?: RuleType) {
    const query = this.ruleRepository.createQueryBuilder('rule');

    if (ruleType) {
      query.where('rule.ruleType = :ruleType', { ruleType });
    }

    query.orderBy('rule.priority', 'DESC');
    query.addOrderBy('rule.create_time', 'DESC');

    return await query.getMany();
  }

  /**
   * 获取规则详情
   */
  async getRule(id: number) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('规则不存在');
    }
    return rule;
  }

  /**
   * 更新规则
   */
  async updateRule(id: number, dto: UpdateAutomationRuleDto) {
    const rule = await this.getRule(id);
    Object.assign(rule, dto);
    return await this.ruleRepository.save(rule);
  }

  /**
   * 删除规则
   */
  async deleteRule(id: number) {
    const rule = await this.getRule(id);
    await this.ruleRepository.remove(rule);
    return { message: '删除成功' };
  }

  /**
   * 启用/禁用规则
   */
  async toggleRuleStatus(id: number) {
    const rule = await this.getRule(id);
    rule.status =
      rule.status === RuleStatus.ENABLED
        ? RuleStatus.DISABLED
        : RuleStatus.ENABLED;
    await this.ruleRepository.save(rule);
    return { message: `规则已${rule.status === RuleStatus.ENABLED ? '启用' : '禁用'}` };
  }

  // ==================== 定时任务 ====================

  /**
   * 每小时执行一次：检查需要提醒的客户
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleFollowReminders() {
    this.logger.log('开始执行自动提醒任务...');

    const rules = await this.ruleRepository.find({
      where: {
        ruleType: RuleType.AUTO_REMIND,
        triggerType: TriggerType.FOLLOW_TIME,
        status: RuleStatus.ENABLED,
      },
    });

    for (const rule of rules) {
      await this.executeReminderRule(rule);
    }

    this.logger.log('自动提醒任务执行完成');
  }

  /**
   * 每天凌晨1点执行：检查长时间未跟进的客户
   */
  @Cron('0 1 * * *')
  async handleNoFollowReminders() {
    this.logger.log('开始执行未跟进提醒任务...');

    const rules = await this.ruleRepository.find({
      where: {
        ruleType: RuleType.AUTO_REMIND,
        triggerType: TriggerType.NO_FOLLOW,
        status: RuleStatus.ENABLED,
      },
    });

    for (const rule of rules) {
      await this.executeNoFollowRule(rule);
    }

    this.logger.log('未跟进提醒任务执行完成');
  }

  // ==================== 规则执行逻辑 ====================

  /**
   * 执行提醒规则
   */
  private async executeReminderRule(rule: AutomationRule) {
    const startTime = Date.now();

    try {
      // 查找需要提醒的客户（下次回访时间在未来1小时内）
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const customers = await this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.next_follow_time IS NOT NULL')
        .andWhere('customer.next_follow_time > :now', { now })
        .andWhere('customer.next_follow_time <= :oneHourLater', { oneHourLater })
        .getMany();

      this.logger.log(`找到 ${customers.length} 个需要提醒的客户`);

      for (const customer of customers) {
        // 创建提醒（这里可以集成消息推送服务）
        await this.logRepository.save({
          ruleId: rule.id,
          targetType: 'customer',
          targetId: customer.id,
          status: ExecutionStatus.SUCCESS,
          result: {
            customerName: customer.wechatNickname,
            followTime: customer.nextFollowTime,
            message: '已创建回访提醒',
          },
          executionTime: Date.now() - startTime,
        });
      }

      // 更新规则执行统计
      rule.executionCount += customers.length;
      rule.lastExecutionTime = new Date();
      await this.ruleRepository.save(rule);

      return customers.length;
    } catch (error) {
      this.logger.error(`规则执行失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 执行未跟进提醒规则
   */
  private async executeNoFollowRule(rule: AutomationRule) {
    const startTime = Date.now();

    try {
      const days = rule.triggerConditions?.days || 7; // 默认7天未跟进
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);

      // 查找长时间未跟进的客户
      const customers = await this.customerRepository
        .createQueryBuilder('customer')
        .leftJoin(
          'customer_follow_records',
          'follow',
          'customer.id = follow.customer_id',
        )
        .where('customer.update_time < :daysAgo', { daysAgo })
        .andWhere(
          '(follow.id IS NULL OR follow.create_time < :daysAgo)',
          { daysAgo },
        )
        .getMany();

      this.logger.log(`找到 ${customers.length} 个长时间未跟进的客户`);

      for (const customer of customers) {
        await this.logRepository.save({
          ruleId: rule.id,
          targetType: 'customer',
          targetId: customer.id,
          status: ExecutionStatus.SUCCESS,
          result: {
            customerName: customer.wechatNickname,
            lastUpdateTime: customer.updateTime,
            message: `已超过${days}天未跟进`,
          },
          executionTime: Date.now() - startTime,
        });
      }

      rule.executionCount += customers.length;
      rule.lastExecutionTime = new Date();
      await this.ruleRepository.save(rule);

      return customers.length;
    } catch (error) {
      this.logger.error(`规则执行失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 新客户自动分配
   */
  async autoAssignCustomer(customerId: number) {
    const rules = await this.ruleRepository.find({
      where: {
        ruleType: RuleType.AUTO_ASSIGN,
        triggerType: TriggerType.NEW_CUSTOMER,
        status: RuleStatus.ENABLED,
      },
      order: {
        priority: 'DESC',
      },
    });

    if (rules.length === 0) {
      return null;
    }

    // 使用第一条匹配的规则
    const rule = rules[0];
    const startTime = Date.now();

    try {
      const customer = await this.customerRepository.findOne({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundException('客户不存在');
      }

      // 执行分配逻辑
      const assignStrategy = rule.actions.strategy || 'round_robin'; // 轮询分配
      const targetSalesIds = rule.actions.salesIds || [];

      if (targetSalesIds.length === 0) {
        throw new Error('未配置销售人员');
      }

      // 简单轮询：基于客户ID取模
      const assignedSalesId =
        targetSalesIds[customerId % targetSalesIds.length];

      customer.salesId = assignedSalesId;
      await this.customerRepository.save(customer);

      // 记录执行日志
      await this.logRepository.save({
        ruleId: rule.id,
        targetType: 'customer',
        targetId: customerId,
        status: ExecutionStatus.SUCCESS,
        result: {
          assignedSalesId,
          strategy: assignStrategy,
        },
        executionTime: Date.now() - startTime,
      });

      rule.executionCount += 1;
      rule.lastExecutionTime = new Date();
      await this.ruleRepository.save(rule);

      return assignedSalesId;
    } catch (error) {
      this.logger.error(`自动分配失败: ${error.message}`, error.stack);

      await this.logRepository.save({
        ruleId: rule.id,
        targetType: 'customer',
        targetId: customerId,
        status: ExecutionStatus.FAILED,
        errorMessage: error.message,
        executionTime: Date.now() - startTime,
      });

      return null;
    }
  }

  /**
   * 获取执行日志
   */
  async getLogs(ruleId?: number, limit = 100) {
    const query = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.rule', 'rule')
      .orderBy('log.create_time', 'DESC')
      .limit(limit);

    if (ruleId) {
      query.where('log.rule_id = :ruleId', { ruleId });
    }

    return await query.getMany();
  }
}
