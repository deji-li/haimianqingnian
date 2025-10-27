import request from '@/utils/request'

export interface Customer {
  id: number
  wechatNickname: string
  wechatId: string
  phone?: string
  realName?: string
  trafficSource?: string
  operatorId?: number
  salesId: number
  salesWechat?: string
  customerIntent: string
  nextFollowTime?: string
  remark?: string
  createTime: string
  updateTime: string
  salesName?: string
  operatorName?: string
  followRecordCount?: number
}

export interface CustomerQuery {
  page?: number
  pageSize?: number
  keyword?: string
  customerIntent?: string
  trafficSource?: string
  salesId?: number
}

export interface CustomerListResult {
  list: Customer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateCustomerParams {
  wechatNickname?: string
  wechatId: string
  phone?: string
  realName?: string
  trafficSource?: string
  operatorId?: number
  salesId: number
  salesWechat?: string
  customerIntent?: string
  nextFollowTime?: string
  remark?: string
}

export interface FollowRecord {
  id: number
  customerId: number
  followContent: string
  followTime: string
  operatorId: number
  nextFollowTime?: string
  createTime: string
  operatorName?: string
}

export interface CreateFollowRecordParams {
  customerId: number
  followContent: string
  nextFollowTime?: string
}

// 获取客户列表
export function getCustomerList(params: CustomerQuery) {
  return request<CustomerListResult>({
    url: '/customer',
    method: 'get',
    params,
  })
}

// 获取客户详情
export function getCustomerDetail(id: number) {
  return request<Customer>({
    url: `/customer/${id}`,
    method: 'get',
  })
}

// 创建客户
export function createCustomer(data: CreateCustomerParams) {
  return request<Customer>({
    url: '/customer',
    method: 'post',
    data,
  })
}

// 更新客户
export function updateCustomer(id: number, data: Partial<CreateCustomerParams>) {
  return request<Customer>({
    url: `/customer/${id}`,
    method: 'put',
    data,
  })
}

// 删除客户
export function deleteCustomer(id: number) {
  return request({
    url: `/customer/${id}`,
    method: 'delete',
  })
}

// 快速搜索客户
export function searchCustomers(keyword: string) {
  return request<Customer[]>({
    url: '/customer/search',
    method: 'get',
    params: { keyword },
  })
}

// 获取客户跟进记录
export function getFollowRecords(customerId: number) {
  return request<FollowRecord[]>({
    url: `/customer/${customerId}/follow-records`,
    method: 'get',
  })
}

// 创建跟进记录
export function createFollowRecord(data: CreateFollowRecordParams) {
  return request<FollowRecord>({
    url: '/customer/follow-record',
    method: 'post',
    data,
  })
}
