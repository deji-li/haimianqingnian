/**
 * 客户相关API
 */
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQuery,
  PageResponse
} from '@shared/types'
import { http } from '@/utils/request'

/**
 * 获取客户列表
 */
export function getCustomerList(params: CustomerQuery) {
  return http.get<PageResponse<Customer>>('/customer', params)
}

/**
 * 获取客户详情
 */
export function getCustomerDetail(id: number) {
  return http.get<Customer>(`/customer/${id}`)
}

/**
 * 创建客户
 */
export function createCustomer(data: CreateCustomerDto) {
  return http.post<Customer>('/customer', data)
}

/**
 * 更新客户
 */
export function updateCustomer(id: number, data: UpdateCustomerDto) {
  return http.put<Customer>(`/customer/${id}`, data)
}

/**
 * 删除客户
 */
export function deleteCustomer(id: number) {
  return http.delete(`/customer/${id}`)
}

/**
 * 快速搜索客户
 */
export function searchCustomers(keyword: string) {
  return http.get<Customer[]>('/customer/search', { keyword })
}
