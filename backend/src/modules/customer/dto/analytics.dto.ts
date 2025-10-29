import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

// 销售漏斗数据DTO
export class SalesFunnelDto {
  stage: string; // 生命周期阶段
  count: number; // 当前阶段客户数
  percentage: number; // 占总数百分比
  conversionRate?: number; // 从上一阶段的转化率
  avgDays?: number; // 平均停留天数
}

// 销售漏斗查询参数
export class FunnelQueryDto {
  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '销售人员ID' })
  @IsOptional()
  salesId?: number;
}

// 客户来源分析DTO
export class CustomerSourceDto {
  source: string; // 客户来源
  count: number; // 客户数量
  percentage: number; // 占比
  conversionRate: number; // 成交转化率
}

// 转化率趋势DTO
export class ConversionTrendDto {
  date: string; // 日期
  fromStage: string; // 起始阶段
  toStage: string; // 目标阶段
  count: number; // 转化数量
  rate: number; // 转化率
}

// 客户价值分析DTO
export class CustomerValueDto {
  customerId: number;
  customerName: string;
  totalAmount: number; // 总消费金额
  orderCount: number; // 订单数
  avgOrderAmount: number; // 平均订单金额
  lifecycleStage: string;
  lastOrderDate: string;
  potentialValue: number; // 潜在价值（预测）
}

// 销售周期分析DTO
export class SalesCycleDto {
  fromStage: string;
  toStage: string;
  avgDays: number; // 平均天数
  minDays: number; // 最短天数
  maxDays: number; // 最长天数
  count: number; // 样本数量
}

// 收入预测DTO
export class RevenueForecastDto {
  period: string; // 时间段（月份）
  actual?: number; // 实际收入（历史数据）
  predicted: number; // 预测收入
  confidence: number; // 置信度（0-100）
  isHistorical: boolean; // 是否为历史数据
}

// 多维度转化率分析DTO
export class ConversionAnalysisDto {
  dimension: string; // 维度值（如：抖音、销售A、北京校区）
  dimensionType: string; // 维度类型（traffic_source、sales、campus）
  totalCustomers: number; // 总客户数
  convertedCustomers: number; // 已转化客户数
  conversionRate: number; // 转化率
  avgDays: number; // 平均转化天数
  totalRevenue: number; // 总收入
  avgRevenuePerCustomer: number; // 人均收入
}
