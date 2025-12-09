import request from '@/utils/request'

// 企业微信配置相关接口
export interface WeWorkConfig {
  id?: number
  corpId: string
  appSecret: string
  token?: string
  aesKey?: string
  webhookUrl?: string
  syncStrategy?: {
    syncInterval?: number
    incrementalSync?: boolean
    batchSize?: number
  }
  isActive: boolean
  createdTime?: string
  updatedTime?: string
}

// 获取企业微信配置
export const getWeWorkConfig = () => {
  return request<WeWorkConfig>({
    url: '/wework/config',
    method: 'get',
  })
}

// 保存企业微信配置
export const saveWeWorkConfig = (data: WeWorkConfig) => {
  return request<WeWorkConfig>({
    url: '/wework/config',
    method: 'post',
    data,
  })
}

// 测试企业微信API连接
export const testWeWorkConnection = () => {
  return request<{
    success: boolean
    message: string
    details?: {
      contactCount: number
      tokenStatus: string
      contactError?: string
    }
  }>({
    url: '/wework/test-connection',
    method: 'post',
  })
}

// 获取外部联系人列表
export interface ContactQuery {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface WeWorkContact {
  id: number
  externalUserId: string
  name?: string
  avatar?: string
  type: 'single' | 'external'
  gender: 'unknown' | 'male' | 'female'
  position?: string
  corpName?: string
  followUserId?: string
  remark?: string
  addTime?: string
  tags?: string[]
  customerId?: number
  syncTime?: string
  syncStatus: 'pending' | 'synced' | 'failed'
}

export const getWeWorkContacts = (params?: ContactQuery) => {
  return request<{
    list: WeWorkContact[]
    total: number
    page: number
    pageSize: number
  }>({
    url: '/wework/contacts',
    method: 'get',
    params,
  })
}

// 同步联系人到CRM
export const syncWeWorkContacts = (data: { syncType?: 'full' | 'incremental' }) => {
  return request<{
    success: boolean
    message: string
    result: {
      totalCount: number
      successCount: number
      failedCount: number
    }
  }>({
    url: '/wework/sync/contacts',
    method: 'post',
    data,
  })
}

// 获取同步日志
export interface SyncLogQuery {
  page?: number
  pageSize?: number
  syncType?: string
  syncStatus?: string
}

export interface SyncLog {
  id: number
  syncType: string
  syncDirection: string
  totalCount: number
  successCount: number
  failedCount: number
  syncStatus: string
  startTime?: string
  endTime?: string
  durationSeconds?: number
  errorMessage?: string
  syncDetails?: any
  triggerType?: string
  triggerUserId?: string
  createdTime: string
}

export const getWeWorkSyncLogs = (params?: SyncLogQuery) => {
  return request<{
    list: SyncLog[]
    total: number
    page: number
    pageSize: number
  }>({
    url: '/wework/sync/logs',
    method: 'get',
    params,
  })
}

// 获取联系人详情
export const getWeWorkContactDetail = (id: number) => {
  return request<WeWorkContact>({
    url: `/wework/contacts/${id}`,
    method: 'get',
  })
}

// 更新联系人信息
export const updateWeWorkContact = (id: number, data: Partial<WeWorkContact>) => {
  return request<WeWorkContact>({
    url: `/wework/contacts/${id}`,
    method: 'put',
    data,
  })
}

// 删除联系人
export const deleteWeWorkContact = (id: number) => {
  return request<{ success: boolean }>({
    url: `/wework/contacts/${id}`,
    method: 'delete',
  })
}

// 批量同步联系人
export const batchSyncWeWorkContacts = (externalUserIds: string[]) => {
  return request<{
    success: number
    failed: number
    errors: string[]
  }>({
    url: '/wework/contacts/sync-batch',
    method: 'post',
    data: { externalUserIds },
  })
}

// 批量删除联系人
export const batchDeleteWeWorkContacts = (ids: number[]) => {
  return request<{ success: number; failed: number }>({
    url: '/wework/contacts/batch',
    method: 'delete',
    data: { ids },
  })
}

// 关联联系人到CRM客户
export const associateWeWorkContactWithCustomer = (contactId: number, customerId: number) => {
  return request<{ success: boolean }>({
    url: `/wework/contacts/${contactId}/associate-customer`,
    method: 'post',
    data: { customerId },
  })
}

// 取消关联CRM客户
export const disassociateWeWorkContactFromCustomer = (contactId: number) => {
  return request<{ success: boolean }>({
    url: `/wework/contacts/${contactId}/disassociate-customer`,
    method: 'delete',
  })
}

// 获取同步状态
export const getWeWorkSyncStatus = () => {
  return request<{
    lastSyncTime?: string
    status: 'idle' | 'running' | 'completed' | 'failed'
    message: string
  }>({
    url: '/wework/sync/status',
    method: 'get',
  })
}

// 获取同步统计
export const getWeWorkSyncStatistics = () => {
  return request<{
    total: number
    pending: number
    synced: number
    failed: number
  }>({
    url: '/wework/contacts/statistics',
    method: 'get',
  })
}

// 同步单个联系人
export const syncWeWorkContact = (externalUserId: string) => {
  return request<{ success: boolean }>({
    url: `/wework/sync/single-contact`,
    method: 'post',
    data: { externalUserId },
  })
}