import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface KnowledgeBase {
  id: number
  title: string
  content: string
  keywords: string
  sceneCategory: string
  productCategory: string
  customerType: string
  questionType: string
  priority: number
  sourceType: string
  status: string
  usageCount: number
  negativeFeedbackCount: number
  createTime: string
  updateTime: string
}

export interface CreateKnowledgeDto {
  title: string
  content: string
  keywords?: string
  sceneCategory: string
  productCategory?: string
  customerType?: string
  questionType?: string
  priority?: number
}

export interface QueryKnowledgeDto {
  page?: number
  limit?: number
  keyword?: string
  sceneCategory?: string
  productCategory?: string
  customerType?: string
  questionType?: string
  status?: string
  sourceType?: string
}

export interface IntelligentSearchDto {
  query: string
  limit?: number
  sceneCategory?: string
}

export interface BasicInfo {
  companyName: string
  industry: string
  companySize: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  address: string
}

export interface BusinessInfo {
  mainProducts: string[]
  customerTypes: string[]
  businessModel: string
  marketPosition: string
  competitiveAdvantages: string[]
}

export interface KnowledgeInitConfig {
  selectedIndustries: string[]
  autoImport: boolean
  customQuestions?: any[]
}

export interface FeedbackSubmitDto {
  knowledgeId: number
  feedbackScene: string
  userQuestion: string
  knowledgeAnswer: string
  feedbackReason: string
  expectedAnswer?: string
  customerId?: number
}

export interface MiningTask {
  id: number
  sourceType: string
  sourceIds: number[]
  dateRange: {
    startDate: string
    endDate: string
  }
  status: string
  totalCount: number
  extractedCount: number
  approvedCount: number
  rejectedCount: number
  createTime: string
}

// ==================== 企业基础信息初始化 ====================

export function getInitStatus() {
  return request({
    url: '/enterprise-knowledge/basic-info/status',
    method: 'get'
  })
}

export function initStep1(data: BasicInfo) {
  return request({
    url: '/enterprise-knowledge/basic-info/init-step1',
    method: 'post',
    data
  })
}

export function initStep2(data: BusinessInfo) {
  return request({
    url: '/enterprise-knowledge/basic-info/init-step2',
    method: 'post',
    data
  })
}

export function initStep3(data: KnowledgeInitConfig) {
  return request({
    url: '/enterprise-knowledge/basic-info/init-step3',
    method: 'post',
    data
  })
}

export function initStep4(data: any) {
  return request({
    url: '/enterprise-knowledge/basic-info/init-step4',
    method: 'post',
    data
  })
}

export function getBasicInfo() {
  return request({
    url: '/enterprise-knowledge/basic-info',
    method: 'get'
  })
}

// ==================== 知识库管理 ====================

export function createKnowledge(data: CreateKnowledgeDto) {
  return request({
    url: '/enterprise-knowledge',
    method: 'post',
    data
  })
}

export function updateKnowledge(id: number, data: Partial<CreateKnowledgeDto>) {
  return request({
    url: `/enterprise-knowledge/${id}`,
    method: 'put',
    data
  })
}

export function deleteKnowledge(id: number) {
  return request({
    url: `/enterprise-knowledge/${id}`,
    method: 'delete'
  })
}

export function getKnowledgeList(params: QueryKnowledgeDto) {
  return request({
    url: '/enterprise-knowledge/list',
    method: 'get',
    params
  })
}

export function getKnowledgeDetail(id: number) {
  return request({
    url: `/enterprise-knowledge/${id}`,
    method: 'get'
  })
}

export function intelligentSearch(data: IntelligentSearchDto) {
  return request({
    url: '/enterprise-knowledge/intelligent-search',
    method: 'post',
    data
  })
}

export function batchImport(data: any) {
  return request({
    url: '/enterprise-knowledge/batch-import',
    method: 'post',
    data
  })
}

export function getCategories() {
  return request({
    url: '/enterprise-knowledge/categories',
    method: 'get'
  })
}

export function getOverview() {
  return request({
    url: '/enterprise-knowledge/stats/overview',
    method: 'get'
  })
}

// ==================== 使用统计 ====================

export function getKnowledgeUsageStats(id: number) {
  return request({
    url: `/enterprise-knowledge/usage/stats/${id}`,
    method: 'get'
  })
}

export function getGlobalUsageStats() {
  return request({
    url: '/enterprise-knowledge/usage/global-stats',
    method: 'get'
  })
}

export function getHotKnowledge() {
  return request({
    url: '/enterprise-knowledge/usage/hot-knowledge',
    method: 'get'
  })
}

// ==================== AI知识挖掘 ====================

export function startMining(data: {
  sourceType: string
  sourceIds: number[]
  dateRange: {
    startDate: string
    endDate: string
  }
}) {
  return request({
    url: '/enterprise-knowledge/mining/start',
    method: 'post',
    data
  })
}

export function getMiningStatus(batchId: string) {
  return request({
    url: `/enterprise-knowledge/mining/status/${batchId}`,
    method: 'get'
  })
}

export function getPendingReview(params: {
  page?: number
  limit?: number
  sourceType?: string
  minScore?: number
}) {
  return request({
    url: '/enterprise-knowledge/mining/pending',
    method: 'get',
    params
  })
}

export function approveMining(id: number) {
  return request({
    url: `/enterprise-knowledge/mining/approve/${id}`,
    method: 'post'
  })
}

export function rejectMining(id: number, reason?: string) {
  return request({
    url: `/enterprise-knowledge/mining/reject/${id}`,
    method: 'post',
    data: { reason }
  })
}

export function getMiningBatches(params: {
  page?: number
  limit?: number
}) {
  return request({
    url: '/enterprise-knowledge/mining/batches',
    method: 'get',
    params
  })
}

// ==================== 负反馈管理 ====================

export function submitFeedback(data: FeedbackSubmitDto) {
  return request({
    url: '/enterprise-knowledge/feedback/submit',
    method: 'post',
    data
  })
}

export function getFeedbackList(params: {
  page?: number
  limit?: number
  knowledgeId?: number
  feedbackScene?: string
  handled?: boolean
}) {
  return request({
    url: '/enterprise-knowledge/feedback/list',
    method: 'get',
    params
  })
}

export function handleFeedback(id: number, data: {
  handleResult: string
  optimizationAction: string
}) {
  return request({
    url: `/enterprise-knowledge/feedback/handle/${id}`,
    method: 'post',
    data
  })
}

export function getFeedbackStats(knowledgeId: number) {
  return request({
    url: `/enterprise-knowledge/feedback/stats/${knowledgeId}`,
    method: 'get'
  })
}

export function getHighNegativeFeedback() {
  return request({
    url: '/enterprise-knowledge/feedback/high-negative',
    method: 'get'
  })
}

// ==================== 行业问题库 ====================

export function getIndustryQuestions(params: {
  industry?: string
  category?: string
  page?: number
  limit?: number
}) {
  return request({
    url: '/enterprise-knowledge/industry-questions',
    method: 'get',
    params
  })
}

export function importIndustryQuestions(data: {
  industry: string
  questionIds: number[]
}) {
  return request({
    url: '/enterprise-knowledge/industry-questions/import',
    method: 'post',
    data
  })
}

export function getRecommendedQuestions(industry: string) {
  return request({
    url: '/enterprise-knowledge/industry-questions/recommend',
    method: 'get',
    params: { industry }
  })
}
