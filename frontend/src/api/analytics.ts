import request from '@/utils/request'

export interface SalesFunnelData {
  stage: string
  count: number
  percentage: number
  conversionRate?: number
  avgDays?: number
}

export interface CustomerSourceData {
  source: string
  count: number
  percentage: number
  conversionRate: number
}

export interface SalesCycleData {
  fromStage: string
  toStage: string
  avgDays: number
  minDays: number
  maxDays: number
  count: number
}

export interface CustomerValueData {
  customerId: number
  customerName: string
  totalAmount: number
  orderCount: number
  avgOrderAmount: number
  lifecycleStage: string
  lastOrderDate: string
  potentialValue: number
}

export interface ConversionTrendData {
  date: string
  fromStage: string
  toStage: string
  count: number
  rate: number
}

export interface AnalyticsQueryParams {
  startDate?: string
  endDate?: string
  salesId?: number
}

// 获取销售漏斗数据
export const getSalesFunnel = (params?: AnalyticsQueryParams) => {
  return request<SalesFunnelData[]>({
    url: '/analytics/sales-funnel',
    method: 'get',
    params,
  })
}

// 获取客户来源分析
export const getCustomerSource = (params?: AnalyticsQueryParams) => {
  return request<CustomerSourceData[]>({
    url: '/analytics/customer-source',
    method: 'get',
    params,
  })
}

// 获取销售周期分析
export const getSalesCycle = (params?: AnalyticsQueryParams) => {
  return request<SalesCycleData[]>({
    url: '/analytics/sales-cycle',
    method: 'get',
    params,
  })
}

// 获取高价值客户列表
export const getHighValueCustomers = (limit: number = 20) => {
  return request<CustomerValueData[]>({
    url: '/analytics/high-value-customers',
    method: 'get',
    params: { limit },
  })
}

// 获取转化率趋势
export const getConversionTrend = (fromStage: string, toStage: string, months: number = 12) => {
  return request<ConversionTrendData[]>({
    url: '/analytics/conversion-trend',
    method: 'get',
    params: { fromStage, toStage, months },
  })
}

// 收入预测数据接口
export interface RevenueForecastData {
  period: string
  actual?: number
  predicted: number
  confidence: number
  isHistorical: boolean
}

// 多维度转化率分析接口
export interface ConversionAnalysisData {
  dimension: string
  dimensionType: string
  totalCustomers: number
  convertedCustomers: number
  conversionRate: number
  avgDays: number
  totalRevenue: number
  avgRevenuePerCustomer: number
}

// 获取收入预测
export const getRevenueForecast = (months: number = 3) => {
  return request<RevenueForecastData[]>({
    url: '/analytics/revenue-forecast',
    method: 'get',
    params: { months },
  })
}

// 获取多维度转化率分析
export const getConversionAnalysis = (
  dimension: 'traffic_source' | 'sales' | 'campus',
) => {
  return request<ConversionAnalysisData[]>({
    url: '/analytics/conversion-analysis',
    method: 'get',
    params: { dimension },
  })
}

// 个人统计数据接口
export interface PersonalStatsData {
  summary: {
    totalCustomers: number
    thisMonthCustomers: number
    totalOrders: number
    thisMonthOrders: number
    totalRevenue: number
    thisMonthRevenue: number
    avgOrderAmount: number
    conversionRate: number
  }
  stageStats: {
    线索: number
    意向客户: number
    商机: number
    成交客户: number
    复购客户: number
  }
  conversionTrend: Array<{
    date: string
    newCustomers: number
    converted: number
    conversionRate: number
  }>
  sourceDistribution: Array<{
    source: string
    count: number
    percentage: number
  }>
  aiUsage: {
    analysisCount: number
    trainingCount: number
  }
}

// 获取个人统计数据
export const getPersonalStats = () => {
  return request<PersonalStatsData>({
    url: '/analytics/personal-stats',
    method: 'get',
  })
}
