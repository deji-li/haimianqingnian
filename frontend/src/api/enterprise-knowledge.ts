import request from '@/utils/request'

/**
 * 企业知识库相关API
 */

export const enterpriseKnowledgeApi = {
  // 创建企业知识库
  create(data: any) {
    return request.post('/enterprise-knowledge', data)
  },

  // 获取知识库列表
  getKnowledgeList(params: any) {
    return request.get('/enterprise-knowledge/list', { params })
  },

  // 获取知识库详情
  getKnowledgeDetail(id: number) {
    return request.get(`/enterprise-knowledge/${id}`)
  },

  // 更新知识库
  updateKnowledge(id: number, data: any) {
    return request.put(`/enterprise-knowledge/${id}`, data)
  },

  // 删除知识库
  deleteKnowledge(id: number) {
    return request.delete(`/enterprise-knowledge/${id}`)
  },

  // 搜索知识库
  searchKnowledge(params: any) {
    return request.post('/enterprise-knowledge/intelligent-search', params)
  },

  // 触发知识挖掘
  triggerMining(params: any) {
    return request.post('/enterprise-knowledge/mining/trigger', params)
  },

  // 获取挖掘统计
  getMiningStats() {
    return request.get('/enterprise-knowledge/mining/stats')
  },

  // 获取待审核列表
  getPendingReviews(params: any) {
    return request.get('/enterprise-knowledge/mining/pending-reviews', { params })
  },

  // 审核知识
  reviewKnowledge(data: any) {
    return request.post('/enterprise-knowledge/mining/review', data)
  },

  // 批量审核
  batchReview(data: any) {
    return request.post('/enterprise-knowledge/mining/batch-review', data)
  },

  // 获取知识库统计
  getKnowledgeStats() {
    return request.get('/enterprise-knowledge/stats/overview')
  },

  // 获取行业问题
  getIndustryQuestions(industry: string) {
    return request.get(`/enterprise-knowledge/industry-question/list`, { params: { industry } })
  },

  // 获取知识使用日志
  getUsageLogs(params: any) {
    return request.get('/enterprise-knowledge/usage/global-stats', { params })
  },

  // 导出知识库
  exportKnowledge(params: any) {
    return request.get('/enterprise-knowledge/list', {
      params,
      responseType: 'blob'
    })
  },

  // 导入知识库
  importKnowledge(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/enterprise-knowledge/batch-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取知识分类统计
  getCategoryStats() {
    return request.get('/enterprise-knowledge/categories')
  },

  // 获取知识质量报告
  getQualityReport() {
    return request.get('/enterprise-knowledge/stats/overview')
  },

  // 更新知识状态
  updateKnowledgeStatus(id: number, status: string) {
    return request.put(`/enterprise-knowledge/${id}`, { status })
  },

  // 批量更新知识状态
  batchUpdateStatus(ids: number[], status: string) {
    return request.post('/enterprise-knowledge/batch-import', { ids, status })
  },

  // 搜索知识库（支持分页和筛选）
  search(params: any) {
    return request.post('/enterprise-knowledge/intelligent-search', params)
  },

  // 批量更新知识
  batchUpdate(ids: number[], data: any) {
    return request.post('/enterprise-knowledge/batch-import', { ids, data })
  },

  // 批量删除知识
  batchDelete(ids: number[]) {
    return request.post('/enterprise-knowledge/batch-import', { ids, action: 'delete' })
  },

  // 提交知识反馈
  submitFeedback(knowledgeId: number, data: any) {
    return request.post(`/enterprise-knowledge/feedback/submit`, { knowledgeId, ...data })
  },

  // 挖掘任务相关API
  getMiningTasks() {
    return request.get('/enterprise-knowledge/mining/pending-review')
  },

  startMining(data: any) {
    return request.post('/enterprise-knowledge/mining/trigger', data)
  },

  pauseMiningTask(taskId: number) {
    return request.put(`/enterprise-knowledge/mining/review`, { id: taskId, action: 'pause' })
  },

  resumeMiningTask(taskId: number) {
    return request.put(`/enterprise-knowledge/mining/review`, { id: taskId, action: 'resume' })
  },

  deleteMiningTask(taskId: number) {
    return request.put(`/enterprise-knowledge/mining/review`, { id: taskId, action: 'delete' })
  },

  getMiningResults(taskId: number) {
    return request.get('/enterprise-knowledge/mining/pending-review', { params: { taskId } })
  },

  approveMiningResult(resultId: number) {
    return request.put(`/enterprise-knowledge/mining/review`, { id: resultId, action: 'approve' })
  },

  rejectMiningResult(resultId: number) {
    return request.put(`/enterprise-knowledge/mining/review`, { id: resultId, action: 'reject' })
  },

  batchApproveResults(ids: number[]) {
    return request.put('/enterprise-knowledge/mining/batch-review', { ids, action: 'approve' })
  },

  batchRejectResults(ids: number[]) {
    return request.put('/enterprise-knowledge/mining/batch-review', { ids, action: 'reject' })
  },

  // 分析统计相关API
  getAnalyticsOverview(params: any) {
    return request.get('/enterprise-knowledge/stats/overview', { params })
  },

  getGrowthTrend(params: any) {
    return request.get('/enterprise-knowledge/usage/global-stats', { params })
  },

  getUsageAnalytics(params: any) {
    return request.get('/enterprise-knowledge/usage/global-stats', { params })
  },

  getCategoryDistribution() {
    return request.get('/enterprise-knowledge/categories')
  },

  getSourceDistribution() {
    return request.get('/enterprise-knowledge/categories')
  },

  getHotKnowledge(params: any) {
    return request.get('/enterprise-knowledge/usage/hot-knowledge', { params })
  },

  getOptimizeKnowledge(params: any) {
    return request.get('/enterprise-knowledge/usage/hot-knowledge', { params })
  },

  getAIUsageAnalytics() {
    return request.get('/enterprise-knowledge/usage/global-stats')
  }
}

export default enterpriseKnowledgeApi