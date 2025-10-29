import request from '@/utils/request'

export interface OperationLog {
  id: number
  userId: number
  username: string
  module: string
  action: string
  detail: string
  ipAddress: string
  userAgent: string
  status: number
  errorMsg: string
  createTime: string
}

export interface QueryLogParams {
  page?: number
  pageSize?: number
  username?: string
  module?: string
  startTime?: string
  endTime?: string
  status?: number
}

export interface LogListResponse {
  list: OperationLog[]
  total: number
  page: number
  pageSize: number
}

/**
 * 获取操作日志列表
 */
export const getLogList = (params: QueryLogParams) => {
  return request<LogListResponse>({
    url: '/log',
    method: 'get',
    params,
  })
}

/**
 * 获取操作模块列表
 */
export const getModules = () => {
  return request<string[]>({
    url: '/log/modules',
    method: 'get',
  })
}

/**
 * 获取日志详情
 */
export const getLogDetail = (id: number) => {
  return request<OperationLog>({
    url: `/log/${id}`,
    method: 'get',
  })
}

/**
 * 清理30天前的日志
 */
export const cleanOldLogs = () => {
  return request<{ message: string; count: number }>({
    url: '/log/clean',
    method: 'delete',
  })
}
