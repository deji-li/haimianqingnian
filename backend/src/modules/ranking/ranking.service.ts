import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull, DataSource } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Campus } from '../system/entities/campus.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取校区排行榜
   */
  async getCampusRanking(params: {
    type: 'revenue' | 'orderCount' | 'studentCount';
    timeRange: 'day' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);
    const limit = params.limit || 20;

    try {
      // 查询订单数据
      const orders = await this.orderRepository.find({
        where: {
          isDeleted: 0,
          paymentTime: Between(startDate, endDate),
        },
        relations: ['campus'],
      });

      // 按校区分组统计
      const campusStats = new Map<number, any>();

      for (const order of orders) {
        if (!order.campusId) continue;

        if (!campusStats.has(order.campusId)) {
          campusStats.set(order.campusId, {
            campusId: order.campusId,
            campusName: order.campus?.campusName || '未知校区',
            revenue: 0,
            orderCount: 0,
            studentCount: new Set(),
          });
        }

        const stats = campusStats.get(order.campusId);
        stats.revenue += order.paymentAmount || 0;
        stats.orderCount += 1;
        if (order.customerId) {
          stats.studentCount.add(order.customerId);
        }
      }

      // 转换为数组并计算学生数量
      let result = Array.from(campusStats.values()).map(stats => ({
        ...stats,
        studentCount: stats.studentCount.size,
      }));

      // 根据类型排序
      switch (params.type) {
        case 'revenue':
          result.sort((a, b) => b.revenue - a.revenue);
          break;
        case 'orderCount':
          result.sort((a, b) => b.orderCount - a.orderCount);
          break;
        case 'studentCount':
          result.sort((a, b) => b.studentCount - a.studentCount);
          break;
      }

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        type: params.type,
        data: result.slice(0, limit),
      };
    } catch (error) {
      this.logger.error('获取校区排行榜失败', error);
      throw error;
    }
  }

  /**
   * 获取订单排行榜
   */
  async getOrderRanking(params: {
    type: 'amount' | 'commission' | 'profit';
    timeRange: 'day' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    campusId?: number;
    limit?: number;
  }) {
    const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);
    const limit = params.limit || 20;

    try {
      const whereConditions: any = {
        isDeleted: 0,
        paymentTime: Between(startDate, endDate),
      };

      if (params.campusId) {
        whereConditions.campusId = params.campusId;
      }

      const orders = await this.orderRepository.find({
        where: whereConditions,
        relations: ['campus', 'customer'],
        order: {
          paymentAmount: 'DESC',
        },
        take: limit,
      });

      const result = orders.map(order => ({
        orderId: order.orderNo,
        paymentAmount: order.paymentAmount,
        teacherCommission: order.teacherCommissionAmount || 0,
        campusName: order.campus?.campusName || '未知校区',
        customerName: order.customer?.wechatNickname || '未知客户',
        paymentTime: order.paymentTime,
        profit: (order.paymentAmount || 0) - (order.teacherCommissionAmount || 0),
      }));

      // 根据类型排序
      switch (params.type) {
        case 'amount':
          result.sort((a, b) => b.paymentAmount - a.paymentAmount);
          break;
        case 'commission':
          result.sort((a, b) => b.teacherCommission - a.teacherCommission);
          break;
        case 'profit':
          result.sort((a, b) => b.profit - a.profit);
          break;
      }

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        type: params.type,
        data: result,
      };
    } catch (error) {
      this.logger.error('获取订单排行榜失败', error);
      throw error;
    }
  }

  /**
   * 获取老师排行榜
   */
  async getTeacherRanking(params: {
    type: 'commission' | 'orderCount' | 'studentCount';
    timeRange: 'day' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    campusId?: number;
    limit?: number;
  }) {
    const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);
    const limit = params.limit || 20;

    try {
      // 使用原生SQL查询，确保正确关联老师和校区信息
      let query = `
        SELECT
          t.id as teacherId,
          t.display_name as teacherName,
          t.name as teacherCode,
          c.campus_name as campusName,
          COALESCE(SUM(o.commission_amount), 0) as commission,
          COUNT(o.id) as orderCount,
          COUNT(DISTINCT o.customer_id) as studentCount,
          COALESCE(SUM(o.payment_amount), 0) as totalRevenue
        FROM teachers t
        LEFT JOIN campus c ON t.campus_id = c.id
        LEFT JOIN orders o ON o.teacher_id = t.name
          AND o.is_deleted = 0
          AND o.payment_time BETWEEN ? AND ?
        WHERE 1=1
      `;

      const queryParams: any[] = [startDate, endDate];

      // 如果指定了校区ID，添加校区过滤
      if (params.campusId) {
        query += ` AND t.campus_id = ?`;
        queryParams.push(params.campusId);
      }

      query += `
        GROUP BY t.id, t.display_name, t.name, c.campus_name
      `;

      // 根据类型排序
      switch (params.type) {
        case 'commission':
          query += ` ORDER BY commission DESC`;
          break;
        case 'orderCount':
          query += ` ORDER BY orderCount DESC`;
          break;
        case 'studentCount':
          query += ` ORDER BY studentCount DESC`;
          break;
      }

      query += ` LIMIT ?`;
      queryParams.push(limit);

      const results = await this.dataSource.query(query, queryParams);

      // 处理结果，确保数据格式正确
      const processedResults = results.map((row: any) => ({
        teacherId: row.teacherId,
        teacherName: row.teacherName || row.teacherCode || '未知老师',
        campusName: row.campusName || '未知校区',
        commission: parseFloat(row.commission) || 0,
        orderCount: parseInt(row.orderCount) || 0,
        studentCount: parseInt(row.studentCount) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
      }));

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        type: params.type,
        data: processedResults,
      };
    } catch (error) {
      this.logger.error('获取老师排行榜失败', error);
      throw error;
    }
  }

  /**
   * 获取销售排行榜
   */
  async getSalesRanking(params: {
    type: 'revenue' | 'orderCount' | 'commission';
    timeRange: 'day' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    campusId?: number;
    limit?: number;
  }) {
    const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);
    const limit = params.limit || 20;

    try {
      const whereConditions: any = {
        isDeleted: 0,
        paymentTime: Between(startDate, endDate),
      };

      if (params.campusId) {
        whereConditions.campusId = params.campusId;
      }

      const orders = await this.orderRepository.find({
        where: whereConditions,
        relations: ['campus'],
      });

      // 按销售分组统计
      const salesStats = new Map<number, any>();

      for (const order of orders) {
        if (!order.salesId) continue;

        if (!salesStats.has(order.salesId)) {
          salesStats.set(order.salesId, {
            salesId: order.salesId,
            campusName: order.campus?.campusName || '未知校区',
            revenue: 0,
            orderCount: 0,
            commission: 0,
          });
        }

        const stats = salesStats.get(order.salesId);
        stats.revenue += order.paymentAmount || 0;
        stats.orderCount += 1;
        stats.commission += order.salesCommissionAmount || 0;
      }

      // 转换为数组
      let result = Array.from(salesStats.values());

      // 根据类型排序
      switch (params.type) {
        case 'revenue':
          result.sort((a, b) => b.revenue - a.revenue);
          break;
        case 'orderCount':
          result.sort((a, b) => b.orderCount - a.orderCount);
          break;
        case 'commission':
          result.sort((a, b) => b.commission - a.commission);
          break;
      }

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        type: params.type,
        data: result.slice(0, limit),
      };
    } catch (error) {
      this.logger.error('获取销售排行榜失败', error);
      throw error;
    }
  }

  /**
   * 获取排行榜概览数据
   */
  async getRankingOverview(params: {
    timeRange: 'day' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);

    try {
      // 并行获取各种排行榜数据
      const [campusRanking, teacherRanking, salesRanking] = await Promise.all([
        this.getCampusRanking({
          type: 'revenue',
          timeRange: params.timeRange,
          startDate: params.startDate,
          endDate: params.endDate,
          limit: 5,
        }),
        this.getTeacherRanking({
          type: 'commission',
          timeRange: params.timeRange,
          startDate: params.startDate,
          endDate: params.endDate,
          limit: 5,
        }),
        this.getSalesRanking({
          type: 'revenue',
          timeRange: params.timeRange,
          startDate: params.startDate,
          endDate: params.endDate,
          limit: 5,
        }),
      ]);

      // 计算总体统计
      const totalStats = await this.getTotalStats(startDate, endDate);

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        overview: {
          totalRevenue: totalStats.totalRevenue,
          totalOrders: totalStats.totalOrders,
          totalStudents: totalStats.totalStudents,
          totalTeachers: totalStats.totalTeachers,
          avgOrderValue: totalStats.totalOrders > 0 ? totalStats.totalRevenue / totalStats.totalOrders : 0,
        },
        topRankings: {
          campuses: campusRanking.data || [],
          teachers: teacherRanking.data || [],
          sales: salesRanking.data || [],
        },
      };
    } catch (error) {
      this.logger.error('获取排行榜概览失败', error);
      throw error;
    }
  }

  /**
   * 获取总体统计数据
   */
  private async getTotalStats(startDate: Date, endDate: Date) {
    const [totalRevenue, totalOrders, totalStudents, totalTeachers] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.paymentAmount)', 'total')
        .where('order.isDeleted = :isDeleted', { isDeleted: 0 })
        .andWhere('order.paymentTime BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne(),
      this.orderRepository.count({
        where: {
          isDeleted: 0,
          paymentTime: Between(startDate, endDate),
        },
      }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(DISTINCT order.customerId)', 'total')
        .where('order.isDeleted = :isDeleted', { isDeleted: 0 })
        .andWhere('order.paymentTime BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('order.customerId IS NOT NULL')
        .getRawOne(),
      this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(DISTINCT order.teacherId)', 'total')
        .where('order.isDeleted = :isDeleted', { isDeleted: 0 })
        .andWhere('order.paymentTime BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('order.teacherId IS NOT NULL')
        .getRawOne(),
    ]);

    return {
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      totalOrders,
      totalStudents: parseInt(totalStudents?.total || '0'),
      totalTeachers: parseInt(totalTeachers?.total || '0'),
    };
  }

  /**
   * 获取日期范围
   */
  private getDateRange(
    timeRange: 'day' | 'week' | 'month' | 'year' | 'custom',
    customStartDate?: string,
    customEndDate?: string,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          throw new Error('自定义时间范围需要提供开始和结束日期');
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        throw new Error(`不支持的时间范围: ${timeRange}`);
    }

    return { startDate, endDate };
  }
}