/**
 * 跟进记录相关类型定义
 */

import type { IDField, Timestamps } from './common'

// 跟进类型
export type FollowType = 'phone' | 'wechat' | 'visit' | 'other'

// 跟进记录实体
export interface FollowRecord extends IDField {
  customerId: number
  followContent: string
  followTime: string
  operatorId: number
  nextFollowTime?: string
  createTime: string

  // 关联数据（查询时返回）
  operatorName?: string
  customerName?: string
}

// 创建跟进记录DTO
export interface CreateFollowDto {
  customerId: number
  followContent: string
  followTime?: string
  nextFollowTime?: string
}

// 跟进记录查询参数
export interface FollowQuery {
  page?: number
  pageSize?: number
  customerId?: number
  operatorId?: number
  startDate?: string
  endDate?: string
}
