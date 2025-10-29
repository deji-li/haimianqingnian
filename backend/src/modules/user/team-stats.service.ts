import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CustomerFollowRecord } from '../customer/entities/customer-follow-record.entity';
import { SalesTarget } from '../target/entities/sales-target.entity';
import {
  TeamMemberPerformanceDto,
  TeamOverviewDto,
  DepartmentPerformanceDto,
  CampusPerformanceDto,
  TeamStatsQueryDto,
} from './dto/team-stats.dto';

@Injectable()
export class TeamStatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFollowRecord)
    private followRecordRepository: Repository<CustomerFollowRecord>,
    @InjectRepository(SalesTarget)
    private salesTargetRepository: Repository<SalesTarget>,
  ) {}

  /**
   * 获取团队成员业绩排行榜
   */
  async getTeamMemberPerformance(
    query: TeamStatsQueryDto,
  ): Promise<TeamMemberPerformanceDto[]> {
    const { startDate, endDate, departmentId, campusId, sortBy = 'totalAmount', limit = 50 } = query;

    // 构建用户查询
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: 1 });

    if (departmentId) {
      userQuery.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    if (campusId) {
      userQuery.andWhere('user.campusId = :campusId', { campusId });
    }

    const users = await userQuery.getMany();

    // 为每个用户计算业绩数据
    const performanceList: TeamMemberPerformanceDto[] = [];

    for (const user of users) {
      // 订单统计
      const orderQuery = this.orderRepository
        .createQueryBuilder('order')
        .where('order.salesId = :userId', { userId: user.id })
        .andWhere('order.orderStatus != :status', { status: '已退款' });

      if (startDate) {
        orderQuery.andWhere('order.paymentTime >= :startDate', { startDate });
      }
      if (endDate) {
        orderQuery.andWhere('order.paymentTime <= :endDate', { endDate });
      }

      const orderStats = await orderQuery
        .select('COUNT(*)', 'count')
        .addSelect('SUM(order.paymentAmount)', 'totalAmount')
        .getRawOne();

      // 客户统计
      const customerQuery = this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.salesId = :userId', { userId: user.id });

      if (startDate) {
        customerQuery.andWhere('customer.createTime >= :startDate', { startDate });
      }
      if (endDate) {
        customerQuery.andWhere('customer.createTime <= :endDate', { endDate });
      }

      const customerCount = await customerQuery.getCount();

      // 新增客户统计（在时间范围内创建的）
      const newCustomerQuery = this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.salesId = :userId', { userId: user.id });

      if (startDate && endDate) {
        newCustomerQuery
          .andWhere('customer.createTime >= :startDate', { startDate })
          .andWhere('customer.createTime <= :endDate', { endDate });
      } else if (startDate) {
        newCustomerQuery.andWhere('customer.createTime >= :startDate', { startDate });
      }

      const newCustomerCount = await newCustomerQuery.getCount();

      // 跟进次数统计
      const followQuery = this.followRecordRepository
        .createQueryBuilder('follow')
        .where('follow.operatorId = :userId', { userId: user.id });

      if (startDate) {
        followQuery.andWhere('follow.followTime >= :startDate', { startDate });
      }
      if (endDate) {
        followQuery.andWhere('follow.followTime <= :endDate', { endDate });
      }

      const followCount = await followQuery.getCount();

      // 销售目标统计（当前月度目标）
      const currentDate = new Date();
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const target = await this.salesTargetRepository
        .createQueryBuilder('target')
        .where('target.userId = :userId', { userId: user.id })
        .andWhere('target.startDate <= :endDate', { endDate: currentMonthEnd })
        .andWhere('target.endDate >= :startDate', { startDate: currentMonthStart })
        .getOne();

      const totalAmount = parseFloat(orderStats.totalAmount || '0');
      const orderCount = parseInt(orderStats.count || '0', 10);

      performanceList.push({
        userId: user.id,
        userName: user.username,
        realName: user.realName,
        avatar: user.avatar,
        departmentName: undefined, // TODO: 需要关联查询部门表
        campusName: undefined, // TODO: 需要关联查询校区表
        totalAmount,
        orderCount,
        customerCount,
        newCustomerCount,
        followCount,
        targetAmount: target?.targetAmount,
        targetCompletion: target && target.targetAmount > 0
          ? (totalAmount / target.targetAmount) * 100
          : undefined,
      });
    }

    // 排序
    performanceList.sort((a, b) => {
      if (sortBy === 'totalAmount') return b.totalAmount - a.totalAmount;
      if (sortBy === 'orderCount') return b.orderCount - a.orderCount;
      if (sortBy === 'customerCount') return b.customerCount - a.customerCount;
      return 0;
    });

    // 添加排名
    performanceList.forEach((item, index) => {
      item.rank = index + 1;
    });

    // 限制返回数量
    return performanceList.slice(0, limit);
  }

  /**
   * 获取团队整体统计
   */
  async getTeamOverview(query: TeamStatsQueryDto): Promise<TeamOverviewDto> {
    const { startDate, endDate, departmentId, campusId } = query;

    // 获取团队成员列表
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: 1 });

    if (departmentId) {
      userQuery.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    if (campusId) {
      userQuery.andWhere('user.campusId = :campusId', { campusId });
    }

    const totalMembers = await userQuery.getCount();
    const userIds = (await userQuery.getMany()).map(u => u.id);

    // 订单统计
    const orderQuery = this.orderRepository
      .createQueryBuilder('order')
      .where('order.salesId IN (:...userIds)', { userIds })
      .andWhere('order.orderStatus != :status', { status: '已退款' });

    if (startDate) {
      orderQuery.andWhere('order.paymentTime >= :startDate', { startDate });
    }
    if (endDate) {
      orderQuery.andWhere('order.paymentTime <= :endDate', { endDate });
    }

    const orderStats = await orderQuery
      .select('COUNT(*)', 'count')
      .addSelect('SUM(order.paymentAmount)', 'totalAmount')
      .getRawOne();

    // 客户统计
    const customerQuery = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.salesId IN (:...userIds)', { userIds });

    if (startDate) {
      customerQuery.andWhere('customer.createTime >= :startDate', { startDate });
    }
    if (endDate) {
      customerQuery.andWhere('customer.createTime <= :endDate', { endDate });
    }

    const totalCustomers = await customerQuery.getCount();

    const totalAmount = parseFloat(orderStats.totalAmount || '0');
    const totalOrders = parseInt(orderStats.count || '0', 10);

    // 计算增长率（对比上一个时间段）
    let amountGrowthRate: number | undefined;
    let orderGrowthRate: number | undefined;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // 计算上一个时间段
      const prevEndDate = new Date(start);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      const prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

      const prevOrderQuery = this.orderRepository
        .createQueryBuilder('order')
        .where('order.salesId IN (:...userIds)', { userIds })
        .andWhere('order.orderStatus != :status', { status: '已退款' })
        .andWhere('order.paymentTime >= :prevStartDate', { prevStartDate: prevStartDate.toISOString().split('T')[0] })
        .andWhere('order.paymentTime <= :prevEndDate', { prevEndDate: prevEndDate.toISOString().split('T')[0] });

      const prevOrderStats = await prevOrderQuery
        .select('COUNT(*)', 'count')
        .addSelect('SUM(order.paymentAmount)', 'totalAmount')
        .getRawOne();

      const prevTotalAmount = parseFloat(prevOrderStats.totalAmount || '0');
      const prevTotalOrders = parseInt(prevOrderStats.count || '0', 10);

      if (prevTotalAmount > 0) {
        amountGrowthRate = ((totalAmount - prevTotalAmount) / prevTotalAmount) * 100;
      }

      if (prevTotalOrders > 0) {
        orderGrowthRate = ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100;
      }
    }

    return {
      totalMembers,
      totalAmount,
      totalOrders,
      totalCustomers,
      avgAmountPerMember: totalMembers > 0 ? totalAmount / totalMembers : 0,
      avgOrdersPerMember: totalMembers > 0 ? totalOrders / totalMembers : 0,
      amountGrowthRate,
      orderGrowthRate,
    };
  }

  /**
   * 获取部门业绩对比
   */
  async getDepartmentComparison(query: TeamStatsQueryDto): Promise<DepartmentPerformanceDto[]> {
    const { startDate, endDate, campusId } = query;

    // 获取所有有员工的部门
    const departmentQuery = this.userRepository
      .createQueryBuilder('user')
      .select('DISTINCT user.departmentId', 'departmentId')
      .where('user.status = :status', { status: 1 })
      .andWhere('user.departmentId IS NOT NULL');

    if (campusId) {
      departmentQuery.andWhere('user.campusId = :campusId', { campusId });
    }

    const departmentIds = (await departmentQuery.getRawMany()).map(d => d.departmentId);

    // TODO: 需要查询department表获取部门名称
    // 目前暂时使用部门ID作为名称
    const departments = departmentIds.map(id => ({
      departmentId: id,
      departmentName: `部门${id}`
    }));

    const performanceList: DepartmentPerformanceDto[] = [];

    for (const dept of departments) {
      // 获取部门成员
      const memberQuery = this.userRepository
        .createQueryBuilder('user')
        .where('user.departmentId = :departmentId', { departmentId: dept.departmentId })
        .andWhere('user.status = :status', { status: 1 });

      const memberCount = await memberQuery.getCount();
      const memberIds = (await memberQuery.getMany()).map(u => u.id);

      if (memberIds.length === 0) continue;

      // 订单统计
      const orderQuery = this.orderRepository
        .createQueryBuilder('order')
        .where('order.salesId IN (:...memberIds)', { memberIds })
        .andWhere('order.orderStatus != :status', { status: '已退款' });

      if (startDate) {
        orderQuery.andWhere('order.paymentTime >= :startDate', { startDate });
      }
      if (endDate) {
        orderQuery.andWhere('order.paymentTime <= :endDate', { endDate });
      }

      const orderStats = await orderQuery
        .select('COUNT(*)', 'count')
        .addSelect('SUM(order.paymentAmount)', 'totalAmount')
        .getRawOne();

      // 客户统计
      const customerQuery = this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.salesId IN (:...memberIds)', { memberIds });

      if (startDate) {
        customerQuery.andWhere('customer.createTime >= :startDate', { startDate });
      }
      if (endDate) {
        customerQuery.andWhere('customer.createTime <= :endDate', { endDate });
      }

      const customerCount = await customerQuery.getCount();

      const totalAmount = parseFloat(orderStats.totalAmount || '0');
      const orderCount = parseInt(orderStats.count || '0', 10);

      performanceList.push({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        memberCount,
        totalAmount,
        orderCount,
        customerCount,
        avgAmountPerMember: memberCount > 0 ? totalAmount / memberCount : 0,
      });
    }

    // 按总销售额排序
    performanceList.sort((a, b) => b.totalAmount - a.totalAmount);

    return performanceList;
  }

  /**
   * 获取校区业绩对比
   */
  async getCampusComparison(query: TeamStatsQueryDto): Promise<CampusPerformanceDto[]> {
    const { startDate, endDate, departmentId } = query;

    // 获取所有有员工的校区
    const campusQuery = this.userRepository
      .createQueryBuilder('user')
      .select('DISTINCT user.campusId', 'campusId')
      .where('user.status = :status', { status: 1 })
      .andWhere('user.campusId IS NOT NULL');

    if (departmentId) {
      campusQuery.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    const campusIds = (await campusQuery.getRawMany()).map(c => c.campusId);

    // TODO: 需要查询campus表获取校区名称
    // 目前暂时使用校区ID作为名称
    const campuses = campusIds.map(id => ({
      campusId: id,
      campusName: `校区${id}`
    }));

    const performanceList: CampusPerformanceDto[] = [];

    for (const campus of campuses) {
      // 获取校区成员
      const memberQuery = this.userRepository
        .createQueryBuilder('user')
        .where('user.campusId = :campusId', { campusId: campus.campusId })
        .andWhere('user.status = :status', { status: 1 });

      if (departmentId) {
        memberQuery.andWhere('user.departmentId = :departmentId', { departmentId });
      }

      const memberCount = await memberQuery.getCount();
      const memberIds = (await memberQuery.getMany()).map(u => u.id);

      if (memberIds.length === 0) continue;

      // 订单统计
      const orderQuery = this.orderRepository
        .createQueryBuilder('order')
        .where('order.salesId IN (:...memberIds)', { memberIds })
        .andWhere('order.orderStatus != :status', { status: '已退款' });

      if (startDate) {
        orderQuery.andWhere('order.paymentTime >= :startDate', { startDate });
      }
      if (endDate) {
        orderQuery.andWhere('order.paymentTime <= :endDate', { endDate });
      }

      const orderStats = await orderQuery
        .select('COUNT(*)', 'count')
        .addSelect('SUM(order.paymentAmount)', 'totalAmount')
        .getRawOne();

      // 客户统计
      const customerQuery = this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.salesId IN (:...memberIds)', { memberIds });

      if (startDate) {
        customerQuery.andWhere('customer.createTime >= :startDate', { startDate });
      }
      if (endDate) {
        customerQuery.andWhere('customer.createTime <= :endDate', { endDate });
      }

      const customerCount = await customerQuery.getCount();

      const totalAmount = parseFloat(orderStats.totalAmount || '0');
      const orderCount = parseInt(orderStats.count || '0', 10);

      performanceList.push({
        campusId: campus.campusId,
        campusName: campus.campusName,
        memberCount,
        totalAmount,
        orderCount,
        customerCount,
        avgAmountPerMember: memberCount > 0 ? totalAmount / memberCount : 0,
      });
    }

    // 按总销售额排序
    performanceList.sort((a, b) => b.totalAmount - a.totalAmount);

    return performanceList;
  }
}
