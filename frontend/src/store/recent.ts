import { defineStore } from 'pinia'

interface RecentItem {
  id: number
  title: string  // 显示名称
  type: 'customer' | 'order'  // 类型
  visitTime: string  // 访问时间
  extra?: any  // 额外信息
}

interface RecentState {
  recentItems: RecentItem[]
}

const STORAGE_KEY = 'recent_visits'
const MAX_ITEMS = 10  // 最多保存10条

export const useRecentStore = defineStore('recent', {
  state: (): RecentState => ({
    recentItems: loadFromStorage(),
  }),

  getters: {
    // 获取最近访问的客户
    recentCustomers: (state) => {
      return state.recentItems
        .filter(item => item.type === 'customer')
        .slice(0, 5)
    },

    // 获取最近访问的订单
    recentOrders: (state) => {
      return state.recentItems
        .filter(item => item.type === 'order')
        .slice(0, 5)
    },
  },

  actions: {
    // 添加最近访问的客户
    addRecentCustomer(customer: { id: number; wechatNickname: string; phone?: string }) {
      const item: RecentItem = {
        id: customer.id,
        title: customer.wechatNickname || customer.phone || `客户${customer.id}`,
        type: 'customer',
        visitTime: new Date().toISOString(),
        extra: { phone: customer.phone }
      }
      this.addItem(item)
    },

    // 添加最近访问的订单
    addRecentOrder(order: { id: number; orderNo: string; customerName?: string }) {
      const item: RecentItem = {
        id: order.id,
        title: order.orderNo,
        type: 'order',
        visitTime: new Date().toISOString(),
        extra: { customerName: order.customerName }
      }
      this.addItem(item)
    },

    // 通用添加方法
    addItem(item: RecentItem) {
      // 移除相同的项
      this.recentItems = this.recentItems.filter(
        i => !(i.id === item.id && i.type === item.type)
      )

      // 添加到最前面
      this.recentItems.unshift(item)

      // 限制最大数量
      if (this.recentItems.length > MAX_ITEMS) {
        this.recentItems = this.recentItems.slice(0, MAX_ITEMS)
      }

      // 保存到 localStorage
      saveToStorage(this.recentItems)
    },

    // 清空最近访问
    clearRecent() {
      this.recentItems = []
      localStorage.removeItem(STORAGE_KEY)
    },

    // 删除指定项
    removeItem(id: number, type: 'customer' | 'order') {
      this.recentItems = this.recentItems.filter(
        item => !(item.id === id && item.type === type)
      )
      saveToStorage(this.recentItems)
    }
  },
})

// 从 localStorage 加载
function loadFromStorage(): RecentItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load recent visits:', error)
  }
  return []
}

// 保存到 localStorage
function saveToStorage(items: RecentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save recent visits:', error)
  }
}
