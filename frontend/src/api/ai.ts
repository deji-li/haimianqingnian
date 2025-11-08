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
    url: '/ai-tools/marketing/generate',
    method: 'post',
    data
  })
}

export function getMarketingHistory(contentType?: string) {
  return request({
    url: '/ai-tools/marketing/history',
    method: 'get',
    params: { contentType }
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
