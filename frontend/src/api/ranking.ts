import request from '@/utils/request'

// 校区排行榜参数
export interface CampusRankingParams {
  type: 'revenue' | 'orderCount' | 'studentCount'
  timeRange: 'day' | 'week' | 'month' | 'year' | 'custom'
  startDate?: string
  endDate?: string
  limit?: number
}

// 老师排行榜参数
export interface TeacherRankingParams {
  type: 'commission' | 'orderCount' | 'studentCount'
  timeRange: 'day' | 'week' | 'month' | 'year' | 'custom'
  startDate?: string
  endDate?: string
  campusId?: number
  limit?: number
}

// 销售排行榜参数
export interface SalesRankingParams {
  timeRange?: string
  startDate?: string
  endDate?: string
  departmentId?: number
  campusId?: number
  limit?: number
}

// 订单排行榜参数
export interface OrderRankingParams {
  type: 'amount' | 'count'
  timeRange: 'day' | 'week' | 'month' | 'year' | 'custom'
  startDate?: string
  endDate?: string
  campusId?: number
  salesId?: number
  limit?: number
}

// 排行榜概览参数
export interface RankingOverviewParams {
  timeRange: 'day' | 'week' | 'month' | 'year' | 'custom'
  startDate?: string
  endDate?: string
}

// 校区排行榜数据
export interface CampusRankingItem {
  rank: number
  campusId: number
  campusName: string
  totalRevenue: number
  orderCount: number
  studentCount: number
  avgOrderAmount: number
}

// 老师排行榜数据
export interface TeacherRankingItem {
  rank: number
  teacherId: number
  teacherName: string
  campusId?: number
  campusName?: string
  commission: number
  orderCount: number
  studentCount: number
  avgCommission: number
}

// 销售排行榜数据
export interface SalesRankingItem {
  rank: number
  salesId: number
  salesName: string
  realName?: string
  departmentId?: number
  departmentName?: string
  campusId?: number
  campusName?: string
  totalRevenue: number
  orderCount: number
  customerCount: number
  avgOrderAmount: number
}

// 订单排行榜数据
export interface OrderRankingItem {
  rank: number
  orderNo: string
  customerId: number
  customerName: string
  campusId?: number
  campusName?: string
  salesId?: number
  salesName?: string
  teacherId?: number
  teacherName?: string
  paymentAmount: number
  teacherCommission: number
  paymentTime: string
  orderStatus: string
}

// 排行榜概览数据
export interface RankingOverviewData {
  campusRanking: CampusRankingItem[]
  teacherRanking: TeacherRankingItem[]
  salesRanking: SalesRankingItem[]
  orderRanking: OrderRankingItem[]
  summary: {
    totalCampusRevenue: number
    totalTeacherCommission: number
    totalSalesRevenue: number
    totalOrderCount: number
    campusCount: number
    teacherCount: number
    salesCount: number
    orderCompletionRate: number
  }
}

/**
 * 获取校区排行榜
 */
export const campusRankingApi = (params: CampusRankingParams) => {
  return request({
    url: '/ranking/campus',
    method: 'GET',
    params
  })
}

/**
 * 获取老师排行榜
 */
export const teacherRankingApi = (params: TeacherRankingParams) => {
  return request({
    url: '/ranking/teacher',
    method: 'GET',
    params
  })
}

/**
 * 获取销售排行榜
 */
export const salesRankingApi = (params: SalesRankingParams = {}) => {
  return request({
    url: '/ranking/sales',
    method: 'GET',
    params
  })
}

/**
 * 获取订单排行榜
 */
export const orderRankingApi = (params: OrderRankingParams) => {
  return request({
    url: '/ranking/order',
    method: 'GET',
    params
  })
}

/**
 * 获取排行榜总览
 */
export const rankingOverviewApi = (params: RankingOverviewParams) => {
  return request({
    url: '/ranking/overview',
    method: 'GET',
    params
  })
}

/**
 * 排行榜健康检查
 */
export const rankingHealthApi = () => {
  return request({
    url: '/ranking/health',
    method: 'GET'
  })
}

/**
 * 获取老师排行榜统计信息
 */
export const getTeacherRankingStats = (params: TeacherRankingParams) => {
  return request({
    url: '/ranking/teacher/stats',
    method: 'GET',
    params
  })
}

/**
 * 获取校区排行榜统计信息
 */
export const getCampusRankingStats = (params: CampusRankingParams) => {
  return request({
    url: '/ranking/campus/stats',
    method: 'GET',
    params
  })
}

/**
 * 获取销售排行榜统计信息
 */
export const getSalesRankingStats = (params: SalesRankingParams) => {
  return request({
    url: '/ranking/sales/stats',
    method: 'GET',
    params
  })
}

/**
 * 导出排行榜数据
 */
export const exportRankingData = (type: 'campus' | 'teacher' | 'sales' | 'order', params: any) => {
  return request({
    url: `/ranking/${type}/export`,
    method: 'GET',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取排行榜趋势数据
 */
export const getRankingTrend = (type: 'campus' | 'teacher' | 'sales', params: {
  timeRange: 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
}) => {
  return request({
    url: `/ranking/${type}/trend`,
    method: 'GET',
    params
  })
}