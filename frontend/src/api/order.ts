import request from '@/utils/request'

export interface Order {
  id: number
  orderNo: string
  customerId?: number
  wechatId?: string
  wechatNickname?: string
  phone?: string
  salesId: number
  campusId?: number
  courseName: string
  paymentAmount: number
  paymentTime: Date
  isNewStudent: number
  orderStatus: string
  teacherName?: string
  region?: string
  distributorSales?: string
  remark?: string
  dataSource: string
  createTime: Date
  updateTime: Date
  salesName?: string
  campusName?: string
  customerName?: string
}

export interface OrderQuery {
  page: number
  pageSize: number
  keyword?: string
  salesId?: number
  campusId?: number
  orderStatus?: string
  isNewStudent?: number
  startDate?: string
  endDate?: string
}

export interface CreateOrderParams {
  orderNo: string
  customerId?: number
  wechatId?: string
  wechatNickname?: string
  phone?: string
  salesId: number
  campusId?: number
  courseName: string
  paymentAmount: number
  paymentTime: Date
  orderStatus?: string
  teacherName?: string
  region?: string
  distributorSales?: string
  remark?: string
}

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
  return request<Order[]>({
    url: `/order/customer/${customerId}`,
    method: 'get',
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
