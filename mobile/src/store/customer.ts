/**
 * 客户状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Customer, CustomerQuery } from '@shared/types'
import { getCustomerList, getCustomerDetail } from '@/api/customer'

export const useCustomerStore = defineStore('customer', () => {
  // 状态
  const customerList = ref<Customer[]>([])
  const currentCustomer = ref<Customer | null>(null)
  const total = ref(0)
  const loading = ref(false)

  /**
   * 加载客户列表
   */
  async function loadCustomerList(query: CustomerQuery) {
    try {
      loading.value = true
      const result = await getCustomerList(query)
      customerList.value = result.list
      total.value = result.total
      return result
    } catch (error) {
      console.error('加载客户列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载客户详情
   */
  async function loadCustomerDetail(id: number) {
    try {
      loading.value = true
      const customer = await getCustomerDetail(id)
      currentCustomer.value = customer
      return customer
    } catch (error) {
      console.error('加载客户详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除当前客户
   */
  function clearCurrentCustomer() {
    currentCustomer.value = null
  }

  return {
    // 状态
    customerList,
    currentCustomer,
    total,
    loading,

    // 方法
    loadCustomerList,
    loadCustomerDetail,
    clearCurrentCustomer
  }
})
