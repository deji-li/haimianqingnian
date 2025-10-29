import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerLifecycle } from './entities/customer-lifecycle.entity';
import { Customer } from './entities/customer.entity';
import {
  CreateLifecycleDto,
  LifecycleHistoryDto,
  LifecycleStatisticsDto,
} from './dto/lifecycle.dto';

@Injectable()
export class LifecycleService {
  constructor(
    @InjectRepository(CustomerLifecycle)
    private lifecycleRepository: Repository<CustomerLifecycle>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * 创建生命周期记录（阶段变更）
   */
  async create(createLifecycleDto: CreateLifecycleDto) {
    const { customerId, stage, changeReason, operatorId } = createLifecycleDto;

    // 检查客户是否存在
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 创建生命周期记录
    const lifecycle = this.lifecycleRepository.create({
      customerId,
      stage,
      changeReason,
      operatorId,
    });

    await this.lifecycleRepository.save(lifecycle);

    // 更新客户当前生命周期阶段
    await this.customerRepository.update(customerId, {
      lifecycleStage: stage,
    } as any);

    return lifecycle;
  }

  /**
   * 获取客户生命周期历史
   */
  async getHistory(customerId: number): Promise<LifecycleHistoryDto[]> {
    const records = await this.lifecycleRepository
      .createQueryBuilder('lifecycle')
      .leftJoin('users', 'operator', 'lifecycle.operator_id = operator.id')
      .where('lifecycle.customer_id = :customerId', { customerId })
      .addSelect('operator.real_name', 'operatorName')
      .orderBy('lifecycle.create_time', 'DESC')
      .getRawMany();

    return records.map((item) => ({
      id: item.lifecycle_id,
      customerId: item.lifecycle_customer_id,
      stage: item.lifecycle_stage,
      changeReason: item.lifecycle_change_reason,
      operatorId: item.lifecycle_operator_id,
      operatorName: item.operatorName,
      createTime: item.lifecycle_create_time,
    }));
  }

  /**
   * 获取生命周期统计数据
   */
  async getStatistics(): Promise<LifecycleStatisticsDto[]> {
    const results = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.lifecycle_stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .groupBy('customer.lifecycle_stage')
      .getRawMany();

    const total = results.reduce((sum, item) => sum + Number(item.count), 0);

    return results.map((item) => ({
      stage: item.stage || '线索',
      count: Number(item.count),
      percentage: total > 0 ? (Number(item.count) / total) * 100 : 0,
    }));
  }

  /**
   * 获取按阶段分组的客户列表
   */
  async getCustomersByStage(stage: string) {
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'customer.sales_id = sales.id')
      .where('customer.lifecycle_stage = :stage', { stage })
      .select([
        'customer.id',
        'customer.wechat_nickname',
        'customer.wechat_id',
        'customer.phone',
        'customer.real_name',
        'customer.customer_intent',
        'customer.lifecycle_stage',
        'customer.create_time',
      ])
      .addSelect('sales.real_name', 'salesName')
      .orderBy('customer.create_time', 'DESC')
      .getRawMany();

    return customers.map((item) => ({
      id: item.customer_id,
      wechatNickname: item.customer_wechat_nickname,
      wechatId: item.customer_wechat_id,
      phone: item.customer_phone,
      realName: item.customer_real_name,
      customerIntent: item.customer_customer_intent,
      lifecycleStage: item.customer_lifecycle_stage,
      salesName: item.salesName,
      createTime: item.customer_create_time,
    }));
  }

  /**
   * 批量更新生命周期阶段
   */
  async batchUpdateStage(customerIds: number[], stage: string, operatorId: number, changeReason?: string) {
    for (const customerId of customerIds) {
      await this.create({
        customerId,
        stage,
        operatorId,
        changeReason: changeReason || `批量更新为${stage}`,
      });
    }

    return { message: `成功更新${customerIds.length}个客户的生命周期阶段` };
  }
}
