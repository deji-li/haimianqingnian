import request from '@/utils/request'

// AI客户洞察相关
export function getCustomerInsights(params: any) {
  return request({
    url: '/ai-marketing/insights/list',
    method: 'get',
    params,
  })
}

export function getInsightStats() {
  return request({
    url: '/ai-marketing/insights/stats',
    method: 'get',
  })
}

export function getCustomerList() {
  return request({
    url: '/customer/list',
    method: 'get',
    params: { limit: 1000 },
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
    url: '/user/list',
    method: 'get',
    params: { limit: 1000 },
  })
}