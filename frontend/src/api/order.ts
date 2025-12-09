import request from '@/utils/request'
// 使用@shared包的类型定义
import type { Order, CreateOrderDto, OrderQuery, PageResponse } from '@shared/types'

// 重新导出类型，保持向后兼容
export type { Order, OrderQuery }

// 创建订单参数（使用shared的CreateOrderDto）
export type CreateOrderParams = CreateOrderDto

export interface OrderStatistics {
  totalOrders: number
  totalAmount: number
  newStudentOrders: number
  oldStudentOrders: number
  statusStats: Array<{ status: string; count: number }>
}

// 获取订单列表
export const getOrderList = (params: OrderQuery) => {
  return request<{ list: Order[]; total: number; page: number; pageSize: number }>({
    url: '/order',
    method: 'get',
    params,
  })
}

// 获取订单详情
export const getOrderDetail = (id: number) => {
  return request<Order>({
    url: `/order/${id}`,
    method: 'get',
  })
}

// 创建订单
export const createOrder = (data: CreateOrderParams) => {
  return request({
    url: '/order',
    method: 'post',
    data,
  })
}

// 更新订单
export const updateOrder = (id: number, data: Partial<CreateOrderParams>) => {
  return request({
    url: `/order/${id}`,
    method: 'patch',
    data,
  })
}

// 删除订单
export const deleteOrder = (id: number) => {
  return request({
    url: `/order/${id}`,
    method: 'delete',
  })
}

// 获取客户订单历史
export const getCustomerOrders = (customerId: number) => {
  return request({
    url: `/customer/${customerId}/orders`,
    method: 'get',
  })
}

// 绑定订单到客户
export const bindOrderToCustomer = (customerId: number, orderId: number) => {
  return request({
    url: `/customer/${customerId}/orders/bind`,
    method: 'post',
    data: { orderId },
  })
}

// 通过订单号绑定订单到客户
export const bindOrderByOrderNo = (customerId: number, orderNo: string) => {
  return request({
    url: `/customer/${customerId}/orders/bind-by-order-no`,
    method: 'post',
    data: { orderNo },
  })
}

// 解绑客户的订单
export const unbindOrderFromCustomer = (customerId: number, orderId: number) => {
  return request({
    url: `/customer/${customerId}/orders/${orderId}/unbind`,
    method: 'delete',
  })
}

// 获取可绑定的订单列表
export const getAvailableOrders = (customerId: number, params?: { keyword?: string; page?: number; pageSize?: number }) => {
  return request({
    url: `/customer/${customerId}/available-orders`,
    method: 'get',
    params,
  })
}

// 批量导入订单
export const importOrders = (orders: CreateOrderParams[]) => {
  return request<{ success: number; failed: number; errors: string[] }>({
    url: '/order/import',
    method: 'post',
    data: orders,
  })
}

// 获取订单统计数据
export const getOrderStatistics = (startDate?: string, endDate?: string) => {
  return request<OrderStatistics>({
    url: '/order/statistics',
    method: 'get',
    params: { startDate, endDate },
  })
}

// 校区排行榜数据类型
export interface CampusRanking {
  rank: number
  campusId: number
  campusName: string
  orderCount: number
  totalAmount: number
  newStudentCount: number
}

// 获取校区订单排行榜
export const getCampusRanking = (params: {
  period: string
  startDate?: string
  endDate?: string
}) => {
  return request<CampusRanking[]>({
    url: '/order/campus-ranking',
    method: 'get',
    params,
  })
}
