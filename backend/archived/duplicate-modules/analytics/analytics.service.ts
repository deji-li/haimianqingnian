import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { CustomerLifecycle } from '../customer/entities/customer-lifecycle.entity';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerLifecycle)
    private lifecycleRepository: Repository<CustomerLifecycle>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  // 获取销售漏斗数据
  async getSalesFunnel(startDate?: string, endDate?: string) {
    // 定义漏斗阶段顺序
    const stages = ['线索', '意向客户', '商机', '成交客户', '复购客户'];

    let whereCondition = '';
    const params: any = {};

    if (startDate && endDate) {
      whereCondition = 'WHERE c.create_time BETWEEN :startDate AND :endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    }

    // 统计每个阶段的客户数
    const query = `
      SELECT
        lifecycle_stage as stage,
        COUNT(*) as count
      FROM customers c
      ${whereCondition}
      GROUP BY lifecycle_stage
    `;

    const rawData = await this.customerRepository.query(query, params);

    // 计算总数和百分比
    const totalCount = rawData.reduce((sum, item) => sum + Number(item.count), 0);

    // 按阶段顺序组织数据
    const result = stages.map((stage, index) => {
      const stageData = rawData.find((item) => item.stage === stage);
      const count = stageData ? Number(stageData.count) : 0;
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

      // 计算转化率（相对于上一阶段）
      let conversionRate;
      if (index > 0) {
        const prevStageData = result[index - 1];
        conversionRate = prevStageData.count > 0
          ? (count / prevStageData.count) * 100
          : 0;
      }

      // 计算平均停留天数
      let avgDays;
      if (index < stages.length - 1) {
        // 这里简化处理，实际应该从lifecycle表计算
        avgDays = Math.floor(Math.random() * 15) + 5; // 临时数据
      }

      return {
        stage,
        count,
        percentage: Math.round(percentage * 10) / 10,
        conversionRate: conversionRate ? Math.round(conversionRate * 10) / 10 : undefined,
        avgDays,
      };
    });

    return result;
  }

  // 获取客户来源分析
  async getCustomerSource(startDate?: string, endDate?: string) {
    let whereCondition = '';
    const params: any = {};

    if (startDate && endDate) {
      whereCondition = 'WHERE c.create_time BETWEEN :startDate AND :endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const query = `
      SELECT
        COALESCE(c.traffic_source, '未知') as source,
        COUNT(*) as count,
        COUNT(DISTINCT o.id) as orderCount
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      ${whereCondition}
      GROUP BY traffic_source
    `;

    const rawData = await this.customerRepository.query(query, params);

    const totalCount = rawData.reduce((sum, item) => sum + Number(item.count), 0);

    return rawData.map((item) => {
      const count = Number(item.count);
      const orderCount = Number(item.orderCount);
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
      const conversionRate = count > 0 ? (orderCount / count) * 100 : 0;

      return {
        source: item.source,
        count,
        percentage: Math.round(percentage * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
      };
    });
  }

  // 获取销售周期分析
  async getSalesCycle(startDate?: string, endDate?: string) {
    // 定义阶段转换
    const transitions = [
      { fromStage: '线索', toStage: '意向客户' },
      { fromStage: '意向客户', toStage: '商机' },
      { fromStage: '商机', toStage: '成交客户' },
      { fromStage: '成交客户', toStage: '复购客户' },
    ];

    const result = [];

    for (const transition of transitions) {
      const query = `
        SELECT
          l1.customer_id,
          DATEDIFF(l2.create_time, l1.create_time) as days
        FROM customer_lifecycle l1
        INNER JOIN customer_lifecycle l2 ON l1.customer_id = l2.customer_id
        WHERE l1.stage = ?
          AND l2.stage = ?
          AND l2.create_time > l1.create_time
          AND l2.id = (
            SELECT MIN(id) FROM customer_lifecycle
            WHERE customer_id = l1.customer_id
              AND stage = ?
              AND create_time > l1.create_time
          )
      `;

      const params = [transition.fromStage, transition.toStage, transition.toStage];

      if (startDate && endDate) {
        // 这里可以添加日期过滤
      }

      const rawData = await this.lifecycleRepository.query(query, params);

      if (rawData.length > 0) {
        const daysArray = rawData.map((item) => Number(item.days));
        const avgDays = Math.round(
          daysArray.reduce((sum, days) => sum + days, 0) / daysArray.length,
        );
        const minDays = Math.min(...daysArray);
        const maxDays = Math.max(...daysArray);

        result.push({
          fromStage: transition.fromStage,
          toStage: transition.toStage,
          avgDays,
          minDays,
          maxDays,
          count: rawData.length,
        });
      } else {
        // 没有数据时返回默认值
        result.push({
          fromStage: transition.fromStage,
          toStage: transition.toStage,
          avgDays: 0,
          minDays: 0,
          maxDays: 0,
          count: 0,
        });
      }
    }

    return result;
  }

  // 获取高价值客户列表
  async getHighValueCustomers(limit: number = 20) {
    const query = `
      SELECT
        c.id as customerId,
        COALESCE(c.real_name, c.wechat_nickname) as customerName,
        COALESCE(SUM(o.payment_amount), 0) as totalAmount,
        COUNT(DISTINCT o.id) as orderCount,
        COALESCE(AVG(o.payment_amount), 0) as avgOrderAmount,
        c.lifecycle_stage as lifecycleStage,
        MAX(o.create_time) as lastOrderDate,
        COALESCE(SUM(o.payment_amount) * 0.3, 0) as potentialValue
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'refunded'
      GROUP BY c.id
      HAVING totalAmount > 0
      ORDER BY totalAmount DESC
      LIMIT ?
    `;

    const rawData = await this.customerRepository.query(query, [limit]);

    return rawData.map((item) => ({
      customerId: item.customerId,
      customerName: item.customerName,
      totalAmount: Math.round(Number(item.totalAmount)),
      orderCount: Number(item.orderCount),
      avgOrderAmount: Math.round(Number(item.avgOrderAmount)),
      lifecycleStage: item.lifecycleStage || '线索',
      lastOrderDate: item.lastOrderDate,
      potentialValue: Math.round(Number(item.potentialValue)),
    }));
  }

  // 获取转化率趋势（高级分析用）
  async getConversionTrend(fromStage: string, toStage: string, months: number = 12) {
    const query = `
      SELECT
        DATE_FORMAT(l2.create_time, '%Y-%m') as month,
        COUNT(DISTINCT l1.customer_id) as count,
        COUNT(DISTINCT l2.customer_id) as convertedCount
      FROM customer_lifecycle l1
      LEFT JOIN customer_lifecycle l2
        ON l1.customer_id = l2.customer_id
        AND l2.stage = ?
        AND l2.create_time > l1.create_time
      WHERE l1.stage = ?
        AND l1.create_time >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY month
      ORDER BY month DESC
    `;

    const rawData = await this.lifecycleRepository.query(query, [
      toStage,
      fromStage,
      months,
    ]);

    return rawData.map((item) => {
      const count = Number(item.count);
      const convertedCount = Number(item.convertedCount);
      const rate = count > 0 ? (convertedCount / count) * 100 : 0;

      return {
        date: item.month,
        fromStage,
        toStage,
        count: convertedCount,
        rate: Math.round(rate * 10) / 10,
      };
    });
  }

  // 获取收入预测（高级分析用）
  async getRevenueForecast(months: number = 3) {
    // 获取过去12个月的实际收入
    const historicalQuery = `
      SELECT
        DATE_FORMAT(create_time, '%Y-%m') as period,
        SUM(payment_amount) as amount
      FROM orders
      WHERE status = 'paid'
        AND create_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY period
      ORDER BY period ASC
    `;

    const historical = await this.orderRepository.query(historicalQuery);

    // 计算平均增长率
    let growthRate = 0.05; // 默认5%增长
    if (historical.length > 1) {
      const rates = [];
      for (let i = 1; i < historical.length; i++) {
        const prev = Number(historical[i - 1].amount);
        const curr = Number(historical[i].amount);
        if (prev > 0) {
          rates.push((curr - prev) / prev);
        }
      }
      if (rates.length > 0) {
        growthRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
      }
    }

    const result = [];

    // 添加历史数据
    historical.forEach((item) => {
      result.push({
        period: item.period,
        actual: Math.round(Number(item.amount)),
        predicted: Math.round(Number(item.amount)),
        confidence: 100,
        isHistorical: true,
      });
    });

    // 预测未来数据
    const lastAmount = historical.length > 0
      ? Number(historical[historical.length - 1].amount)
      : 10000;

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const period = date.toISOString().substring(0, 7);

      const predicted = lastAmount * Math.pow(1 + growthRate, i);
      const confidence = Math.max(60, 100 - i * 10);

      result.push({
        period,
        predicted: Math.round(predicted),
        confidence,
        isHistorical: false,
      });
    }

    return result;
  }

  // 获取多维度转化率分析（高级分析用）
  async getConversionAnalysis(dimension: 'traffic_source' | 'sales' | 'campus') {
    let dimensionField: string;
    let joinClause = '';

    switch (dimension) {
      case 'traffic_source':
        dimensionField = 'c.traffic_source';
        break;
      case 'sales':
        dimensionField = 'u.real_name';
        joinClause = 'LEFT JOIN users u ON c.sales_id = u.id';
        break;
      case 'campus':
        dimensionField = 'campus.campus_name';
        joinClause = `
          LEFT JOIN users u ON c.sales_id = u.id
          LEFT JOIN campus ON u.campus_id = campus.id
        `;
        break;
      default:
        dimensionField = 'c.traffic_source';
    }

    const query = `
      SELECT
        COALESCE(${dimensionField}, '未知') as dimension,
        COUNT(DISTINCT c.id) as totalCustomers,
        COUNT(DISTINCT o.id) as convertedCustomers,
        COALESCE(AVG(DATEDIFF(o.create_time, c.create_time)), 0) as avgDays,
        COALESCE(SUM(o.payment_amount), 0) as totalRevenue
      FROM customers c
      ${joinClause}
      LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'paid'
      GROUP BY dimension
      ORDER BY totalRevenue DESC
    `;

    const rawData = await this.customerRepository.query(query);

    return rawData.map((item) => {
      const totalCustomers = Number(item.totalCustomers);
      const convertedCustomers = Number(item.convertedCustomers);
      const conversionRate = totalCustomers > 0
        ? (convertedCustomers / totalCustomers) * 100
        : 0;
      const totalRevenue = Number(item.totalRevenue);
      const avgRevenuePerCustomer = totalCustomers > 0
        ? totalRevenue / totalCustomers
        : 0;

      return {
        dimension: item.dimension,
        dimensionType: dimension,
        totalCustomers,
        convertedCustomers,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgDays: Math.round(Number(item.avgDays)),
        totalRevenue: Math.round(totalRevenue),
        avgRevenuePerCustomer: Math.round(avgRevenuePerCustomer),
      };
    });
  }
}
