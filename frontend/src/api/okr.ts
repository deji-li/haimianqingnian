import request from '@/utils/request'

export interface KeyResult {
  id: number
  okrId: number
  description: string
  targetValue: number
  currentValue: number
  unit?: string
  progress: number
  weight: number
  createTime: string
  updateTime: string
}

export interface Okr {
  id: number
  title: string
  description?: string
  ownerId: number
  ownerName?: string
  ownerUsername?: string
  type: string
  startDate: string
  endDate: string
  status: string
  progress: number
  createTime: string
  updateTime: string
  keyResults?: KeyResult[]
  keyResultCount?: number
}

export interface OkrQuery {
  page?: number
  pageSize?: number
  ownerId?: number
  type?: string
  status?: string
}

export interface OkrListResult {
  list: Okr[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateOkrParams {
  title: string
  description?: string
  ownerId: number
  type: string
  startDate: string
  endDate: string
  keyResults: {
    description: string
    targetValue: number
    unit?: string
    weight?: number
  }[]
}

export interface OkrStatistics {
  draft: { count: number; avgProgress: number }
  active: { count: number; avgProgress: number }
  completed: { count: number; avgProgress: number }
  cancelled: { count: number; avgProgress: number }
  total: { count: number; avgProgress: number }
}

// 获取OKR列表
export function getOkrList(params: OkrQuery) {
  return request<OkrListResult>({
    url: '/okr',
    method: 'get',
    params,
  })
}

// 获取OKR详情
export function getOkrDetail(id: number) {
  return request<Okr>({
    url: `/okr/${id}`,
    method: 'get',
  })
}

// 创建OKR
export function createOkr(data: CreateOkrParams) {
  return request<Okr>({
    url: '/okr',
    method: 'post',
    data,
  })
}

// 更新OKR
export function updateOkr(id: number, data: Partial<CreateOkrParams> & { status?: string; progress?: number }) {
  return request<Okr>({
    url: `/okr/${id}`,
    method: 'put',
    data,
  })
}

// 删除OKR
export function deleteOkr(id: number) {
  return request({
    url: `/okr/${id}`,
    method: 'delete',
  })
}

// 更新关键结果
export function updateKeyResult(id: number, data: {
  description?: string
  targetValue?: number
  currentValue?: number
  unit?: string
  weight?: number
}) {
  return request<KeyResult>({
    url: `/okr/key-result/${id}`,
    method: 'put',
    data,
  })
}

// 添加关键结果
export function addKeyResult(okrId: number, data: {
  description: string
  targetValue: number
  unit?: string
  weight?: number
}) {
  return request<KeyResult>({
    url: `/okr/${okrId}/key-result`,
    method: 'post',
    data,
  })
}

// 删除关键结果
export function deleteKeyResult(id: number) {
  return request({
    url: `/okr/key-result/${id}`,
    method: 'delete',
  })
}

// 获取OKR统计
export function getOkrStatistics(userId?: number) {
  return request<OkrStatistics>({
    url: '/okr/statistics',
    method: 'get',
    params: { userId },
  })
}
