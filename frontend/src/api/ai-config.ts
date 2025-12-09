import request from '@/utils/request'

/**
 * AI配置相关API
 */

// 获取所有配置
export const aiConfigApi = {
  // 获取完整的AI配置
  getAllConfigs() {
    return request.get('/api/ai-config/all-configs')
  },

  // 更新所有配置
  updateAllConfig(config: any) {
    return request.post('/api/ai-config/update-config', config)
  },

  // 获取知识库统计
  getKnowledgeStats() {
    return request.get('/api/enterprise-knowledge/stats')
  },

  // 触发知识挖掘
  triggerMining(params: any) {
    return request.post('/api/enterprise-knowledge/trigger-mining', params)
  },

  // 获取知识库列表
  getKnowledgeList(params: any) {
    return request.get('/api/enterprise-knowledge/list', { params })
  },

  // 删除知识
  deleteKnowledge(id: number) {
    return request.delete(`/api/enterprise-knowledge/${id}`)
  },

  // 导出知识库
  exportKnowledge(params?: any) {
    return request.get('/api/enterprise-knowledge/export', {
      params,
      responseType: 'blob'
    })
  },

  // 创建企业知识库
  createEnterpriseKnowledge(data: any) {
    return request.post('/api/enterprise-knowledge/create', data)
  },

  // 获取行业问题
  getIndustryQuestions(industry: string) {
    return request.get(`/api/enterprise-knowledge/industry-questions/${industry}`)
  },

  // 处理知识反馈
  processKnowledgeFeedback(feedback: any) {
    return request.post('/api/enterprise-knowledge/feedback', feedback)
  },

  // 获取知识库使用统计
  getKnowledgeUsage(params?: any) {
    return request.get('/api/enterprise-knowledge/usage-stats', { params })
  },

  // 获取模型配置
  getModelConfigs() {
    return request.get('/api/ai-config/models')
  },

  // 更新模型配置
  updateModelConfig(modelId: number, config: any) {
    return request.put(`/api/ai-config/models/${modelId}`, config)
  },

  // 测试模型连接
  testModelConnection(modelConfig: any) {
    return request.post('/api/ai-config/test-connection', modelConfig)
  },

  // 获取功能开关状态
  getFeatureFlags() {
    return request.get('/api/ai-config/features')
  },

  // 更新功能开关
  updateFeatureFlags(features: any) {
    return request.put('/api/ai-config/features', features)
  },

  // 获取AI参数配置
  getAIParameters() {
    return request.get('/api/ai-config/parameters')
  },

  // 更新AI参数
  updateAIParameters(params: any) {
    return request.put('/api/ai-config/parameters', params)
  }
}

export default aiConfigApi