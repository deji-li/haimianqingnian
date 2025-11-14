import request from '@/utils/request'

// 运营账号
export interface OperationAccount {
  id: number
  accountName: string
  platformType: string
  city: string
  status: string
  operatorId: number
  operatorName?: string
}

// 运营日报
export interface OperationDailyReport {
  id: number
  reportDate: string
  accountId: number
  operatorId: number
  updateCount: number
  contentTags: string
  viewMin: number
  viewMax: number
  playMin: number
  playMax: number
  commentMin: number
  commentMax: number
  messageMin: number
  messageMax: number
  accountStatusChanged: number
  newStatus: string | null
  remark: string | null
  accountName?: string
  operatorName?: string
  platformType?: string
  city?: string
}

// 日报查询参数
export interface DailyReportQuery {
  reportDate?: string
  startDate?: string
  endDate?: string
  operatorId?: number
  accountId?: number
  page?: number
  pageSize?: number
}

// 创建日报DTO
export interface CreateDailyReportDto {
  reportDate: string
  accountId: number
  operatorId?: number
  updateCount: number
  contentTags?: string
  viewMin: number
  viewMax: number
  playMin: number
  playMax: number
  commentMin: number
  commentMax: number
  messageMin: number
  messageMax: number
  accountStatusChanged: number
  newStatus?: string
  remark?: string
}

// 日报统计数据
export interface DailyReportStats {
  totalReports: number
  totalAccounts: number
  totalViews: number
  totalPlays: number
  totalComments: number
  totalMessages: number
  accountStatusDistribution: Array<{ status: string; count: number }>
  platformDistribution: Array<{ platform: string; count: number }>
  topOperators: Array<{
    operatorId: number
    operatorName: string
    reportCount: number
    totalViews: number
  }>
}

// ========== 账号管理 ==========

// 获取账号列表
export const getAccountList = (params?: any) => {
  return request<{ list: OperationAccount[]; total: number }>({
    url: '/operation/accounts',
    method: 'get',
    params,
  })
}

// 创建账号
export const createAccount = (data: Partial<OperationAccount>) => {
  return request({
    url: '/operation/accounts',
    method: 'post',
    data,
  })
}

// 更新账号
export const updateAccount = (id: number, data: Partial<OperationAccount>) => {
  return request({
    url: `/operation/accounts/${id}`,
    method: 'put',
    data,
  })
}

// 删除账号
export const deleteAccount = (id: number) => {
  return request({
    url: `/operation/accounts/${id}`,
    method: 'delete',
  })
}

// ========== 日报管理 ==========

// 获取日报列表
export const getDailyReportList = (params: DailyReportQuery) => {
  return request<{ list: OperationDailyReport[]; total: number; page: number; pageSize: number }>({
    url: '/operation/daily-reports',
    method: 'get',
    params,
  })
}

// 获取日报详情
export const getDailyReportDetail = (id: number) => {
  return request<OperationDailyReport>({
    url: `/operation/daily-reports/${id}`,
    method: 'get',
  })
}

// 创建日报
export const createDailyReport = (data: CreateDailyReportDto) => {
  return request({
    url: '/operation/daily-reports',
    method: 'post',
    data,
  })
}

// 更新日报
export const updateDailyReport = (id: number, data: Partial<CreateDailyReportDto>) => {
  return request({
    url: `/operation/daily-reports/${id}`,
    method: 'put',
    data,
  })
}

// 删除日报
export const deleteDailyReport = (id: number) => {
  return request({
    url: `/operation/daily-reports/${id}`,
    method: 'delete',
  })
}

// 获取日报统计数据
export const getDailyReportStats = (params: {
  startDate?: string
  endDate?: string
  operatorId?: number
}) => {
  return request<DailyReportStats>({
    url: '/operation/stats',
    method: 'get',
    params,
  })
}

// 导出日报数据
export const exportDailyReports = (params: DailyReportQuery) => {
  return request({
    url: '/operation/daily-reports/export',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

// 导出API对象
export const operationApi = {
  getAccountList,
  createAccount,
  updateAccount,
  deleteAccount,
  getDailyReportList,
  getDailyReportDetail,
  createDailyReport,
  updateDailyReport,
  deleteDailyReport,
  getDailyReportStats,
  exportDailyReports,
}
