import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerLifecycle } from './entities/customer-lifecycle.entity';
import { Order } from '../order/entities/order.entity';
import {
  SalesFunnelDto,
  FunnelQueryDto,
  CustomerSourceDto,
  ConversionTrendDto,
  SalesCycleDto,
  CustomerValueDto,
  RevenueForecastDto,
  ConversionAnalysisDto,
} from './dto/analytics.dto';

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

  /**
   * 获取销售漏斗数据
   */
  async getSalesFunnel(query: FunnelQueryDto): Promise<SalesFunnelDto[]> {
    const { startDate, endDate, salesId } = query;

    // 定义漏斗阶段顺序
    const stageOrder = ['线索', '意向客户', '商机', '成交客户', '复购客户'];

    let queryBuilder = this.customerRepository.createQueryBuilder('customer');

    // 添加筛选条件
    if (startDate) {
      queryBuilder = queryBuilder.andWhere('customer.create_time >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder = queryBuilder.andWhere('customer.create_time <= :endDate', {
        endDate,
      });
    }
    if (salesId) {
      queryBuilder = queryBuilder.andWhere('customer.sales_id = :salesId', {
        salesId,
      });
    }

    // 按生命周期阶段分组统计
    const stageCounts = await queryBuilder
      .select('customer.lifecycle_stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .groupBy('customer.lifecycle_stage')
      .getRawMany();

    // 计算总数
    const totalCount = stageCounts.reduce((sum, item) => sum + Number(item.count), 0);

    // 构建漏斗数据
    const funnelData: SalesFunnelDto[] = [];
    let previousCount = 0;

    for (const stage of stageOrder) {
      const stageData = stageCounts.find((s) => s.stage === stage);
      const count = stageData ? Number(stageData.count) : 0;
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

      // 计算转化率（从上一阶段到当前阶段）
      let conversionRate = 0;
      if (previousCount > 0) {
        conversionRate = (count / previousCount) * 100;
      } else if (funnelData.length === 0) {
        // 第一阶段，转化率为100%
        conversionRate = 100;
      }

      // 计算平均停留天数
      const avgDays = await this.getAvgStayDays(stage, query);

      funnelData.push({
        stage,
        count,
        percentage: Math.round(percentage * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgDays,
      });

      previousCount = count;
    }

    return funnelData;
  }

  /**
   * 计算某阶段的平均停留天数
   */
  private async getAvgStayDays(
    stage: string,
    query: FunnelQueryDto,
  ): Promise<number> {
    const { startDate, endDate, salesId } = query;

    let queryBuilder = this.lifecycleRepository
      .createQueryBuilder('lc1')
      .leftJoin(
        CustomerLifecycle,
        'lc2',
        'lc1.customer_id = lc2.customer_id AND lc2.create_time > lc1.create_time',
      )
      .where('lc1.stage = :stage', { stage })
      .select(
        'AVG(DATEDIFF(COALESCE(lc2.create_time, NOW()), lc1.create_time))',
        'avgDays',
      );

    if (startDate) {
      queryBuilder = queryBuilder.andWhere('lc1.create_time >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder = queryBuilder.andWhere('lc1.create_time <= :endDate', {
        endDate,
      });
    }
    if (salesId) {
      queryBuilder = queryBuilder.andWhere(
        'lc1.customer_id IN (SELECT id FROM customers WHERE sales_id = :salesId)',
        { salesId },
      );
    }

    const result = await queryBuilder.getRawOne();
    return result?.avgDays ? Math.round(Number(result.avgDays)) : 0;
  }

  /**
   * 获取客户来源分析
   */
  async getCustomerSource(query: FunnelQueryDto): Promise<CustomerSourceDto[]> {
    const { startDate, endDate, salesId } = query;

    let queryBuilder = this.customerRepository.createQueryBuilder('customer');

    if (startDate) {
      queryBuilder = queryBuilder.andWhere('customer.create_time >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder = queryBuilder.andWhere('customer.create_time <= :endDate', {
        endDate,
      });
    }
    if (salesId) {
      queryBuilder = queryBuilder.andWhere('customer.sales_id = :salesId', {
        salesId,
      });
    }

    const sourceCounts = await queryBuilder
      .select('customer.traffic_source', 'source')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        'SUM(CASE WHEN customer.lifecycle_stage IN ("成交客户", "复购客户") THEN 1 ELSE 0 END)',
        'converted',
      )
      .groupBy('customer.traffic_source')
      .getRawMany();

    const totalCount = sourceCounts.reduce((sum, item) => sum + Number(item.total), 0);

    return sourceCounts.map((item) => ({
      source: item.source || '未知',
      count: Number(item.total),
      percentage: totalCount > 0 ? (Number(item.total) / totalCount) * 100 : 0,
      conversionRate:
        Number(item.total) > 0 ? (Number(item.converted) / Number(item.total)) * 100 : 0,
    }));
  }

  /**
   * 获取销售周期分析
   */
  async getSalesCycle(query: FunnelQueryDto): Promise<SalesCycleDto[]> {
    const { startDate, endDate, salesId } = query;

    // 查询所有相邻阶段的转换记录
    let queryBuilder = this.lifecycleRepository
      .createQueryBuilder('lc1')
      .innerJoin(
        CustomerLifecycle,
        'lc2',
        `lc1.customer_id = lc2.customer_id
         AND lc2.id = (
           SELECT MIN(id)
           FROM customer_lifecycle
           WHERE customer_id = lc1.customer_id
           AND id > lc1.id
         )`,
      )
      .select('lc1.stage', 'fromStage')
      .addSelect('lc2.stage', 'toStage')
      .addSelect('AVG(DATEDIFF(lc2.create_time, lc1.create_time))', 'avgDays')
      .addSelect('MIN(DATEDIFF(lc2.create_time, lc1.create_time))', 'minDays')
      .addSelect('MAX(DATEDIFF(lc2.create_time, lc1.create_time))', 'maxDays')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lc1.stage, lc2.stage');

    if (startDate) {
      queryBuilder = queryBuilder.andWhere('lc1.create_time >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder = queryBuilder.andWhere('lc1.create_time <= :endDate', {
        endDate,
      });
    }
    if (salesId) {
      queryBuilder = queryBuilder.andWhere(
        'lc1.customer_id IN (SELECT id FROM customers WHERE sales_id = :salesId)',
        { salesId },
      );
    }

    const results = await queryBuilder.getRawMany();

    return results.map((item) => ({
      fromStage: item.fromStage,
      toStage: item.toStage,
      avgDays: Math.round(Number(item.avgDays)),
      minDays: Number(item.minDays),
      maxDays: Number(item.maxDays),
      count: Number(item.count),
    }));
  }

  /**
   * 获取高价值客户列表
   */
  async getHighValueCustomers(limit: number = 20): Promise<CustomerValueDto[]> {
    const results = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('orders', 'order', 'customer.id = order.customer_id')
      .select('customer.id', 'customerId')
      .addSelect('customer.real_name', 'customerName')
      .addSelect('customer.lifecycle_stage', 'lifecycleStage')
      .addSelect('COALESCE(SUM(order.payment_amount), 0)', 'totalAmount')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('COALESCE(AVG(order.payment_amount), 0)', 'avgOrderAmount')
      .addSelect('MAX(order.payment_time)', 'lastOrderDate')
      .groupBy('customer.id')
      .orderBy('totalAmount', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((item) => ({
      customerId: item.customerId,
      customerName: item.customerName || '未知',
      totalAmount: Number(item.totalAmount),
      orderCount: Number(item.orderCount),
      avgOrderAmount: Number(item.avgOrderAmount),
      lifecycleStage: item.lifecycleStage,
      lastOrderDate: item.lastOrderDate,
      potentialValue: this.calculatePotentialValue(item),
    }));
  }

  /**
   * 计算客户潜在价值（简单预测模型）
   */
  private calculatePotentialValue(customer: any): number {
    const { totalAmount, orderCount, lifecycleStage } = customer;

    // 基础价值：历史消费金额
    let value = Number(totalAmount);

    // 根据订单频次调整
    if (orderCount > 5) {
      value *= 1.5; // 高频客户
    } else if (orderCount > 2) {
      value *= 1.2; // 中频客户
    }

    // 根据生命周期阶段调整
    if (lifecycleStage === '复购客户') {
      value *= 2; // 复购客户潜力大
    } else if (lifecycleStage === '成交客户') {
      value *= 1.5;
    } else if (lifecycleStage === '商机') {
      value *= 0.5; // 还未成交，折减
    }

    return Math.round(value);
  }

  /**
   * 获取转化率趋势（按月）
   */
  async getConversionTrend(
    fromStage: string,
    toStage: string,
    months: number = 12,
  ): Promise<ConversionTrendDto[]> {
    const results = await this.lifecycleRepository.query(
      `
      SELECT
        DATE_FORMAT(lc1.create_time, '%Y-%m') as month,
        COUNT(DISTINCT lc1.customer_id) as fromCount,
        COUNT(DISTINCT lc2.customer_id) as toCount
      FROM customer_lifecycle lc1
      LEFT JOIN customer_lifecycle lc2
        ON lc1.customer_id = lc2.customer_id
        AND lc2.stage = ?
        AND lc2.create_time > lc1.create_time
      WHERE lc1.stage = ?
        AND lc1.create_time >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY month
      ORDER BY month DESC
    `,
      [toStage, fromStage, months],
    );

    return results.map((item: any) => ({
      date: item.month,
      fromStage,
      toStage,
      count: Number(item.toCount),
      rate:
        Number(item.fromCount) > 0
          ? (Number(item.toCount) / Number(item.fromCount)) * 100
          : 0,
    }));
  }

  /**
   * 收入预测（简单线性回归）
   * @param months 预测未来几个月，默认3个月
   */
  async getRevenueForecast(months: number = 3): Promise<RevenueForecastDto[]> {
    // 获取过去12个月的实际收入数据
    const historicalData = await this.orderRepository.query(
      `
      SELECT
        DATE_FORMAT(payment_time, '%Y-%m') as period,
        SUM(payment_amount) as revenue
      FROM orders
      WHERE payment_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND order_status != '已退款'
      GROUP BY period
      ORDER BY period ASC
    `,
    );

    // 线性回归计算
    const n = historicalData.length;
    if (n < 3) {
      // 数据不足，返回简单预测
      return [];
    }

    // 将数据转换为数值数组
    const revenues = historicalData.map((d: any) => parseFloat(d.revenue));

    // 计算线性回归参数
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += revenues[i];
      sumXY += i * revenues[i];
      sumX2 += i * i;
    }

    // 计算斜率和截距
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 计算R²（决定系数）来评估置信度
    const meanY = sumY / n;
    let ss_tot = 0;
    let ss_res = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * i + intercept;
      ss_tot += Math.pow(revenues[i] - meanY, 2);
      ss_res += Math.pow(revenues[i] - predicted, 2);
    }

    const r2 = 1 - ss_res / ss_tot;
    const confidence = Math.max(0, Math.min(100, r2 * 100)); // 转换为0-100的置信度

    // 构建结果数组
    const results: RevenueForecastDto[] = [];

    // 添加历史数据
    historicalData.forEach((item: any, index: number) => {
      results.push({
        period: item.period,
        actual: parseFloat(item.revenue),
        predicted: slope * index + intercept,
        confidence,
        isHistorical: true,
      });
    });

    // 生成未来预测
    const lastPeriod = new Date(historicalData[n - 1].period + '-01');
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(lastPeriod);
      futureDate.setMonth(futureDate.getMonth() + i);
      const period = futureDate.toISOString().substring(0, 7);

      const predictedRevenue = slope * (n + i - 1) + intercept;

      results.push({
        period,
        predicted: Math.max(0, predictedRevenue), // 确保不是负数
        confidence,
        isHistorical: false,
      });
    }

    return results;
  }

  /**
   * 多维度转化率分析
   * @param dimension 维度类型：traffic_source | sales | campus
   */
  async getConversionAnalysis(
    dimension: 'traffic_source' | 'sales' | 'campus',
  ): Promise<ConversionAnalysisDto[]> {
    let query = '';

    switch (dimension) {
      case 'traffic_source':
        query = `
          SELECT
            c.traffic_source as dimension,
            'traffic_source' as dimensionType,
            COUNT(DISTINCT c.id) as totalCustomers,
            COUNT(DISTINCT CASE WHEN lc.stage IN ('成交客户', '复购客户') THEN c.id END) as convertedCustomers,
            AVG(DATEDIFF(
              (SELECT MIN(lc2.create_time) FROM customer_lifecycle lc2 WHERE lc2.customer_id = c.id AND lc2.stage IN ('成交客户', '复购客户')),
              c.create_time
            )) as avgDays,
            COALESCE(SUM(o.payment_amount), 0) as totalRevenue
          FROM customers c
          LEFT JOIN customer_lifecycle lc ON c.id = lc.customer_id
          LEFT JOIN orders o ON c.id = o.customer_id AND o.order_status != '已退款'
          GROUP BY c.traffic_source
          HAVING c.traffic_source IS NOT NULL
        `;
        break;

      case 'sales':
        query = `
          SELECT
            CONCAT(u.real_name, '(', u.username, ')') as dimension,
            'sales' as dimensionType,
            COUNT(DISTINCT c.id) as totalCustomers,
            COUNT(DISTINCT CASE WHEN lc.stage IN ('成交客户', '复购客户') THEN c.id END) as convertedCustomers,
            AVG(DATEDIFF(
              (SELECT MIN(lc2.create_time) FROM customer_lifecycle lc2 WHERE lc2.customer_id = c.id AND lc2.stage IN ('成交客户', '复购客户')),
              c.create_time
            )) as avgDays,
            COALESCE(SUM(o.payment_amount), 0) as totalRevenue
          FROM customers c
          LEFT JOIN users u ON c.sales_id = u.id
          LEFT JOIN customer_lifecycle lc ON c.id = lc.customer_id
          LEFT JOIN orders o ON c.id = o.customer_id AND o.order_status != '已退款'
          WHERE c.sales_id IS NOT NULL
          GROUP BY c.sales_id, u.real_name, u.username
        `;
        break;

      case 'campus':
        query = `
          SELECT
            campus.name as dimension,
            'campus' as dimensionType,
            COUNT(DISTINCT c.id) as totalCustomers,
            COUNT(DISTINCT CASE WHEN lc.stage IN ('成交客户', '复购客户') THEN c.id END) as convertedCustomers,
            AVG(DATEDIFF(
              (SELECT MIN(lc2.create_time) FROM customer_lifecycle lc2 WHERE lc2.customer_id = c.id AND lc2.stage IN ('成交客户', '复购客户')),
              c.create_time
            )) as avgDays,
            COALESCE(SUM(o.payment_amount), 0) as totalRevenue
          FROM customers c
          LEFT JOIN users u ON c.sales_id = u.id
          LEFT JOIN campus ON u.campus_id = campus.id
          LEFT JOIN customer_lifecycle lc ON c.id = lc.customer_id
          LEFT JOIN orders o ON c.id = o.customer_id AND o.order_status != '已退款'
          WHERE campus.id IS NOT NULL
          GROUP BY campus.id, campus.name
        `;
        break;
    }

    const results = await this.orderRepository.query(query);

    return results.map((item: any) => ({
      dimension: item.dimension,
      dimensionType: item.dimensionType,
      totalCustomers: Number(item.totalCustomers),
      convertedCustomers: Number(item.convertedCustomers),
      conversionRate:
        Number(item.totalCustomers) > 0
          ? (Number(item.convertedCustomers) / Number(item.totalCustomers)) * 100
          : 0,
      avgDays: item.avgDays ? Math.round(Number(item.avgDays)) : 0,
      totalRevenue: parseFloat(item.totalRevenue),
      avgRevenuePerCustomer:
        Number(item.totalCustomers) > 0
          ? parseFloat(item.totalRevenue) / Number(item.totalCustomers)
          : 0,
    }));
  }
}
