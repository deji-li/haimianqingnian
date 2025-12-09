/**
 * 企业微信相关API接口
 */

import { request } from '@/utils/request'

// 企业微信配置接口
export interface WeWorkConfig {
  isActive: boolean
  corpId: string
  agentId: string
  secret: string
  callbackUrl: string
  token: string
  aesKey: string
  features: {
    contactSync: boolean
    chatAnalysis: boolean
    messagePush: boolean
    chatArchive: boolean
  }
  syncStrategy: {
    interval: number
    autoSync: boolean
    incrementalSync: boolean
  }
}

// 连接测试结果
export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: any
}

// 同步状态
export interface SyncStatus {
  isRunning: boolean
  lastSyncTime: string | null
  nextSyncTime: string | null
  totalContacts: number
  syncedContacts: number
  failedContacts: number
  progress: number
  logs: SyncLog[]
}

// 同步日志
export interface SyncLog {
  id: number
  type: 'contact' | 'chat' | 'error'
  message: string
  details?: any
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

// 企业微信配置API
export const weworkApi = {
  // 获取企业微信配置
  getConfig(): Promise<{ success: boolean; config: WeWorkConfig }> {
    return request({
      url: '/api/wework/config',
      method: 'GET'
    })
  },

  // 保存企业微信配置
  saveConfig(config: Partial<WeWorkConfig>): Promise<{ success: boolean; message: string }> {
    return request({
      url: '/api/wework/config',
      method: 'POST',
      data: config
    })
  },

  // 测试企业微信连接
  testConnection(config: { corpId: string; agentId: string; secret: string }): Promise<ConnectionTestResult> {
    return request({
      url: '/api/wework/test-connection',
      method: 'POST',
      data: config
    })
  },

  // 获取同步状态
  getSyncStatus(): Promise<{ success: boolean; status: SyncStatus }> {
    return request({
      url: '/api/wework/sync/status',
      method: 'GET'
    })
  },

  // 手动触发同步
  triggerSync(type?: 'contact' | 'chat' | 'all'): Promise<{ success: boolean; message: string; taskId: string }> {
    return request({
      url: '/api/wework/sync/trigger',
      method: 'POST',
      data: { type }
    })
  },

  // 获取同步日志
  getSyncLogs(params: {
    page?: number
    limit?: number
    type?: string
    startDate?: string
    endDate?: string
  }): Promise<{ success: boolean; logs: SyncLog[]; total: number }> {
    return request({
      url: '/api/wework/sync/logs',
      method: 'GET',
      data: params
    })
  },

  // 获取企业微信联系人列表
  getContacts(params: {
    page?: number
    limit?: number
    keyword?: string
    departmentId?: number
  }): Promise<{ success: boolean; contacts: any[]; total: number }> {
    return request({
      url: '/api/wework/contacts',
      method: 'GET',
      data: params
    })
  },

  // 同步单个联系人到CRM
  syncContactToCRM(externalUserId: string): Promise<{ success: boolean; message: string; customerId?: number }> {
    return request({
      url: `/api/wework/contacts/${externalUserId}/sync`,
      method: 'POST'
    })
  },

  // 获取聊天记录
  getChatRecords(params: {
    externalUserId?: string
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    messageType?: string
  }): Promise<{ success: boolean; records: any[]; total: number }> {
    return request({
      url: '/api/wework/chat-records',
      method: 'GET',
      data: params
    })
  },

  // 触发AI聊天分析
  triggerChatAnalysis(params: {
    externalUserId?: string
    customerId?: number
    recordIds?: string[]
  }): Promise<{ success: boolean; message: string; taskId?: string }> {
    return request({
      url: '/api/wework/chat-analysis/trigger',
      method: 'POST',
      data: params
    })
  },

  // 获取AI分析结果
  getChatAnalysisResult(customerId: number): Promise<{ success: boolean; result: any }> {
    return request({
      url: `/api/wework/chat-analysis/result/${customerId}`,
      method: 'GET'
    })
  },

  // 发送企业微信消息
  sendMessage(params: {
    userIds?: string[]
    externalUserIds?: string[]
    messageType: 'text' | 'image' | 'file' | 'textcard'
    content: any
  }): Promise<{ success: boolean; message: string }> {
    return request({
      url: '/api/wework/message/send',
      method: 'POST',
      data: params
    })
  },

  // 获取企业微信用户信息
  getUserInfo(userId?: string): Promise<{ success: boolean; userInfo: any }> {
    return request({
      url: '/api/wework/user/info',
      method: 'GET',
      data: { userId }
    })
  },

  // 获取企业微信部门列表
  getDepartments(): Promise<{ success: boolean; departments: any[] }> {
    return request({
      url: '/api/wework/departments',
      method: 'GET'
    })
  },

  // 获取企业微信统计信息
  getStatistics(): Promise<{
    success: boolean
    data: {
      totalContacts: number
      totalChatRecords: number
      todaySyncCount: number
      aiAnalysisCount: number
      errorCount: number
    }
  }> {
    return request({
      url: '/api/wework/statistics',
      method: 'GET'
    })
  }
}

export default weworkApi