/**
 * 订单相关类型定义
 */

import type { IDField, Timestamps } from './common'

// 订单状态
export type OrderStatus = '待上课' | '上课中' | '已完成' | '已退款'

// 数据来源
export type DataSource = '手工录入' | '小程序导入'

// 订单实体
export interface Order extends IDField, Timestamps {
  orderNo: string
  customerId?: number
  wechatId?: string
  wechatNickname?: string
  phone?: string
  salesId: number
  campusId?: number
  courseName: string
  paymentAmount: number
  paymentTime: string
  isNewStudent: boolean
  orderStatus: OrderStatus
  teacherName?: string
  region?: string
  distributorSales?: string
  remark?: string
  dataSource: DataSource
  orderTag?: string

  // 提成相关
  commissionSchemeId?: number
  commissionAmount: number
  commissionCalculatedAt?: string
}

// 创建订单DTO
export interface CreateOrderDto {
  customerId?: number
  wechatId?: string
  wechatNickname?: string
  phone?: string
  courseName: string
  paymentAmount: number
  paymentTime: string
  isNewStudent?: boolean
  campusId?: number
  teacherName?: string
  orderTag?: string
  remark?: string
}

// 订单查询参数
export interface OrderQuery {
  page?: number
  pageSize?: number
  orderStatus?: OrderStatus
  salesId?: number
  customerId?: number
  startDate?: string
  endDate?: string
  keyword?: string
}
