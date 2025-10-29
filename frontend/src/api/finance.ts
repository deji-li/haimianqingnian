import request from '@/utils/request'

export interface FinanceOverview {
  totalRevenue: number
  totalOrders: number
  refundCount: number
  refundAmount: number
  newStudentRevenue: number
  oldStudentRevenue: number
  avgOrderAmount: number
}

export interface RevenueTrend {
  date: string
  revenue: number
  count: number
}

export interface SalesRanking {
  rank: number
  salesId: number
  salesName: string
  totalRevenue: number
  orderCount: number
}

export interface CampusRevenue {
  campusId: number
  campusName: string
  revenue: number
  orderCount: number
}

export interface CourseRevenue {
  courseName: string
  revenue: number
  orderCount: number
}

// 获取财务概览
export const getFinanceOverview = (startDate?: string, endDate?: string) => {
  return request<FinanceOverview>({
    url: '/finance/overview',
    method: 'get',
    params: { startDate, endDate },
  })
}

// 获取销售额趋势
export const getRevenueTrend = (
  type: 'day' | 'month',
  startDate?: string,
  endDate?: string,
) => {
  return request<RevenueTrend[]>({
    url: '/finance/revenue-trend',
    method: 'get',
    params: { type, startDate, endDate },
  })
}

// 获取销售排行榜
export const getSalesRanking = (startDate?: string, endDate?: string) => {
  return request<SalesRanking[]>({
    url: '/finance/sales-ranking',
    method: 'get',
    params: { startDate, endDate },
  })
}

// 获取校区销售额统计
export const getCampusRevenue = (startDate?: string, endDate?: string) => {
  return request<CampusRevenue[]>({
    url: '/finance/campus-revenue',
    method: 'get',
    params: { startDate, endDate },
  })
}

// 获取课程销售额统计
export const getCourseRevenue = (startDate?: string, endDate?: string) => {
  return request<CourseRevenue[]>({
    url: '/finance/course-revenue',
    method: 'get',
    params: { startDate, endDate },
  })
}
