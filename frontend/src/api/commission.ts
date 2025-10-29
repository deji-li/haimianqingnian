import request from '@/utils/request'

// 类型定义
export interface Commission {
  id: number
  orderId: number
  orderNo: string
  salesId: number
  salesName: string
  schemeId: number
  schemeName: string
  orderAmount: number
  commissionAmount: number
  status: 'pending' | 'paid' | 'cancelled'
  settleTime?: string
  remark?: string
  createTime: string
  updateTime: string
}

export interface CommissionStatistics {
  pending: { amount: number; count: number }
  paid: { amount: number; count: number }
  cancelled: { amount: number; count: number }
  total: { amount: number; count: number }
}

export interface UserCommissionSummary {
  userId: number
  userName: string
  orderCount: number
  totalAmount: number
  commissionAmount: number
  averageCommission: number
}

export interface MonthCommissionSummary {
  month: string
  orderCount: number
  totalAmount: number
  commissionAmount: number
}

// 提成方案相关
export const getSchemes = (params?: { includeDisabled?: boolean }) =>
  request.get('/commission/schemes', { params })

export const getSchemeById = (id: number) =>
  request.get(`/commission/schemes/${id}`)

export const createScheme = (data: any) =>
  request.post('/commission/schemes', data)

export const updateScheme = (id: number, data: any) =>
  request.put(`/commission/schemes/${id}`, data)

export const deleteScheme = (id: number) =>
  request.delete(`/commission/schemes/${id}`)

export const previewCommission = (params: {
  orderAmount: number
  orderTag?: string
  courseName?: string
}) => request.get('/commission/preview', { params })

export const calculateCommission = (orderId: number) =>
  request.post(`/commission/calculate/${orderId}`)

// 提成记录相关
export const getCommissionList = (params: {
  page?: number
  pageSize?: number
  status?: string
  salesId?: number
  startDate?: string
  endDate?: string
}) => request.get('/commission/list', { params })

export const updateCommission = (id: number, data: any) =>
  request.put(`/commission/${id}`, data)

export const batchSettleCommission = (ids: number[]) =>
  request.post('/commission/batch-settle', { ids })

// 统计相关
export const getCommissionStatistics = (params?: {
  salesId?: number
  startDate?: string
  endDate?: string
}) => request.get('/commission/statistics', { params })

export const getCommissionSummaryByUser = (params?: {
  startDate?: string
  endDate?: string
}) => request.get('/commission/summary/user', { params })

export const getCommissionSummaryByMonth = (params?: {
  startDate?: string
  endDate?: string
}) => request.get('/commission/summary/month', { params })
