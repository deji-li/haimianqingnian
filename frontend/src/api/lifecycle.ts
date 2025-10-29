import request from '@/utils/request'

export interface LifecycleHistory {
  id: number
  customerId: number
  stage: string
  changeReason: string
  operatorId: number
  operatorName: string
  createTime: string
}

export interface LifecycleStatistics {
  stage: string
  count: number
  percentage: number
}

export interface CreateLifecycleParams {
  customerId: number
  stage: string
  changeReason?: string
  operatorId: number
}

// 创建生命周期记录
export const createLifecycle = (data: CreateLifecycleParams) => {
  return request({
    url: '/lifecycle',
    method: 'post',
    data,
  })
}

// 获取客户生命周期历史
export const getLifecycleHistory = (customerId: number) => {
  return request<LifecycleHistory[]>({
    url: `/lifecycle/history/${customerId}`,
    method: 'get',
  })
}

// 获取生命周期统计
export const getLifecycleStatistics = () => {
  return request<LifecycleStatistics[]>({
    url: '/lifecycle/statistics',
    method: 'get',
  })
}

// 获取指定阶段的客户
export const getCustomersByStage = (stage: string) => {
  return request<any[]>({
    url: `/lifecycle/stage/${stage}`,
    method: 'get',
  })
}

// 批量更新生命周期阶段
export const batchUpdateLifecycle = (customerIds: number[], stage: string, changeReason?: string) => {
  return request({
    url: '/lifecycle/batch-update',
    method: 'post',
    data: { customerIds, stage, changeReason },
  })
}
