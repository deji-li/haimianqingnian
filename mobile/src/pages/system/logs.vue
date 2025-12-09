<template>
  <view class="logs-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="header-title">操作日志</text>
      <text class="header-subtitle">查看系统操作记录</text>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">日志类型</text>
          <picker
            mode="selector"
            :range="logTypes"
            range-key="label"
            :value="logTypeIndex"
            @change="onLogTypeChange"
          >
            <view class="picker-view">
              <text class="picker-text">{{ logTypes[logTypeIndex].label }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">日期范围</text>
          <picker
            mode="date"
            :value="endDate"
            @change="onEndDateChange"
          >
            <view class="picker-view">
              <text class="picker-text">{{ endDate || '结束日期' }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>

      <view class="filter-actions">
        <button @click="loadLogs" class="action-btn search">
          <uni-icons type="search" size="16" />
          查询
        </button>
        <button @click="exportLogs" class="action-btn export">
          <uni-icons type="download" size="16" />
          导出
        </button>
      </view>
    </view>

    <!-- 日志列表 -->
    <view class="logs-list">
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" />
      </view>

      <view v-else-if="logs.length === 0" class="empty-container">
        <text class="empty-text">暂无日志记录</text>
      </view>

      <view v-else>
        <view
          v-for="log in logs"
          :key="log.id"
          class="log-item"
          :class="log.status"
        >
          <view class="log-header">
            <view class="log-left">
              <view class="log-type">{{ getLogTypeLabel(log.type) }}</view>
              <text class="log-time">{{ formatTime(log.timestamp) }}</text>
            </view>
            <view class="log-status">
              <uni-icons
                :type="getStatusIcon(log.status)"
                :color="getStatusColor(log.status)"
                size="14"
              />
            </view>
          </view>

          <view class="log-content">
            <text class="log-message">{{ log.message }}</text>
            <text v-if="log.details" class="log-details">{{ log.details }}</text>
          </view>

          <view class="log-meta">
            <text class="log-user">操作人: {{ log.userName }}</text>
            <text class="log-ip">IP: {{ log.ipAddress }}</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more" @click="loadMore">
          <uni-load-more :status="loadMoreStatus" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 响应式数据
const loading = ref(false)
const logs = ref<any[]>([])
const currentPage = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loadMoreStatus = ref('more')

// 筛选条件
const logTypes = [
  { label: '全部', value: 'all' },
  { label: '用户操作', value: 'user' },
  { label: '系统操作', value: 'system' },
  { label: '企业微信', value: 'wework' },
  { label: '错误日志', value: 'error' }
]

const logTypeIndex = ref(0)
const startDate = ref('')
const endDate = ref('')

// 方法
const loadLogs = async (reset = true) => {
  if (loading.value && !reset) return

  try {
    loading.value = true

    if (reset) {
      currentPage.value = 1
      logs.value = []
    }

    const response = await uni.request({
      url: '/api/system/logs',
      method: 'GET',
      data: {
        page: currentPage.value,
        limit: pageSize,
        type: logTypes[logTypeIndex.value].value === 'all' ? undefined : logTypes[logTypeIndex.value].value,
        startDate: startDate.value,
        endDate: endDate.value
      }
    })

    if (response.statusCode === 200 && response.data.success) {
      const newLogs = response.data.logs || []

      if (reset) {
        logs.value = newLogs
      } else {
        logs.value.push(...newLogs)
      }

      hasMore.value = newLogs.length === pageSize
      loadMoreStatus.value = hasMore.value ? 'more' : 'noMore'
    } else {
      uni.showToast({
        title: '加载日志失败',
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('加载日志失败:', error)
    uni.showToast({
      title: '加载日志失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    currentPage.value++
    loadMoreStatus.value = 'loading'
    loadLogs(false)
  }
}

const onLogTypeChange = (e: any) => {
  logTypeIndex.value = e.detail.value
}

const onStartDateChange = (e: any) => {
  startDate.value = e.detail.value
}

const onEndDateChange = (e: any) => {
  endDate.value = e.detail.value
}

const exportLogs = async () => {
  try {
    uni.showLoading({ title: '导出中...' })

    const response = await uni.request({
      url: '/api/system/logs/export',
      method: 'GET',
      data: {
        type: logTypes[logTypeIndex.value].value === 'all' ? undefined : logTypes[logTypeIndex.value].value,
        startDate: startDate.value,
        endDate: endDate.value
      }
    })

    if (response.statusCode === 200 && response.data.success) {
      // 触发下载
      const downloadUrl = response.data.downloadUrl
      uni.downloadFile({
        url: downloadUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.showToast({
              title: '导出成功',
              icon: 'success'
            })
          }
        }
      })
    } else {
      uni.showToast({
        title: '导出失败',
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('导出失败:', error)
    uni.showToast({
      title: '导出失败',
      icon: 'error'
    })
  } finally {
    uni.hideLoading()
  }
}

const getLogTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    user: '用户操作',
    system: '系统操作',
    wework: '企业微信',
    error: '错误日志',
    login: '登录操作',
    logout: '登出操作'
  }
  return typeMap[type] || type
}

const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    success: 'checkmarkempty',
    warning: 'info',
    error: 'closeempty'
  }
  return iconMap[status] || 'info'
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  }
  return colorMap[status] || '#999'
}

const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch {
    return timestamp
  }
}

// 页面加载时获取日志
onMounted(() => {
  // 设置默认日期范围（最近7天）
  const today = new Date()
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  endDate.value = today.toISOString().split('T')[0]
  startDate.value = lastWeek.toISOString().split('T')[0]

  loadLogs()
})
</script>

<style lang="scss" scoped>
.logs-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 30rpx 40rpx;
  color: white;

  .header-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.filter-section {
  background: white;
  margin: 20rpx;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .filter-row {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;

    .filter-item {
      flex: 1;

      .filter-label {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 10rpx;
      }

      .picker-view {
        height: 70rpx;
        border: 2rpx solid #e0e0e0;
        border-radius: 8rpx;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .picker-text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }

  .filter-actions {
    display: flex;
    gap: 20rpx;

    .action-btn {
      flex: 1;
      height: 70rpx;
      border-radius: 35rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      font-size: 28rpx;
      border: none;

      &.search {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
      }

      &.export {
        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        color: white;
      }
    }
  }
}

.logs-list {
  padding: 0 20rpx;

  .loading-container,
  .empty-container {
    padding: 100rpx 0;
    text-align: center;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .log-item {
    background: white;
    border-radius: 15rpx;
    margin-bottom: 15rpx;
    padding: 30rpx;
    border-left: 6rpx solid #ddd;

    &.success {
      border-left-color: #4caf50;
    }

    &.warning {
      border-left-color: #ff9800;
    }

    &.error {
      border-left-color: #f44336;
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15rpx;

      .log-left {
        display: flex;
        align-items: center;
        gap: 15rpx;

        .log-type {
          background: #f5f5f5;
          padding: 6rpx 12rpx;
          border-radius: 10rpx;
          font-size: 22rpx;
          color: #666;
        }

        .log-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .log-status {
        width: 28rpx;
        height: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .log-content {
      margin-bottom: 15rpx;

      .log-message {
        display: block;
        font-size: 28rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 8rpx;
      }

      .log-details {
        display: block;
        font-size: 24rpx;
        color: #666;
        background: #f8f9fa;
        padding: 15rpx;
        border-radius: 8rpx;
      }
    }

    .log-meta {
      display: flex;
      justify-content: space-between;
      font-size: 22rpx;
      color: #999;

      .log-user,
      .log-ip {
        background: #f0f0f0;
        padding: 4rpx 8rpx;
        border-radius: 6rpx;
      }
    }
  }

  .load-more {
    padding: 20rpx 0;
  }
}
</style>