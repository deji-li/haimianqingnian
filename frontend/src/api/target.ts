import request from '@/utils/request'

export interface SalesTarget {
  id: number
  userId: number
  userName: string
  targetType: string
  targetAmount: number
  actualAmount: number
  targetCount: number
  actualCount: number
  startDate: string
  endDate: string
  status: number
  remark: string
  amountProgress: number
  countProgress: number
  createTime: string
  updateTime: string
}

export interface CreateTargetParams {
  userId: number
  targetType: string
  targetAmount: number
  targetCount: number
  startDate: string
  endDate: string
  remark?: string
}

export interface UpdateTargetParams {
  targetAmount?: number
  targetCount?: number
  startDate?: string
  endDate?: string
  status?: number
  remark?: string
}

export interface TargetProgress {
  targetId: number
  userId: number
  userName: string
  targetType: string
  targetAmount: number
  actualAmount: number
  targetCount: number
  actualCount: number
  amountProgress: number
  countProgress: number
  remainingDays: number
  startDate: string
  endDate: string
}

// 创建销售目标
export const createTarget = (data: CreateTargetParams) => {
  return request({
    url: '/target',
    method: 'post',
    data,
  })
}

// 获取销售目标列表
export const getTargetList = (userId?: number) => {
  console.log('[API] getTargetList 调用, userId:', userId)
  const promise = request<SalesTarget[]>({
    url: '/target',
    method: 'get',
    params: userId ? { userId } : {},
  })

  promise.then(data => {
    console.log('[API] getTargetList 响应成功:', data)
  }).catch(error => {
    console.error('[API] getTargetList 响应失败:', error)
  })

  return promise
}

// 获取销售目标详情
export const getTargetDetail = (id: number) => {
  return request<SalesTarget>({
    url: `/target/${id}`,
    method: 'get',
  })
}

// 获取用户目标进度（工作台用）
export const getTargetProgress = (userId: number) => {
  return request<TargetProgress[]>({
    url: `/target/progress/${userId}`,
    method: 'get',
  })
}

// 更新销售目标
export const updateTarget = (id: number, data: UpdateTargetParams) => {
  return request({
    url: `/target/${id}`,
    method: 'put',
    data,
  })
}

// 删除销售目标
export const deleteTarget = (id: number) => {
  return request({
    url: `/target/${id}`,
    method: 'delete',
  })
}

// 刷新目标实际完成数据
export const refreshTargetActual = (id: number) => {
  return request({
    url: `/target/${id}/refresh`,
    method: 'post',
  })
}

// 批量刷新所有活跃目标的实际完成数据
export const refreshAllTargetActual = () => {
  return request({
    url: '/target/refresh-all',
    method: 'post',
  })
}
