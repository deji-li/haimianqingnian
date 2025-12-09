import request from '@/utils/request'

// ==================== 文件上传 ====================
export function uploadFile(file: File, category: string = 'ai_chat') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  return request({
    url: '/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ==================== AI聊天记录分析 ====================
export function uploadChatRecord(data: any) {
  return request({
    url: '/ai-chat/upload',
    method: 'post',
    data
  })
}

export function getChatRecordList(params: any) {
  return request({
    url: '/ai-chat/list',
    method: 'get',
    params
  })
}

export function getChatRecordDetail(id: number) {
  return request({
    url: `/ai-chat/${id}`,
    method: 'get'
  })
}

export function getChatStatistics() {
  return request({
    url: '/ai-chat/statistics',
    method: 'get'
  })
}

export function deleteChatRecord(id: number) {
  return request({
    url: `/ai-chat/${id}`,
    method: 'delete'
  })
}

// ==================== AI客户标签 ====================
export function getCustomerTags(customerId: number) {
  return request({
    url: `/ai-tags/customer/${customerId}`,
    method: 'get'
  })
}

export function createTag(data: any) {
  return request({
    url: '/ai-tags',
    method: 'post',
    data
  })
}

export function deleteTag(id: number) {
  return request({
    url: `/ai-tags/${id}`,
    method: 'delete'
  })
}

export function getTagStatistics(customerId?: number) {
  return request({
    url: '/ai-tags/statistics',
    method: 'get',
    params: { customerId }
  })
}

// ==================== AI知识库 ====================
export function searchKnowledge(data: any) {
  return request({
    url: '/ai-knowledge/search',
    method: 'post',
    data
  })
}

export function getKnowledgeList(params: any) {
  return request({
    url: '/ai-knowledge/list',
    method: 'get',
    params
  })
}

export function createKnowledge(data: any) {
  return request({
    url: '/ai-knowledge',
    method: 'post',
    data
  })
}

export function updateKnowledge(id: number, data: any) {
  return request({
    url: `/ai-knowledge/${id}`,
    method: 'put',
    data
  })
}

export function deleteKnowledge(id: number) {
  return request({
    url: `/ai-knowledge/${id}`,
    method: 'delete'
  })
}

export function getKnowledgeCategories() {
  return request({
    url: '/ai-knowledge/categories',
    method: 'get'
  })
}

export function batchImportKnowledge(data: any[]) {
  return request({
    url: '/ai-knowledge/batch-import',
    method: 'post',
    data
  })
}

// ==================== AI话术助手 ====================
export function generateScript(customerId: number, scriptType: string) {
  return request({
    url: '/ai-tools/script/generate',
    method: 'post',
    data: { customerId, scriptType }
  })
}

export function getScriptList(scriptType: string) {
  return request({
    url: '/ai-tools/script/list',
    method: 'get',
    params: { scriptType }
  })
}

export function recordScriptUsage(id: number, success: boolean) {
  return request({
    url: `/ai-tools/script/${id}/use`,
    method: 'post',
    data: { success }
  })
}

// ==================== AI风险预警 ====================
export function getPendingRiskAlerts() {
  return request({
    url: '/ai-tools/risk/pending',
    method: 'get'
  })
}

export function handleRiskAlert(id: number, handleResult: string) {
  return request({
    url: `/ai-tools/risk/${id}/handle`,
    method: 'post',
    data: { handleResult }
  })
}

// ==================== AI客户复苏 ====================
export function getSleepingCustomers(days?: number) {
  return request({
    url: '/ai-tools/recovery/sleeping-customers',
    method: 'get',
    params: { days }
  })
}

// ==================== AI培训陪练 ====================
export function startTraining(scenario: string) {
  return request({
    url: '/ai-tools/training/start',
    method: 'post',
    data: { scenario }
  })
}

export function trainConversation(id: number, message: string) {
  return request({
    url: `/ai-tools/training/${id}/chat`,
    method: 'post',
    data: { message }
  })
}

export function endTraining(id: number) {
  return request({
    url: `/ai-tools/training/${id}/end`,
    method: 'post'
  })
}

// ==================== AI营销助手 ====================
export function generateMarketingContent(data: any) {
  return request({
    url: '/ai-marketing/assistant/generate',
    method: 'post',
    data
  })
}

export function getMarketingHistory(params?: {
  page?: number
  limit?: number
  scenario?: string
  customerId?: number
}) {
  return request({
    url: '/ai-marketing/assistant/history',
    method: 'get',
    params
  })
}

export function getMarketingHistoryDetail(id: number) {
  return request({
    url: `/ai-marketing/assistant/history/${id}`,
    method: 'get'
  })
}

export function batchDeleteMarketingHistory(historyIds: number[]) {
  return request({
    url: '/ai-marketing/assistant/history/batch-delete',
    method: 'post',
    data: { historyIds }
  })
}

export function submitMarketingFeedback(data: {
  historyId: number
  contentRating: number
  effectiveRating: number
  feedback: string
  improvement?: string
}) {
  return request({
    url: '/ai-marketing/assistant/feedback',
    method: 'post',
    data
  })
}

export function recommendContentToLibrary(data: {
  historyId: number
  title: string
  category?: string
  tags?: string[]
  remark?: string
}) {
  return request({
    url: '/ai-marketing/assistant/recommend',
    method: 'post',
    data
  })
}

export function feedbackContentToKnowledge(historyId: number) {
  return request({
    url: `/ai-marketing/assistant/feedback-to-knowledge/${historyId}`,
    method: 'post'
  })
}

export function getRecommendedKnowledge(scenario: string, limit?: number) {
  return request({
    url: `/ai-marketing/assistant/knowledge/recommended/${scenario}`,
    method: 'get',
    params: { limit }
  })
}

export function getPopularKnowledge(limit?: number) {
  return request({
    url: '/ai-marketing/assistant/knowledge/popular',
    method: 'get',
    params: { limit }
  })
}

// ==================== 客户洞察 ====================
export function getCustomerInsights(customerId: number) {
  return request({
    url: `/ai-marketing/assistant/insights/${customerId}`,
    method: 'get'
  })
}

export function getAllCustomerInsights() {
  return request({
    url: '/ai-marketing/assistant/insights',
    method: 'get'
  })
}

export function addCustomerInsight(data: {
  customerId: number
  insightType: 'painPoint' | 'need' | 'interest'
  content: string
  source?: string
  confidence?: number
}) {
  return request({
    url: '/ai-marketing/assistant/insights',
    method: 'post',
    data
  })
}

// ==================== AI营销文案库 ====================
// 保存文案到文案库
export function saveMarketingContent(data: {
  contentType: string
  title: string
  content: string
  painPoints?: string[]
  interestPoints?: string[]
  generationParams?: any
  purpose?: string
  style?: string
  wordCount?: string
  tags?: string[]
  category?: string
  remark?: string
}) {
  return request({
    url: '/ai-marketing/content',
    method: 'post',
    data
  })
}

// 获取文案列表
export function getMarketingContentList(params: {
  page?: number
  limit?: number
  contentType?: string
  isFavorite?: number
  category?: string
  keyword?: string
}) {
  return request({
    url: '/ai-marketing/content',
    method: 'get',
    params
  })
}

// 获取文案统计
export function getMarketingContentStatistics() {
  return request({
    url: '/ai-marketing/content/statistics',
    method: 'get'
  })
}

// 获取所有分类
export function getMarketingContentCategories() {
  return request({
    url: '/ai-marketing/content/categories',
    method: 'get'
  })
}

// 获取单个文案详情
export function getMarketingContentDetail(id: number) {
  return request({
    url: `/ai-marketing/content/${id}`,
    method: 'get'
  })
}

// 更新文案
export function updateMarketingContent(id: number, data: {
  title?: string
  content?: string
  tags?: string[]
  category?: string
  remark?: string
}) {
  return request({
    url: `/ai-marketing/content/${id}`,
    method: 'put',
    data
  })
}

// 删除文案
export function deleteMarketingContent(id: number) {
  return request({
    url: `/ai-marketing/content/${id}`,
    method: 'delete'
  })
}

// 切换收藏状态
export function toggleMarketingContentFavorite(id: number) {
  return request({
    url: `/ai-marketing/content/${id}/favorite`,
    method: 'post'
  })
}

// 记录使用
export function recordMarketingContentUsage(id: number, data?: {
  usageChannel?: string
  usageResult?: string
  customerId?: number
  usageRemark?: string
}) {
  return request({
    url: `/ai-marketing/content/${id}/usage`,
    method: 'post',
    data: data || {}
  })
}

// ==================== AI营销场景 ====================
// 获取所有营销场景配置
export function getMarketingScenarios(params?: { category?: string; isActive?: boolean }) {
  return request({
    url: '/ai-marketing/scenarios',
    method: 'get',
    params
  })
}

// 获取场景分类列表
export function getScenarioCategories() {
  return request({
    url: '/ai-marketing/scenarios/categories',
    method: 'get'
  })
}

// 获取单个场景配置
export function getMarketingScenario(scenarioKey: string) {
  return request({
    url: `/ai-marketing/scenarios/${scenarioKey}`,
    method: 'get'
  })
}

// 执行营销场景分析
export function executeMarketingScenario(data: {
  scenarioKey: string
  variables: Record<string, any>
  customerId?: number
}) {
  return request({
    url: '/ai-marketing/execute',
    method: 'post',
    data
  })
}

// 批量执行多个场景
export function batchExecuteScenarios(data: {
  scenarioKeys: string[]
  sharedVariables: Record<string, any>
  customerId?: number
}) {
  return request({
    url: '/ai-marketing/batch-execute',
    method: 'post',
    data
  })
}

// 快速方法：痛点分析
export function analyzePainPoints(data: {
  chatContent: string
  customerProfile?: any
}) {
  return request({
    url: '/ai-marketing/quick/pain-points',
    method: 'post',
    data
  })
}

// 快速方法：兴趣点挖掘
export function mineInterestPoints(data: { chatContent: string }) {
  return request({
    url: '/ai-marketing/quick/interest-points',
    method: 'post',
    data
  })
}

// 快速方法：需求定位
export function positionNeeds(data: {
  chatContent: string
  painPoints: string[]
  interestPoints: string[]
}) {
  return request({
    url: '/ai-marketing/quick/need-positioning',
    method: 'post',
    data
  })
}

// 快速方法：话术推荐
export function recommendScripts(data: {
  painPoints: string[]
  interestPoints: string[]
  conversationStage: string
  decisionRole: string
}) {
  return request({
    url: '/ai-marketing/quick/script-recommendation',
    method: 'post',
    data
  })
}

// 快速方法：异议处理
export function handleObjections(data: {
  chatContent: string
  objections: string[]
}) {
  return request({
    url: '/ai-marketing/quick/objection-handling',
    method: 'post',
    data
  })
}

// 快速方法：成交时机判断
export function assessClosingTiming(data: {
  chatContent: string
  intentionScore: number
  resolvedPainPoints: string[]
  unresolvedPainPoints: string[]
  communicationRounds: number
}) {
  return request({
    url: '/ai-marketing/quick/closing-timing',
    method: 'post',
    data
  })
}

// ==================== AI人效分析 ====================
export function getAiEfficiencyAnalytics(params: any) {
  return request({
    url: '/ai-tools/analytics/efficiency',
    method: 'get',
    params
  })
}

// ==================== AI诊断报告 ====================
export function generateAiReport(data: any) {
  return request({
    url: '/ai-tools/report/generate',
    method: 'post',
    data
  })
}

export function getAiReportList(params: any) {
  return request({
    url: '/ai-tools/report/list',
    method: 'get',
    params
  })
}

export function getAiReportDetail(id: number) {
  return request({
    url: `/ai-tools/report/${id}`,
    method: 'get'
  })
}
