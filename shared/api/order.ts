/**
 * 订单相关API接口定义
 */

import type {
  Order,
  CreateOrderDto,
  OrderQuery,
  PageResponse,
  OrderStatus,
} from '../types'

export interface OrderApi {
  // 创建订单
  createOrder(data: CreateOrderDto): Promise<Order>

  // 获取订单列表
  getOrders(query: OrderQuery): Promise<PageResponse<Order>>

  // 获取订单详情
  getOrderById(id: number): Promise<Order>

  // 更新订单状态
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order>

  // 删除订单
  deleteOrder(id: number): Promise<void>

  // 导入订单
  importOrders(data: CreateOrderDto[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }>

  // 导出订单
  exportOrders(query: OrderQuery): Promise<Blob>

  // 获取订单统计
  getOrderStats(params: {
    startDate?: string
    endDate?: string
    salesId?: number
  }): Promise<{
    totalAmount: number
    totalCount: number
    newStudentCount: number
    oldStudentCount: number
  }>
}
