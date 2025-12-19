import request from '@/utils/request'

// AI客户洞察相关
export function getCustomerInsights(params: any) {
  return request({
    url: '/ai-marketing/assistant/insights',
    method: 'get',
    params: {
      ...params,
      source: 'chat_analysis', // 指定使用聊天记录分析模式
    },
  })
}

export function getInsightStats(params: any = {}) {
  return request({
    url: '/ai-marketing/assistant/insights/stats',
    method: 'get',
    params,
  })
}

// 从聊天记录提取洞察
export function extractInsightsFromChat(data: { startDate?: string, endDate?: string }) {
  return request({
    url: '/ai-marketing/assistant/insights/extract',
    method: 'post',
    data,
  })
}

export function getCustomerList() {
  return request({
    url: '/customer',
    method: 'get',
    params: { pageSize: 100 },
  })
}

// AI员工质检相关
export function getQualityStats(params: any) {
  return request({
    url: '/ai-quality/stats',
    method: 'get',
    params,
  })
}

export function getSopList(params: any) {
  return request({
    url: '/ai-quality/sop-list',
    method: 'get',
    params,
  })
}

export function getViolationList(params: any) {
  return request({
    url: '/ai-quality/violation-list',
    method: 'get',
    params,
  })
}

export function getReportList(params: any) {
  return request({
    url: '/ai-quality/report-list',
    method: 'get',
    params,
  })
}

export function getUserList() {
  return request({
    url: '/user',
    method: 'get',
    params: { pageSize: 100 },
  })
}