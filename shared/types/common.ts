/**
 * 通用类型定义
 */

// 分页查询参数
export interface PageQuery {
  page?: number
  pageSize?: number
  limit?: number
}

// 分页响应
export interface PageResponse<T> {
  list: T[]
  total: number
  page?: number
  pageSize?: number
}

// API响应
export interface ApiResponse<T = any> {
  code?: number
  message?: string
  data: T
}

// 时间戳字段
export interface Timestamps {
  createTime: string
  updateTime: string
}

// ID字段
export interface IDField {
  id: number
}
