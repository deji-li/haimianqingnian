import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { Order } from '../order/entities/order.entity';
import { CustomerFollowRecord } from '../customer/entities/customer-follow-record.entity';
import { OperationDailyRecord } from '../operation/entities/operation-daily-record.entity';
import { OperationCommissionRecord } from '../operation/entities/operation-commission-record.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(CustomerFollowRecord)
    private followRecordRepository: Repository<CustomerFollowRecord>,
    @InjectRepository(OperationDailyRecord)
    private operationDailyRecordRepository: Repository<OperationDailyRecord>,
    @InjectRepository(OperationCommissionRecord)
    private operationCommissionRepository: Repository<OperationCommissionRecord>,
  ) {}

  /**
   * 获取管理看板数据
   */
  async getOverview(dataScope?: any) {
    // 客户统计
    const customerStats = await this.getCustomerStats(dataScope);

    // 订单统计
    const orderStats = await this.getOrderStats(dataScope);

    // 收入统计
    const revenueStats = await this.getRevenueStats(dataScope);

    // 今日数据
    const todayStats = await this.getTodayStats(dataScope);

    return {
      customer: customerStats,
      order: orderStats,
      revenue: revenueStats,
      today: todayStats,
    };
  }

  /**
   * 客户统计
   */
  private async getCustomerStats(dataScope?: any) {
    const qb = this.customerRepository.createQueryBuilder('customer');

    if (dataScope?.salesId) {
      qb.where('customer.sales_id = :salesId', { salesId: dataScope.salesId });
    }
    if (dataScope?.campusId) {
      qb.where('customer.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    const totalCustomers = await qb.getCount();

    // 按意向分组
    const intentStats = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.customer_intent', 'intent')
      .addSelect('COUNT(*)', 'count')
      .groupBy('customer.customer_intent')
      .getRawMany();

    return {
      total: totalCustomers,
      byIntent: intentStats.map((item) => ({
        intent: item.intent,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 订单统计
   */
  private async getOrderStats(dataScope?: any) {
    const qb = this.orderRepository.createQueryBuilder('order');

    if (dataScope?.salesId) {
      qb.where('order.sales_id = :salesId', { salesId: dataScope.salesId });
    }
    if (dataScope?.campusId) {
      qb.where('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    const totalOrders = await qb.getCount();

    // 按状态分组
    const statusStats = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.order_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.order_status')
      .getRawMany();

    // 新老学员
    const newStudentCount = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.is_new_student = 1')
      .getCount();

    return {
      total: totalOrders,
      newStudent: newStudentCount,
      oldStudent: totalOrders - newStudentCount,
      byStatus: statusStats.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 收入统计
   */
  private async getRevenueStats(dataScope?: any) {
    const qb = this.orderRepository.createQueryBuilder('order');

    if (dataScope?.salesId) {
      qb.where('order.sales_id = :salesId', { salesId: dataScope.salesId });
    }
    if (dataScope?.campusId) {
      qb.where('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    const totalRevenue = await qb
      .select('SUM(order.payment_amount)', 'total')
      .getRawOne();

    // 本月收入
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const monthRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payment_amount)', 'total')
      .where('order.payment_time >= :startOfMonth', { startOfMonth })
      .getRawOne();

    return {
      total: parseFloat(totalRevenue?.total || 0),
      thisMonth: parseFloat(monthRevenue?.total || 0),
    };
  }

  /**
   * 今日数据
   */
  private async getTodayStats(dataScope?: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日新增客户
    const newCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.create_time >= :today', { today })
      .getCount();

    // 今日新增订单
    const newOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.create_time >= :today', { today })
      .getCount();

    // 今日收入
    const todayRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payment_amount)', 'total')
      .where('order.payment_time >= :today', { today })
      .getRawOne();

    // 今日跟进记录数
    const followRecords = await this.followRecordRepository
      .createQueryBuilder('follow')
      .where('follow.follow_time >= :today', { today })
      .getCount();

    return {
      newCustomers,
      newOrders,
      revenue: parseFloat(todayRevenue?.total || 0),
      followRecords,
    };
  }

  /**
   * 获取环比数据（本月 vs 上月）
   */
  async getComparisonData(dataScope?: any) {
    const now = new Date();

    // 本月开始和结束时间
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 上月开始和结束时间
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 本月客户数
    const thisMonthCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.create_time >= :start', { start: thisMonthStart })
      .andWhere('customer.create_time <= :end', { end: thisMonthEnd })
      .getCount();

    // 上月客户数
    const lastMonthCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.create_time >= :start', { start: lastMonthStart })
      .andWhere('customer.create_time <= :end', { end: lastMonthEnd })
      .getCount();

    // 本月订单数
    const thisMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.create_time >= :start', { start: thisMonthStart })
      .andWhere('order.create_time <= :end', { end: thisMonthEnd })
      .getCount();

    // 上月订单数
    const lastMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.create_time >= :start', { start: lastMonthStart })
      .andWhere('order.create_time <= :end', { end: lastMonthEnd })
      .getCount();

    // 本月收入
    const thisMonthRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payment_amount)', 'total')
      .where('order.payment_time >= :start', { start: thisMonthStart })
      .andWhere('order.payment_time <= :end', { end: thisMonthEnd })
      .getRawOne();

    // 上月收入
    const lastMonthRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payment_amount)', 'total')
      .where('order.payment_time >= :start', { start: lastMonthStart })
      .andWhere('order.payment_time <= :end', { end: lastMonthEnd })
      .getRawOne();

    const thisRevenue = parseFloat(thisMonthRevenue?.total || 0);
    const lastRevenue = parseFloat(lastMonthRevenue?.total || 0);

    // 计算增长率
    const calculateGrowth = (current: number, last: number): number => {
      if (last === 0) return current > 0 ? 100 : 0;
      return Number((((current - last) / last) * 100).toFixed(2));
    };

    return {
      customers: {
        thisMonth: thisMonthCustomers,
        lastMonth: lastMonthCustomers,
        growth: calculateGrowth(thisMonthCustomers, lastMonthCustomers),
      },
      orders: {
        thisMonth: thisMonthOrders,
        lastMonth: lastMonthOrders,
        growth: calculateGrowth(thisMonthOrders, lastMonthOrders),
      },
      revenue: {
        thisMonth: thisRevenue,
        lastMonth: lastRevenue,
        growth: calculateGrowth(thisRevenue, lastRevenue),
      },
    };
  }

  /**
   * 获取近7天数据趋势
   */
  async getWeeklyTrend(dataScope?: any) {
    const qb = this.orderRepository.createQueryBuilder('order');

    if (dataScope?.salesId) {
      qb.where('order.sales_id = :salesId', { salesId: dataScope.salesId });
    }
    if (dataScope?.campusId) {
      qb.where('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 近7天
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    qb.andWhere('order.payment_time >= :sevenDaysAgo', { sevenDaysAgo });

    qb.select("DATE_FORMAT(order.payment_time, '%Y-%m-%d')", 'date')
      .addSelect('SUM(order.payment_amount)', 'revenue')
      .addSelect('COUNT(*)', 'count')
      .groupBy('date')
      .orderBy('date', 'ASC');

    const results = await qb.getRawMany();

    return results.map((item) => ({
      date: item.date,
      revenue: parseFloat(item.revenue),
      count: parseInt(item.count),
    }));
  }

  /**
   * 获取运营人员看板数据
   */
  async getOperatorDashboard(operatorId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. 本月日报填写天数
    const dailyReportDays = await this.operationDailyRecordRepository
      .createQueryBuilder('record')
      .where('record.operator_id = :operatorId', { operatorId })
      .andWhere('record.report_date >= :startOfMonth', { startOfMonth })
      .andWhere('record.report_date <= :endOfMonth', { endOfMonth })
      .getCount();

    // 2. 本月更新内容总数
    const updateCountResult = await this.operationDailyRecordRepository
      .createQueryBuilder('record')
      .select('SUM(record.update_count)', 'total')
      .where('record.operator_id = :operatorId', { operatorId })
      .andWhere('record.report_date >= :startOfMonth', { startOfMonth })
      .andWhere('record.report_date <= :endOfMonth', { endOfMonth })
      .getRawOne();

    // 3. 本月引流客户数
    const newCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.operator_id = :operatorId', { operatorId })
      .andWhere('customer.create_time >= :startOfMonth', { startOfMonth })
      .andWhere('customer.create_time <= :endOfMonth', { endOfMonth })
      .getCount();

    // 4. 本月提成金额（待发放+已发放）
    const commissionResult = await this.operationCommissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.commission_amount)', 'total')
      .where('commission.operator_id = :operatorId', { operatorId })
      .andWhere('commission.create_time >= :startOfMonth', { startOfMonth })
      .andWhere('commission.create_time <= :endOfMonth', { endOfMonth })
      .andWhere('commission.status IN (:...statuses)', { statuses: ['待发放', '已发放'] })
      .getRawOne();

    return {
      dailyReportDays,
      totalUpdateCount: parseInt(updateCountResult?.total || '0'),
      newCustomers,
      totalCommission: parseFloat(commissionResult?.total || '0'),
    };
  }
}
