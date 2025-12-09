import request from '@/utils/request'

// 订单同步日志查询参数
export interface SyncLogQuery {
  syncBatchId?: string
  orderNo?: string
  syncType?: string
  result?: string
  startTime?: string
  endTime?: string
  page?: number
  pageSize?: number
}

// 订单同步日志
export interface OrderSyncLog {
  id: number
  syncBatchId: string
  orderNo: string
  syncType: string
  oldStatus: string | null
  newStatus: string | null
  changes: any
  externalData: any
  syncTime: string
  result: string
  errorMessage: string | null
  executionTime: number
}

// 同步配置
export interface SyncConfig {
  configKey: string
  configValue: string
  configName?: string
  remark?: string
}

// 手动同步参数
export interface TriggerSyncParams {
  startTime?: string
  endTime?: string
  status?: number
}

// 同步结果
export interface SyncResult {
  syncBatchId: string
  totalProcessed: number
  successCount: number
  failedCount: number
  skippedCount: number
  createdCount: number
  updatedCount: number
  deletedCount: number
  executionTime: number
  errors?: Array<{
    orderNo: string
    message: string
  }>
}

// 获取同步配置
export const getConfig = () => {
  return request<SyncConfig[]>({
    url: '/order-sync/config',
    method: 'get',
  })
}

// 更新同步配置
export const updateConfig = (data: { configKey: string; configValue: string }) => {
  console.log('🔄 更新配置请求:', data)
  return request({
    url: '/order-sync/config',
    method: 'put',
    data,
  }).catch(error => {
    console.error('❌ 更新配置失败:', error)
    console.error('❌ 错误详情:', error.response?.data)
    throw error
  })
}

// 手动触发同步
export const triggerSync = (data?: TriggerSyncParams) => {
  return request<SyncResult>({
    url: '/order-sync/trigger',
    method: 'post',
    data: data || {},
  })
}

// 获取同步日志
export const getLogs = (params: SyncLogQuery) => {
  return request<{ logs: OrderSyncLog[]; total: number; page: number; limit: number }>({
    url: '/order-sync/logs',
    method: 'get',
    params,
  })
}

// 导出API对象（用于setup语法）
export const orderSyncApi = {
  getConfig,
  updateConfig,
  triggerSync,
  getLogs,
}
