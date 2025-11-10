/**
 * 客户相关API接口定义
 */

import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQuery,
  PageResponse,
} from '../types'

export interface CustomerApi {
  // 创建客户
  createCustomer(data: CreateCustomerDto): Promise<Customer>

  // 获取客户列表
  getCustomers(query: CustomerQuery): Promise<PageResponse<Customer>>

  // 获取客户详情
  getCustomerById(id: number): Promise<Customer>

  // 更新客户
  updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer>

  // 删除客户
  deleteCustomer(id: number): Promise<void>

  // 分配客户
  assignCustomer(id: number, salesId: number): Promise<void>

  // 批量导入客户
  importCustomers(data: CreateCustomerDto[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }>

  // 导出客户
  exportCustomers(query: CustomerQuery): Promise<Blob>
}
