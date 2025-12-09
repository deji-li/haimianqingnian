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

export interface TeamPerformance {
  teamRanking: Array<{
    id: number
    name: string
    role: string
    department: string
    totalRevenue: number
    newCustomers: number
    orders: number
    completionRate: number
    avatar?: string
  }>
  campusRanking: Array<{
    id: number
    name: string
    totalRevenue: number
    newCustomers: number
    orders: number
    targetCompletion: number
    growth: number
  }>
  courseRanking: Array<{
    courseId: number
    courseName: string
    category: string
    totalRevenue: number
    enrollmentCount: number
    averagePrice: number
    growth: number
  }>
}

export interface MonthlyStats {
  currentMonth: {
    customers: number
    orders: number
    revenue: number
    followRecords: number
    conversionRate: number
  }
  trend: Array<{
    date: string
    customers: number
    orders: number
    revenue: number
  }>
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

// 获取团队业绩数据
export const getTeamPerformance = () => {
  return request<TeamPerformance>({
    url: '/dashboard/team-performance',
    method: 'get',
  })
}

// 获取个人月度统计数据
export const getMonthlyStats = (userId?: number) => {
  return request<MonthlyStats>({
    url: `/dashboard/monthly-stats${userId ? `?userId=${userId}` : ''}`,
    method: 'get',
  })
}

// 获取实时数据更新
export const getRealtimeData = () => {
  return request({
    url: '/dashboard/realtime',
    method: 'get',
  })
}
