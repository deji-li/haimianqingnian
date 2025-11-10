/**
 * 订单相关API
 */
import type { Order, CreateOrderDto, OrderQuery, PageResponse } from '@shared/types'
import { http } from '@/utils/request'

/**
 * 获取订单列表
 */
export function getOrderList(params: OrderQuery) {
  return http.get<PageResponse<Order>>('/order', params)
}

/**
 * 获取订单详情
 */
export function getOrderDetail(id: number) {
  return http.get<Order>(`/order/${id}`)
}

/**
 * 创建订单
 */
export function createOrder(data: CreateOrderDto) {
  return http.post<Order>('/order', data)
}

/**
 * 获取客户订单历史
 */
export function getCustomerOrders(customerId: number) {
  return http.get<Order[]>(`/order/customer/${customerId}`)
}

/**
 * 获取订单统计
 */
export function getOrderStats(params: { startDate?: string; endDate?: string }) {
  return http.get('/order/statistics', params)
}
