import request from '@/utils/request'

// AI API密钥接口定义
export interface AiApiKey {
  id: number
  name: string
  provider: string
  apiKey: string
  apiSecret?: string
  endpoint?: string
  model?: string
  maxTokens?: number
  temperature?: number
  isActive: boolean
  dailyLimit?: number
  monthlyLimit?: number
  currentUsage?: number
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
  remark?: string
}

// 创建API密钥参数
export interface CreateApiKeyParams {
  name: string
  provider: string
  apiKey: string
  apiSecret?: string
  endpoint?: string
  model?: string
  maxTokens?: number
  temperature?: number
  dailyLimit?: number
  monthlyLimit?: number
  remark?: string
}

// 更新API密钥参数
export interface UpdateApiKeyParams extends Partial<CreateApiKeyParams> {
  isActive?: boolean
}

// 查询参数
export interface ApiKeyQuery {
  page?: number
  pageSize?: number
  provider?: string
  isActive?: boolean
  keyword?: string
}

// 获取API密钥列表
export function getApiKeys(params: ApiKeyQuery = {}) {
  return request<{
    list: AiApiKey[]
    total: number
    page: number
    pageSize: number
  }>({
    url: '/ai-api-keys',
    method: 'get',
    params
  })
}

// 获取单个API密钥详情
export function getApiKey(id: number) {
  return request<AiApiKey>({
    url: `/ai-api-keys/${id}`,
    method: 'get'
  })
}

// 创建API密钥
export function createApiKey(data: CreateApiKeyParams) {
  return request<AiApiKey>({
    url: '/ai-api-keys',
    method: 'post',
    data
  })
}

// 更新API密钥
export function updateApiKey(id: number, data: UpdateApiKeyParams) {
  return request<AiApiKey>({
    url: `/ai-api-keys/${id}`,
    method: 'put',
    data
  })
}

// 删除API密钥
export function deleteApiKey(id: number) {
  return request({
    url: `/ai-api-keys/${id}`,
    method: 'delete'
  })
}

// 测试API密钥连接
export function testApiKeyConnection(id: number) {
  return request<{
    success: boolean
    message: string
    responseTime?: number
  }>({
    url: `/ai-api-keys/${id}/test`,
    method: 'post'
  })
}

// 获取API密钥使用统计
export function getApiKeyUsage(id: number, params?: {
  startDate?: string
  endDate?: string
}) {
  return request<{
    dailyUsage: Array<{
      date: string
      requestCount: number
      tokenCount: number
    }>
    totalRequests: number
    totalTokens: number
    averageResponseTime: number
  }>({
    url: `/ai-api-keys/${id}/usage`,
    method: 'get',
    params
  })
}

// 重置API密钥使用量
export function resetApiKeyUsage(id: number) {
  return request({
    url: `/ai-api-keys/${id}/reset-usage`,
    method: 'post'
  })
}

// 导出API对象（用于setup语法）
export const aiApiKeyApi = {
  getApiKeys,
  getApiKey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  testApiKeyConnection,
  getApiKeyUsage,
  resetApiKeyUsage
}