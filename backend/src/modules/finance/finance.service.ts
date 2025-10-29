import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  /**
   * 获取财务概览
   */
  async getOverview(startDate?: string, endDate?: string, dataScope?: any) {
    const qb = this.orderRepository.createQueryBuilder('order');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('order.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 日期范围
    if (startDate && endDate) {
      qb.andWhere('order.payment_time BETWEEN :startDate AND :endDate', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      });
    }

    // 总收入
    const totalRevenue = await qb
      .select('SUM(order.payment_amount)', 'total')
      .getRawOne();

    // 订单数
    const totalOrders = await qb.getCount();

    // 退款统计
    const refundStats = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(order.payment_amount)', 'amount')
      .where('order.order_status = :status', { status: '已退款' })
      .getRawOne();

    // 新学员收入
    const newStudentRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payment_amount)', 'total')
      .where('order.is_new_student = 1')
      .getRawOne();

    // 老学员收入
    const oldStudentRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payment_amount)', 'total')
      .where('order.is_new_student = 0')
      .getRawOne();

    return {
      totalRevenue: parseFloat(totalRevenue?.total || 0),
      totalOrders,
      refundCount: parseInt(refundStats?.count || 0),
      refundAmount: parseFloat(refundStats?.amount || 0),
      newStudentRevenue: parseFloat(newStudentRevenue?.total || 0),
      oldStudentRevenue: parseFloat(oldStudentRevenue?.total || 0),
      avgOrderAmount:
        totalOrders > 0
          ? parseFloat(totalRevenue?.total || 0) / totalOrders
          : 0,
    };
  }

  /**
   * 获取收入趋势（按日/月）
   */
  async getRevenueTrend(
    type: 'day' | 'month',
    startDate?: string,
    endDate?: string,
    dataScope?: any,
  ) {
    const qb = this.orderRepository.createQueryBuilder('order');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('order.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 日期范围
    if (startDate && endDate) {
      qb.andWhere('order.payment_time BETWEEN :startDate AND :endDate', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      });
    }

    // 按日期分组
    const dateFormat = type === 'day' ? '%Y-%m-%d' : '%Y-%m';
    qb.select(`DATE_FORMAT(order.payment_time, '${dateFormat}')`, 'date')
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
   * 获取销售排行榜
   */
  async getSalesRanking(
    startDate?: string,
    endDate?: string,
    dataScope?: any,
  ) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('users', 'sales', 'sales.id = order.sales_id')
      .select('order.sales_id', 'salesId')
      .addSelect('sales.real_name', 'salesName')
      .addSelect('SUM(order.payment_amount)', 'totalRevenue')
      .addSelect('COUNT(*)', 'orderCount')
      .groupBy('order.sales_id');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('order.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 日期范围
    if (startDate && endDate) {
      qb.andWhere('order.payment_time BETWEEN :startDate AND :endDate', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      });
    }

    qb.orderBy('totalRevenue', 'DESC').limit(10);

    const results = await qb.getRawMany();

    return results.map((item, index) => ({
      rank: index + 1,
      salesId: item.salesId,
      salesName: item.salesName,
      totalRevenue: parseFloat(item.totalRevenue),
      orderCount: parseInt(item.orderCount),
    }));
  }

  /**
   * 获取校区收入统计
   */
  async getCampusRevenue(
    startDate?: string,
    endDate?: string,
    dataScope?: any,
  ) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('campus', 'campus', 'campus.id = order.campus_id')
      .select('order.campus_id', 'campusId')
      .addSelect('campus.campus_name', 'campusName')
      .addSelect('SUM(order.payment_amount)', 'revenue')
      .addSelect('COUNT(*)', 'orderCount')
      .groupBy('order.campus_id');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('order.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 日期范围
    if (startDate && endDate) {
      qb.andWhere('order.payment_time BETWEEN :startDate AND :endDate', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      });
    }

    const results = await qb.getRawMany();

    return results.map((item) => ({
      campusId: item.campusId,
      campusName: item.campusName || '未分配',
      revenue: parseFloat(item.revenue),
      orderCount: parseInt(item.orderCount),
    }));
  }

  /**
   * 获取课程收入统计
   */
  async getCourseRevenue(
    startDate?: string,
    endDate?: string,
    dataScope?: any,
  ) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .select('order.course_name', 'courseName')
      .addSelect('SUM(order.payment_amount)', 'revenue')
      .addSelect('COUNT(*)', 'orderCount')
      .groupBy('order.course_name');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('order.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 日期范围
    if (startDate && endDate) {
      qb.andWhere('order.payment_time BETWEEN :startDate AND :endDate', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      });
    }

    qb.orderBy('revenue', 'DESC').limit(10);

    const results = await qb.getRawMany();

    return results.map((item) => ({
      courseName: item.courseName,
      revenue: parseFloat(item.revenue),
      orderCount: parseInt(item.orderCount),
    }));
  }
}
