<template>
  <view class="notifications-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="type in notificationTypes"
        :key="type.value"
        :class="['filter-item', { active: currentType === type.value }]"
        @click="handleFilterChange(type.value)"
      >
        {{ type.label }}
      </view>
    </view>

    <!-- 通知列表 -->
    <scroll-view
      class="notification-list"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view
        v-for="notification in notificationList"
        :key="notification.id"
        :class="['notification-item', { unread: !notification.isRead }]"
        @click="handleRead(notification)"
      >
        <view class="notification-header">
          <view class="notification-title">{{ notification.title }}</view>
          <view v-if="!notification.isRead" class="unread-badge"></view>
        </view>

        <view class="notification-content">{{ notification.content }}</view>

        <view class="notification-footer">
          <text class="notification-time">{{ formatRelativeTime(notification.createTime) }}</text>
          <text :class="['notification-type', `type-${notification.type}`]">
            {{ getTypeLabel(notification.type) }}
          </text>
        </view>
      </view>

      <view v-if="!loading && notificationList.length === 0" class="empty-list">
        <text>暂无通知消息</text>
      </view>

      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>

      <view v-if="!hasMore && notificationList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 全部已读按钮 -->
    <view class="bottom-actions" v-if="notificationList.some(n => !n.isRead)">
      <button class="action-btn" @click="markAllRead">全部已读</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatRelativeTime } from '@shared/utils'
import { http } from '@/utils/request'

interface Notification {
  id: number
  title: string
  content: string
  type: string
  isRead: boolean
  createTime: string
}

const notificationList = ref<Notification[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const currentType = ref<string | undefined>(undefined)

const queryParams = ref({
  page: 1,
  pageSize: 20,
  type: undefined as string | undefined
})

const notificationTypes = [
  { label: '全部', value: undefined },
  { label: '跟进提醒', value: 'follow_reminder' },
  { label: '订单更新', value: 'order_update' },
  { label: '系统通知', value: 'system' }
]

/**
 * 加载通知列表
 */
async function loadNotificationList(append = false) {
  if (loading.value) return

  try {
    loading.value = true
    const result = await http.get('/notification', queryParams.value)

    if (append) {
      notificationList.value = [...notificationList.value, ...result.list]
    } else {
      notificationList.value = result.list
    }

    hasMore.value = notificationList.value.length < result.total
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
 * 筛选类型
 */
function handleFilterChange(type: string | undefined) {
  currentType.value = type
  queryParams.value.type = type
  queryParams.value.page = 1
  loadNotificationList()
}

/**
 * 下拉刷新
 */
function onRefresh() {
  refreshing.value = true
  queryParams.value.page = 1
  loadNotificationList()
}

/**
 * 加载更多
 */
function loadMore() {
  if (!hasMore.value || loading.value) return

  queryParams.value.page += 1
  loadNotificationList(true)
}

/**
 * 标记已读
 */
async function handleRead(notification: Notification) {
  if (notification.isRead) return

  try {
    await http.put(`/notification/${notification.id}/read`)
    notification.isRead = true
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

/**
 * 全部已读
 */
async function markAllRead() {
  try {
    await http.put('/notification/read-all')
    notificationList.value.forEach(n => n.isRead = true)

    uni.showToast({
      title: '已全部标记为已读',
      icon: 'success'
    })
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

/**
 * 获取类型标签
 */
function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    follow_reminder: '跟进',
    order_update: '订单',
    system: '系统'
  }
  return typeMap[type] || '通知'
}

onMounted(() => {
  loadNotificationList()
})
</script>

<style lang="scss" scoped>
.notifications-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .filter-item {
    padding: 10rpx 30rpx;
    margin-right: 20rpx;
    background: #f5f5f5;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: #666;

    &.active {
      background: #3b82f6;
      color: #fff;
    }
  }
}

.notification-list {
  flex: 1;
  padding: 20rpx;

  .notification-item {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    &.unread {
      background: linear-gradient(to right, #fff 0%, #eff6ff 100%);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15rpx;

      .notification-title {
        flex: 1;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }

      .unread-badge {
        width: 16rpx;
        height: 16rpx;
        border-radius: 8rpx;
        background: #ef4444;
        margin-left: 15rpx;
      }
    }

    .notification-content {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 15rpx;
    }

    .notification-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .notification-time {
        font-size: 24rpx;
        color: #999;
      }

      .notification-type {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        color: #fff;

        &.type-follow_reminder {
          background: #3b82f6;
        }

        &.type-order_update {
          background: #f59e0b;
        }

        &.type-system {
          background: #6b7280;
        }
      }
    }
  }

  .empty-list,
  .loading-more,
  .no-more {
    text-align: center;
    padding: 60rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}

.bottom-actions {
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;

  .action-btn {
    width: 100%;
    height: 80rpx;
    background: #3b82f6;
    color: #fff;
    font-size: 28rpx;
  }
}
</style>
