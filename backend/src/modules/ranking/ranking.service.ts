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
        // 处理有校区的订单
        if (order.campusId) {
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
          stats.revenue += parseFloat(order.paymentAmount?.toString() || '0') || 0;
          stats.orderCount += 1;
          if (order.customerId) {
            stats.studentCount.add(order.customerId);
          }
        } else {
          // 处理没有校区的订单，归为"未知校区"
          const unknownCampusId = 0;
          if (!campusStats.has(unknownCampusId)) {
            campusStats.set(unknownCampusId, {
              campusId: unknownCampusId,
              campusName: '未知校区',
              revenue: 0,
              orderCount: 0,
              studentCount: new Set(),
            });
          }

          const stats = campusStats.get(unknownCampusId);
          stats.revenue += parseFloat(order.paymentAmount?.toString() || '0') || 0;
          stats.orderCount += 1;
          if (order.customerId) {
            stats.studentCount.add(order.customerId);
          }
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

      // 计算总统计数据（基于所有校区，不受limit限制）
      const totalStats = {
        totalCampus: result.length,  // 总校区数
        totalRevenue: result.reduce((sum, item) => sum + item.revenue, 0),  // 总营收
        totalOrders: result.reduce((sum, item) => sum + item.orderCount, 0),  // 总订单数
        totalStudents: result.reduce((sum, item) => sum + item.studentCount, 0),  // 总学员数（可能重复）
      };

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        type: params.type,
        data: result.slice(0, limit),
        total: totalStats,  // 添加总统计数据
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
      // 注意: orders.teacher_id存储的是海绵系统的coach_id(数字)
      // teachers.name存储的是coach_id的字符串形式
      // 所以需要类型转换进行关联
      let query = `
        SELECT
          t.id as teacherId,
          t.display_name as teacherName,
          t.name as teacherCode,
          c.campus_name as campusName,
          COALESCE(SUM(o.teacher_commission_amount), 0) as commission,
          COUNT(o.id) as orderCount,
          COUNT(DISTINCT o.customer_id) as studentCount,
          COALESCE(SUM(o.payment_amount), 0) as totalRevenue
        FROM teachers t
        LEFT JOIN campus c ON t.campus_id = c.id
        LEFT JOIN orders o ON CAST(o.teacher_id AS CHAR) = t.name
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

      // 先查询所有数据用于统计
      const allResults = await this.dataSource.query(query, queryParams);

      // 处理所有结果
      const allProcessedResults = allResults.map((row: any) => ({
        teacherId: row.teacherId,
        teacherName: row.teacherName || row.teacherCode || '未知老师',
        campusName: row.campusName || '未知校区',
        commission: parseFloat(row.commission) || 0,
        orderCount: parseInt(row.orderCount) || 0,
        studentCount: parseInt(row.studentCount) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
      }));

      // 过滤掉没有订单的老师（orderCount为0）
      const activeTeachers = allProcessedResults.filter(t => t.orderCount > 0);

      // 计算总统计数据
      const totalStats = {
        totalTeachers: activeTeachers.length,  // 有订单的老师总数
        totalCommission: activeTeachers.reduce((sum, t) => sum + t.commission, 0),  // 总提成
        totalOrders: activeTeachers.reduce((sum, t) => sum + t.orderCount, 0),  // 总订单数
        totalStudents: activeTeachers.reduce((sum, t) => sum + t.studentCount, 0),  // 总学员数（可能重复）
        totalRevenue: activeTeachers.reduce((sum, t) => sum + t.totalRevenue, 0),  // 总营收
      };

      this.logger.log('=== 老师排行榜返回数据 ===');
      this.logger.log(`有订单的老师数量: ${activeTeachers.length}`);
      this.logger.log(`返回的老师数量: ${Math.min(activeTeachers.length, limit)}`);
      this.logger.log('总统计数据:', JSON.stringify(totalStats));

      const result = {
        timeRange: params.timeRange,
        startDate,
        endDate,
        type: params.type,
        data: activeTeachers.slice(0, limit),  // 返回前N个
        total: totalStats,  // 添加总统计数据
      };

      this.logger.log('返回结果数据条数:', result.data.length);
      return result;
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
      // 使用原生SQL查询，关联users表获取销售人员姓名
      let query = `
        SELECT
          u.id as salesId,
          u.real_name as salesName,
          c.campus_name as campusName,
          COALESCE(SUM(o.payment_amount), 0) as revenue,
          COUNT(o.id) as orderCount,
          COALESCE(SUM(o.commission_amount), 0) as commission
        FROM users u
        LEFT JOIN campus c ON u.campus_id = c.id
        LEFT JOIN orders o ON o.sales_id = u.id
          AND o.is_deleted = 0
          AND o.payment_time BETWEEN ? AND ?
      `;

      const queryParams: any[] = [startDate, endDate];

      // 如果指定了校区ID，添加校区过滤
      if (params.campusId) {
        query += ` AND u.campus_id = ?`;
        queryParams.push(params.campusId);
      }

      query += `
        WHERE u.id IN (
          SELECT DISTINCT sales_id
          FROM orders
          WHERE is_deleted = 0
          AND payment_time BETWEEN ? AND ?
          AND sales_id IS NOT NULL
        )
        GROUP BY u.id, u.real_name, c.campus_name
      `;

      // 添加时间范围参数（用于子查询）
      queryParams.push(startDate, endDate);

      // 根据类型排序
      switch (params.type) {
        case 'revenue':
          query += ` ORDER BY revenue DESC`;
          break;
        case 'orderCount':
          query += ` ORDER BY orderCount DESC`;
          break;
        case 'commission':
          query += ` ORDER BY commission DESC`;
          break;
      }

      // 查询所有数据用于统计
      const allResults = await this.dataSource.query(query, queryParams);

      // 处理所有结果
      const result = allResults.map((row: any) => ({
        salesId: row.salesId,
        salesName: row.salesName || '未知销售',
        campusName: row.campusName || '未知校区',
        revenue: parseFloat(row.revenue) || 0,
        orderCount: parseInt(row.orderCount) || 0,
        commission: parseFloat(row.commission) || 0,
      }));

      // 计算总统计数据（基于所有销售，不受limit限制）
      const totalStats = {
        totalSales: result.length,  // 总销售数
        totalRevenue: result.reduce((sum, item) => sum + item.revenue, 0),  // 总营收
        totalOrders: result.reduce((sum, item) => sum + item.orderCount, 0),  // 总订单数
        totalCommission: result.reduce((sum, item) => sum + item.commission, 0),  // 总提成
      };

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        type: params.type,
        data: result.slice(0, limit),
        total: totalStats,  // 添加总统计数据
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
   * 获取商品排行榜（按课程销量/金额）
   */
  async getProductRanking(params: {
    timeRange: 'day' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    campusId?: number;
    sortBy: 'quantity' | 'amount';
    limit?: number;
  }) {
    const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);
    const limit = params.limit || 50;

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

      console.log('=== 商品排行调试信息 ===');
      console.log('时间范围:', startDate, '到', endDate);
      console.log('查询到的订单数量:', orders.length);
      console.log('前3个订单示例:');
      for (let i = 0; i < Math.min(3, orders.length); i++) {
        console.log(`  ${i+1}. ${orders[i].courseName} - ¥${orders[i].paymentAmount} - ${orders[i].paymentTime}`);
      }

      // 按课程分组统计
      const productStats = new Map<string, any>();

      for (const order of orders) {
        const courseName = order.courseName || '未知课程';

        if (!productStats.has(courseName)) {
          productStats.set(courseName, {
            courseName,
            campusName: order.campus?.campusName || '未知校区',
            quantity: 0,
            totalAmount: 0,
            orderCount: 0,
          });
        }

        const stats = productStats.get(courseName);
        stats.quantity += 1;
        stats.totalAmount += parseFloat(order.paymentAmount?.toString() || '0') || 0;
        stats.orderCount += 1;
      }

      // 转换为数组并排序
      let result = Array.from(productStats.values());

      // 根据类型排序
      if (params.sortBy === 'quantity') {
        result.sort((a, b) => b.quantity - a.quantity);
      } else {
        result.sort((a, b) => b.totalAmount - a.totalAmount);
      }

      // 计算总统计数据（基于所有订单，不受limit限制）
      const totalStats = {
        totalOrders: orders.length,  // 总订单数
        totalQuantity: result.reduce((sum, item) => sum + item.quantity, 0),  // 总销量
        totalAmount: result.reduce((sum, item) => sum + item.totalAmount, 0),  // 总金额
        totalProducts: result.length,  // 总商品数
      };

      return {
        timeRange: params.timeRange,
        startDate,
        endDate,
        sortBy: params.sortBy,
        data: result.slice(0, limit),
        total: totalStats,  // 添加总统计数据
      };
    } catch (error) {
      this.logger.error('获取商品排行榜失败', error);
      throw error;
    }
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
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = now.getDay() || 7; // 周日为0，转换为7
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
        // 修复：结束日期改为今天，而不是本周日（避免包含未来日期）
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // 修复：结束日期改为今天，而不是本月最后一天（避免包含未来日期）
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        // 修复：结束日期改为今天，而不是本年最后一天（避免包含未来日期）
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          throw new Error('自定义时间范围需要提供开始和结束日期');
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate + ' 23:59:59');
        break;
      default:
        throw new Error(`不支持的时间范围: ${timeRange}`);
    }

    return { startDate, endDate };
  }
}