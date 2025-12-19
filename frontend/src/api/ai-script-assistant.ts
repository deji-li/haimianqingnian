import request from '@/utils/request'

// ==================== 类型定义 ====================
export type FunctionType = 'deal_assist' | 'reply_assist' | 'script_polish' | 'opening_lines'

export interface CreateConversationDto {
  functionType: FunctionType
  scenarioId?: number
  techniqueId?: number
  customerId?: number
  title?: string
}

export interface SendMessageDto {
  content: string
  customerName?: string
  customerProfile?: string
  scenario?: string
  technique?: string
  knowledgeContent?: string[]
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface QueryConversationsDto {
  functionType?: FunctionType
  page?: number
  limit?: number
  customerId?: number
  isActive?: boolean
}

export interface CreateFeedbackDto {
  messageId: number
  feedbackType: 'like' | 'dislike'
  feedbackReason?: string
}

// ==================== 对话管理 ====================
export function createConversation(data: CreateConversationDto) {
  return request({
    url: '/ai-script-assistant/conversations',
    method: 'post',
    data
  })
}

export function sendMessage(conversationId: number, data: SendMessageDto) {
  return request({
    url: `/ai-script-assistant/conversations/${conversationId}/messages`,
    method: 'post',
    data
  })
}

export function getConversations(params?: QueryConversationsDto) {
  return request({
    url: '/ai-script-assistant/conversations',
    method: 'get',
    params
  })
}

export function getConversationDetail(conversationId: number) {
  return request({
    url: `/ai-script-assistant/conversations/${conversationId}`,
    method: 'get'
  })
}

export function deleteConversation(conversationId: number) {
  return request({
    url: `/ai-script-assistant/conversations/${conversationId}`,
    method: 'delete'
  })
}

// ==================== 场景技巧 ====================
export function getScenarios(functionType?: FunctionType) {
  return request({
    url: '/ai-script-assistant/scenarios',
    method: 'get',
    params: { functionType }
  })
}

export function getTechniques(scenarioId?: number) {
  return request({
    url: '/ai-script-assistant/techniques',
    method: 'get',
    params: { scenarioId }
  })
}

// ==================== 反馈 ====================
export function submitFeedback(data: CreateFeedbackDto) {
  return request({
    url: '/ai-script-assistant/feedback',
    method: 'post',
    data
  })
}

// ==================== 兼容旧版接口 ====================
export function generateScript(customerId: number, scriptType: string) {
  return request({
    url: '/ai-script-assistant/script/generate',
    method: 'post',
    data: { customerId, scriptType }
  })
}

export function getScriptList(scriptType: string) {
  return request({
    url: '/ai-script-assistant/script/list',
    method: 'get',
    params: { scriptType }
  })
}

export function recordScriptUsage(id: number, success: boolean) {
  return request({
    url: `/ai-script-assistant/script/${id}/use`,
    method: 'post',
    data: { success }
  })
}

// ==================== 话术推荐 ====================
export interface RecommendScriptDto {
  conversationId: number
  messageId: number
  recommendReason?: string
}

export interface QueryRecommendationsDto {
  functionType?: FunctionType
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  limit?: number
}

export interface ApproveRecommendationDto {
  recommendationId: number
  approved: boolean
  remark?: string
}

export function recommendScript(data: RecommendScriptDto) {
  return request({
    url: '/ai-script-assistant/recommend',
    method: 'post',
    data
  })
}

export function getRecommendations(params?: QueryRecommendationsDto) {
  return request({
    url: '/ai-script-assistant/recommendations',
    method: 'get',
    params
  })
}

export function approveRecommendation(id: number, data: { approved: boolean, remark?: string }) {
  return request({
    url: `/ai-script-assistant/recommendations/${id}/approve`,
    method: 'post',
    data
  })
}

// ==================== AI配置管理 ====================
export interface CreatePromptConfigDto {
  functionType: FunctionType
  scenarioId?: number
  techniqueId?: number
  configName: string
  systemPrompt?: string
  userPromptTemplate?: string
  temperature?: number
  maxTokens?: number
  knowledgeWeight?: number
  variables?: string[]
  isActive?: boolean
}

export interface UpdatePromptConfigDto {
  configName?: string
  systemPrompt?: string
  userPromptTemplate?: string
  temperature?: number
  maxTokens?: number
  knowledgeWeight?: number
  variables?: string[]
  isActive?: boolean
}

export interface QueryPromptConfigDto {
  functionType?: FunctionType
  scenarioId?: number
  techniqueId?: number
  isActive?: boolean
  page?: number
  limit?: number
}

export function createPromptConfig(data: CreatePromptConfigDto) {
  return request({
    url: '/ai-script-assistant/config',
    method: 'post',
    data
  })
}

export function getPromptConfigs(params?: QueryPromptConfigDto) {
  return request({
    url: '/ai-script-assistant/config',
    method: 'get',
    params
  })
}

export function getDefaultConfig(functionType: string, scenarioId?: number, techniqueId?: number) {
  return request({
    url: `/ai-script-assistant/config/default/${functionType}`,
    method: 'get',
    params: { scenarioId, techniqueId }
  })
}

export function getPromptConfigById(id: number) {
  return request({
    url: `/ai-script-assistant/config/${id}`,
    method: 'get'
  })
}

export function updatePromptConfig(id: number, data: UpdatePromptConfigDto) {
  return request({
    url: `/ai-script-assistant/config/${id}`,
    method: 'put',
    data
  })
}

export function deletePromptConfig(id: number) {
  return request({
    url: `/ai-script-assistant/config/${id}`,
    method: 'delete'
  })
}

export function duplicatePromptConfig(id: number, newName?: string) {
  return request({
    url: `/ai-script-assistant/config/${id}/duplicate`,
    method: 'post',
    data: { newName }
  })
}

export function getSupportedVariables() {
  return request({
    url: '/ai-script-assistant/config/variables/supported',
    method: 'get'
  })
}

export function initializeDefaultConfigs() {
  return request({
    url: '/ai-script-assistant/config/initialize-defaults',
    method: 'post'
  })
}

// ==================== 直接生成接口（工具模式） ====================
export function generateScriptDirect(data: {
  functionType: 'script_polish' | 'opening_lines'
  content?: string
  scenarioId?: number
  techniqueId?: number
  variables?: Record<string, any>
}) {
  return request({
    url: '/ai-script-assistant/generate-direct',
    method: 'post',
    data
  })
}