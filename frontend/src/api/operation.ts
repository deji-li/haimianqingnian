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

// ========== 提成管理 ==========

// 提成记录
export interface CommissionRecord {
  id: number
  operatorId: number
  operatorName?: string
  customerId: number
  customerName?: string
  orderId: number
  orderNo?: string
  orderTags?: string
  orderAmount: number
  commissionAmount: number
  status: '待发放' | '已发放' | '已拒绝'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// 提成查询参数
export interface CommissionQuery {
  page: number
  pageSize: number
  operatorId?: number
  status?: string
  startDate?: string
  endDate?: string
  orderNo?: string
}

// 获取提成记录
export const getCommissionList = (params: CommissionQuery) => {
  return request<{ list: CommissionRecord[]; total: number }>({
    url: '/operation/commissions',
    method: 'get',
    params,
  })
}

// 更新提成状态
export const updateCommissionStatus = (id: number, status: string, notes?: string) => {
  return request({
    url: `/operation/commissions/${id}/status`,
    method: 'patch',
    data: { status, notes },
  })
}

// 获取提成汇总
export const getCommissionSummary = (params: {
  operatorId?: number
  startDate?: string
  endDate?: string
}) => {
  return request({
    url: '/operation/commissions/summary',
    method: 'get',
    params,
  })
}

// 导出提成数据
export const exportCommissions = (params: CommissionQuery) => {
  return request({
    url: '/operation/commissions/export',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

// ========== 运营-销售联动 ==========

// 客户转化信息
export interface CustomerConversion {
  id: number
  name: string
  phone: string
  operatorId: number
  operatorName: string
  trafficPlatform: string
  trafficCity: string
  status: string
  conversionStage: string
  orderCount: number
  totalAmount: number
  lastOrderDate?: string
  createdAt: string
}

// 获取运营引流客户列表
export const getOperationCustomers = (params: {
  page: number
  pageSize: number
  operatorId?: number
  status?: string
  conversionStage?: string
  platform?: string
  city?: string
}) => {
  return request<{ list: CustomerConversion[]; total: number }>({
    url: '/operation/customers',
    method: 'get',
    params,
  })
}

// 获取转化漏斗数据
export const getConversionFunnel = (params: {
  operatorId?: number
  startDate?: string
  endDate?: string
}) => {
  return request({
    url: '/operation/conversion-funnel',
    method: 'get',
    params,
  })
}

// 获取运营业绩指标
export const getPerformanceMetrics = (params: {
  operatorId?: number
  startDate?: string
  endDate?: string
}) => {
  return request({
    url: '/operation/performance-metrics',
    method: 'get',
    params,
  })
}

// 获取平台效果对比
export const getPlatformComparison = (params: {
  startDate?: string
  endDate?: string
}) => {
  return request({
    url: '/operation/platform-comparison',
    method: 'get',
    params,
  })
}

// ========== 通知管理 ==========

// 运营通知
export interface OperationNotification {
  id: number
  operatorId: number
  customerId?: number
  orderId?: number
  type: 'conversion' | 'reminder' | 'alert'
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

// 获取未读通知数
export const getUnreadNotificationCount = () => {
  return request<{ count: number }>({
    url: '/operation/notifications/unread-count',
    method: 'get',
  })
}

// 获取通知列表
export const getNotifications = (params: {
  page: number
  pageSize: number
  isRead?: boolean
}) => {
  return request<{ list: OperationNotification[]; total: number }>({
    url: '/operation/notifications',
    method: 'get',
    params,
  })
}

// 标记通知已读
export const markNotificationAsRead = (id: number) => {
  return request({
    url: `/operation/notifications/${id}/read`,
    method: 'post',
  })
}

// 标记所有通知已读
export const markAllNotificationsAsRead = () => {
  return request({
    url: '/operation/notifications/read-all',
    method: 'post',
  })
}

// ========== 销售端接口 ==========

// 运营人员选项
export interface OperatorOption {
  id: number
  name: string
  platformType?: string
  customerCount?: number
  conversionRate?: number
}

// 按业绩获取运营人员列表
export const getOperatorsByPerformance = () => {
  return request<{ list: OperatorOption[] }>({
    url: '/api/operators/by-performance',
    method: 'get',
  })
}

// 分配引流运营人员
export const assignOperatorToCustomer = (customerId: number, operatorId: number) => {
  return request({
    url: `/customers/${customerId}/assign-operator`,
    method: 'post',
    data: { operatorId },
  })
}

// 更新账号状态
export const updateAccountStatus = (id: number, status: string) => {
  return request({
    url: `/operation/accounts/${id}/status`,
    method: 'patch',
    data: { status },
  })
}

// 导出API对象
export const operationApi = {
  // 账号管理
  getAccountList,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountStatus,

  // 日报管理
  getDailyReportList,
  getDailyReportDetail,
  createDailyReport,
  updateDailyReport,
  deleteDailyReport,
  getDailyReportStats,
  exportDailyReports,

  // 提成管理
  getCommissionList,
  updateCommissionStatus,
  getCommissionSummary,
  exportCommissions,

  // 运营-销售联动
  getOperationCustomers,
  getConversionFunnel,
  getPerformanceMetrics,
  getPlatformComparison,

  // 通知管理
  getUnreadNotificationCount,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // 销售端接口
  getOperatorsByPerformance,
  assignOperatorToCustomer,
}
