import request from '@/utils/request'

export interface DashboardOverview {
  customer: {
    total: number
    byIntent: Array<{ intent: string; count: number }>
  }
  order: {
    total: number
    newStudent: number
    oldStudent: number
    byStatus: Array<{ status: string; count: number }>
  }
  revenue: {
    total: number
    thisMonth: number
  }
  today: {
    newCustomers: number
    newOrders: number
    revenue: number
    followRecords: number
  }
}

export interface WeeklyTrend {
  date: string
  revenue: number
  count: number
}

export interface ComparisonData {
  customers: {
    thisMonth: number
    lastMonth: number
    growth: number
  }
  orders: {
    thisMonth: number
    lastMonth: number
    growth: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    growth: number
  }
}

// 获取管理看板概览
export const getDashboardOverview = () => {
  return request<DashboardOverview>({
    url: '/dashboard/overview',
    method: 'get',
  })
}

// 获取近7天数据趋势
export const getWeeklyTrend = () => {
  return request<WeeklyTrend[]>({
    url: '/dashboard/weekly-trend',
    method: 'get',
  })
}

// 获取环比数据（本月 vs 上月）
export const getComparisonData = () => {
  return request<ComparisonData>({
    url: '/dashboard/comparison',
    method: 'get',
  })
}
