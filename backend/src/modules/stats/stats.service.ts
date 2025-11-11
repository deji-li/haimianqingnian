import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { CustomerFollowRecord } from '../customer/entities/customer-follow-record.entity';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFollowRecord)
    private followRecordRepository: Repository<CustomerFollowRecord>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  /**
   * 获取首页统计数据
   */
  async getHomeStats(dataScope: any = {}, userId?: number) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // 构建数据权限查询条件
    const dataScopeWhere: any = {};
    if (dataScope.userId) {
      dataScopeWhere.salesId = dataScope.userId;
    }

    // 今日跟进数
    const todayFollowCount = await this.followRecordRepository.count({
      where: {
        followTime: Between(today, tomorrow),
        ...(dataScope.userId && { operatorId: dataScope.userId }),
      },
    });

    // 待跟进数（今天及之前需要跟进的客户）
    const pendingFollowCount = await this.customerRepository.count({
      where: {
        nextFollowTime: Between(new Date(0), tomorrow),
        ...dataScopeWhere,
      },
    });

    // 本月订单数
    const monthOrderCount = await this.orderRepository.count({
      where: {
        paymentTime: Between(monthStart, monthEnd),
        ...dataScopeWhere,
      },
    });

    // 本月订单金额
    const monthOrderResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.paymentAmount)', 'total')
      .where('order.paymentTime >= :monthStart', { monthStart })
      .andWhere('order.paymentTime < :monthEnd', { monthEnd })
      .andWhere(
        dataScope.userId ? 'order.salesId = :userId' : '1=1',
        dataScope.userId ? { userId: dataScope.userId } : {},
      )
      .getRawOne();

    const monthOrderAmount = parseFloat(monthOrderResult?.total || '0');

    // 客户总数
    const customerCount = await this.customerRepository.count({
      where: dataScopeWhere,
    });

    // 高意向客户数
    const highIntentCount = await this.customerRepository.count({
      where: {
        customerIntent: '高',
        ...dataScopeWhere,
      },
    });

    return {
      todayFollowCount,
      pendingFollowCount,
      monthOrderCount,
      monthOrderAmount,
      customerCount,
      highIntentCount,
    };
  }
}
