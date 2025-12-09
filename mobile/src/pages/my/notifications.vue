<template>
  <view class="notifications-page">
    <!-- 顶部操作栏 -->
    <view class="action-bar">
      <view class="tabs">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeTab === tab.value }"
          @click="handleTabChange(tab.value)"
        >
          <text>{{ tab.label }}</text>
          <text v-if="tab.value === 'unread' && unreadCount > 0" class="badge">{{ unreadCount }}</text>
        </view>
      </view>
      <view class="actions">
        <text class="action-btn" @click="handleMarkAllAsRead">全部已读</text>
        <text class="action-btn" @click="handleClearRead">清空已读</text>
      </view>
    </view>

    <!-- 筛选器 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view
          v-for="filter in filters"
          :key="filter.value"
          class="filter-item"
          :class="{ active: activeFilter === filter.value }"
          @click="handleFilterChange(filter.value)"
        >
          <text class="filter-icon">{{ filter.icon }}</text>
          <text class="filter-label">{{ filter.label }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 通知列表 -->
    <scroll-view
      scroll-y
      class="notification-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: notification.isRead === 0 }"
        @click="handleNotificationClick(notification)"
      >
        <view class="item-icon" :class="`type-${notification.type}`">
          <text>{{ getTypeIcon(notification.type) }}</text>
        </view>

        <view class="item-content">
          <view class="item-header">
            <text class="item-title">{{ notification.title }}</text>
            <text class="item-time">{{ formatTime(notification.createTime) }}</text>
          </view>
          <text class="item-desc">{{ notification.content }}</text>
        </view>

        <view class="item-actions">
          <text v-if="notification.isRead === 0" class="unread-dot"></text>
          <text class="delete-btn" @click.stop="handleDelete(notification.id)">删除</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="notifications.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">暂无通知消息</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="load-more">
        <text>上拉加载更多</text>
      </view>

      <!-- 没有更多了 -->
      <view v-if="!hasMore && notifications.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading && notifications.length === 0" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getNotificationList,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  type Notification,
  type NotificationType
} from '@/api/notification'

// 标签页
const tabs = [
  { label: '未读', value: 'unread' },
  { label: '全部', value: 'all' }
]

// 筛选器
const filters = [
  { label: '全部', value: 'all', icon: '📋' },
  { label: '跟进提醒', value: 'follow_reminder', icon: '⏰' },
  { label: '订单更新', value: 'order_update', icon: '📦' },
  { label: '系统通知', value: 'system', icon: '🔔' },
  { label: '高意向', value: 'high_intent', icon: '⭐' },
  { label: '客户分配', value: 'customer_assign', icon: '👥' },
  { label: '佣金发放', value: 'commission_paid', icon: '💰' }
]

const notifications = ref<Notification[]>([])
const activeTab = ref('unread')
const activeFilter = ref('all')
const loading = ref(false)
const refreshing = ref(false)
const unreadCount = ref(0)

// 分页相关
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const hasMore = computed(() => notifications.value.length < total.value)

/**
 * 过滤后的通知列表
 */
const filteredNotifications = computed(() => {
  let list = notifications.value

  // 按标签页筛选
  if (activeTab.value === 'unread') {
    list = list.filter(n => n.isRead === 0)
  }

  // 按类型筛选
  if (activeFilter.value !== 'all') {
    list = list.filter(n => n.type === activeFilter.value)
  }

  return list
})

/**
 * 加载通知列表
 */
async function loadNotifications(isLoadMore = false) {
  if (loading.value) return

  try {
    loading.value = true

    const params: any = {
      page: page.value,
      pageSize: pageSize.value
    }

    // 如果在未读标签页，只查询未读
    if (activeTab.value === 'unread') {
      params.isRead = 0
    }

    const result = await getNotificationList(params)

    if (isLoadMore) {
      notifications.value = [...notifications.value, ...result.list]
    } else {
      notifications.value = result.list
    }

    total.value = result.total
  } catch (error) {
    console.error('加载通知列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

/**
 * 加载未读数量
 */
async function loadUnreadCount() {
  try {
    const result = await getUnreadCount()
    unreadCount.value = result.count
  } catch (error) {
    console.error('加载未读数量失败:', error)
  }
}

/**
 * 切换标签页
 */
function handleTabChange(tab: string) {
  activeTab.value = tab
  page.value = 1
  loadNotifications()
}

/**
 * 切换筛选器
 */
function handleFilterChange(filter: string) {
  activeFilter.value = filter
}

/**
 * 点击通知
 */
async function handleNotificationClick(notification: Notification) {
  // 如果未读，标记为已读
  if (notification.isRead === 0) {
    try {
      await markAsRead(notification.id)
      notification.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 根据类型跳转到相关页面
  if (notification.relatedId) {
    switch (notification.type) {
      case 'follow_reminder':
      case 'high_intent':
      case 'customer_assign':
      case 'lifecycle_change':
        // 跳转到客户详情
        uni.navigateTo({
          url: `/pages/customer/detail?id=${notification.relatedId}`
        })
        break
      case 'order_update':
      case 'commission_paid':
        // 跳转到订单详情
        uni.navigateTo({
          url: `/pages/order/detail?id=${notification.relatedId}`
        })
        break
    }
  }
}

/**
 * 全部标记为已读
 */
function handleMarkAllAsRead() {
  uni.showModal({
    title: '提示',
    content: '确定要将所有通知标记为已读吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await markAllAsRead()
          notifications.value.forEach(n => n.isRead = 1)
          unreadCount.value = 0
          uni.showToast({
            title: '已全部标记为已读',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '操作失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

/**
 * 清空已读
 */
function handleClearRead() {
  uni.showModal({
    title: '提示',
    content: '确定要清空所有已读通知吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await clearReadNotifications()
          notifications.value = notifications.value.filter(n => n.isRead === 0)
          uni.showToast({
            title: '已清空已读通知',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '操作失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

/**
 * 删除通知
 */
function handleDelete(id: number) {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条通知吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteNotification(id)
          const index = notifications.value.findIndex(n => n.id === id)
          if (index !== -1) {
            const notification = notifications.value[index]
            if (notification.isRead === 0) {
              unreadCount.value = Math.max(0, unreadCount.value - 1)
            }
            notifications.value.splice(index, 1)
          }
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

/**
 * 下拉刷新
 */
function onRefresh() {
  refreshing.value = true
  page.value = 1
  loadNotifications()
  loadUnreadCount()
}

/**
 * 加载更多
 */
function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  loadNotifications(true)
}

/**
 * 获取类型图标
 */
function getTypeIcon(type: NotificationType): string {
  const iconMap: Record<NotificationType, string> = {
    follow_reminder: '⏰',
    order_update: '📦',
    commission_paid: '💰',
    system: '🔔',
    high_intent: '⭐',
    customer_assign: '👥',
    lifecycle_change: '🔄',
    batch_operation: '📋'
  }
  return iconMap[type] || '📌'
}

/**
 * 格式化时间
 */
function formatTime(timeStr: string): string {
  const time = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  const month = time.getMonth() + 1
  const date = time.getDate()
  return `${month}月${date}日`
}

onMounted(() => {
  loadNotifications()
  loadUnreadCount()
})
</script>

<style lang="scss" scoped>
.notifications-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.action-bar {
  background: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;

  .tabs {
    display: flex;
    gap: 40rpx;

    .tab-item {
      position: relative;
      font-size: 30rpx;
      color: #666;
      padding-bottom: 10rpx;

      &.active {
        color: #FFB800;
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4rpx;
          background: #FFB800;
          border-radius: 2rpx;
        }
      }

      .badge {
        position: absolute;
        top: -10rpx;
        right: -30rpx;
        background: #ff4444;
        color: #fff;
        font-size: 20rpx;
        padding: 2rpx 8rpx;
        border-radius: 20rpx;
        min-width: 28rpx;
        text-align: center;
      }
    }
  }

  .actions {
    display: flex;
    gap: 20rpx;

    .action-btn {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.filter-bar {
  background: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;

  .filter-scroll {
    white-space: nowrap;
    padding: 0 20rpx;

    .filter-item {
      display: inline-flex;
      align-items: center;
      padding: 12rpx 24rpx;
      margin-right: 20rpx;
      background: #f5f5f5;
      border-radius: 30rpx;
      font-size: 26rpx;
      color: #666;

      &.active {
        background: #FFB800;
        color: #fff;
      }

      .filter-icon {
        margin-right: 8rpx;
      }
    }
  }
}

.notification-list {
  flex: 1;
  padding: 0 20rpx;

  .notification-item {
    display: flex;
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    position: relative;

    &.unread {
      background: #fffbf0;
    }

    .item-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      margin-right: 20rpx;
      flex-shrink: 0;

      &.type-follow_reminder {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      &.type-order_update {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.type-system {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.type-high_intent {
        background: linear-gradient(135deg, #FFB800 0%, #FF9800 100%);
      }

      &.type-customer_assign {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      &.type-commission_paid {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    .item-content {
      flex: 1;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15rpx;

        .item-title {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          flex: 1;
        }

        .item-time {
          font-size: 24rpx;
          color: #999;
          margin-left: 20rpx;
        }
      }

      .item-desc {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }

    .item-actions {
      display: flex;
      align-items: center;
      margin-left: 20rpx;

      .unread-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background: #ff4444;
        margin-right: 20rpx;
      }

      .delete-btn {
        font-size: 24rpx;
        color: #ff4444;
        padding: 8rpx 16rpx;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 120rpx 0;

  .empty-icon {
    display: block;
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .empty-text {
    display: block;
    font-size: 28rpx;
    color: #999;
  }
}

.loading {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

.load-more,
.no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #999;
}
</style>
