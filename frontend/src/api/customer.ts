import request from '@/utils/request'
// 使用@shared包的类型定义
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQuery,
  FollowRecord,
  CreateFollowDto,
  PageResponse,
} from '@shared/types'

// 重新导出类型，保持向后兼容
export type { Customer, CustomerQuery, FollowRecord }

// 扩展的客户列表结果类型（包含额外的前端字段）
export interface CustomerListResult extends PageResponse<Customer> {
  page: number
  pageSize: number
  totalPages: number
}

// 创建客户参数（使用shared的CreateCustomerDto）
export type CreateCustomerParams = CreateCustomerDto

// 创建跟进记录参数（使用shared的CreateFollowDto）
export type CreateFollowRecordParams = CreateFollowDto

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

// 批量更新客户
export interface BatchUpdateCustomerParams {
  ids: number[]
  salesId?: number
  customerIntent?: string
  operatorId?: number
}

export function batchUpdateCustomer(data: BatchUpdateCustomerParams) {
  return request<{ success: boolean; message: string; count: number }>({
    url: '/customer/batch/update',
    method: 'put',
    data,
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

// 获取待回访客户列表
export function getPendingFollowUps() {
  return request<Customer[]>({
    url: '/customer/pending-followups/list',
    method: 'get',
  })
}

// 获取跟进统计
export interface FollowStatistics {
  todayFollow: number
  weekFollow: number
  monthFollow: number
  pendingFollow: number
  overdueFollow: number
  totalCustomers: number
}

export function getFollowStatistics() {
  return request<FollowStatistics>({
    url: '/customer/follow/statistics',
    method: 'get',
  })
}

// AI智能创建客户
export interface SmartCreateCustomerParams {
  imageBase64List?: string[]
  imageUrls?: string[]
  imageFileIds?: number[]
  knownInfo?: {
    wechatId?: string
    wechatNickname?: string
    phone?: string
  }
}

export interface SmartCreateCustomerResponse {
  success: boolean
  customerId: number
  message: string
  customer: Customer
}

export function smartCreateCustomer(data: SmartCreateCustomerParams) {
  return request<SmartCreateCustomerResponse>({
    url: '/customer/smart-create',
    method: 'post',
    data,
  })
}

// 导出客户数据为Excel
export function exportCustomersToExcel(params: CustomerQuery) {
  return request<Blob>({
    url: '/customer/export/excel',
    method: 'get',
    params,
    responseType: 'blob',
  })
}
