<template>
  <view class="home-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ userInfo?.realName || '未登录' }}</text>
          <text class="role">{{ userInfo?.roleName || '' }}</text>
        </view>
      </view>
      <view class="stats">
        <view class="stat-item">
          <text class="stat-value">{{ todayFollowCount }}</text>
          <text class="stat-label">今日跟进</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ pendingFollowCount }}</text>
          <text class="stat-label">待跟进</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ monthOrderCount }}</text>
          <text class="stat-label">本月订单</text>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-actions">
      <view class="action-item" @click="navigateTo('/pages/customer/add')">
        <view class="action-icon" style="background: #3b82f6;">
          <text>👤</text>
        </view>
        <text class="action-text">添加客户</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/customer/list')">
        <view class="action-icon" style="background: #10b981;">
          <text>📋</text>
        </view>
        <text class="action-text">客户列表</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/order/list')">
        <view class="action-icon" style="background: #f59e0b;">
          <text>📦</text>
        </view>
        <text class="action-text">订单管理</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/stats/index')">
        <view class="action-icon" style="background: #8b5cf6;">
          <text>📊</text>
        </view>
        <text class="action-text">数据统计</text>
      </view>
    </view>

    <!-- 待办事项 -->
    <view class="todo-section">
      <view class="section-header">
        <text class="section-title">待办事项</text>
        <text class="section-more" @click="navigateTo('/pages/customer/list')">查看更多 ></text>
      </view>
      <view v-if="pendingFollowList.length > 0" class="todo-list">
        <view
          v-for="item in pendingFollowList"
          :key="item.customerId"
          class="todo-item"
          @click="navigateTo(`/pages/customer/detail?id=${item.customerId}`)"
        >
          <view class="todo-content">
            <text class="customer-name">{{ item.customerName }}</text>
            <text class="follow-time">{{ formatDate(item.nextFollowTime) }}</text>
          </view>
          <text class="todo-arrow">></text>
        </view>
      </view>
      <view v-else class="empty-todo">
        <text>暂无待办事项</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { getTodayFollowList } from '@/api/follow'
import { getHomeStats } from '@/api/stats'
import { formatDate } from '@shared/utils'

const userStore = useUserStore()

// 初始化用户store
userStore.init()

const userInfo = computed(() => userStore.userInfo)

// 统计数据
const todayFollowCount = ref(0)
const pendingFollowCount = ref(0)
const monthOrderCount = ref(0)
const loading = ref(false)

// 待跟进列表
const pendingFollowList = ref<any[]>([])

/**
 * 页面导航
 */
function navigateTo(url: string) {
  if (url.includes('?')) {
    uni.navigateTo({ url })
  } else if (url.includes('/pages/customer/list') || url.includes('/pages/order/list') || url.includes('/pages/stats/index')) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

/**
 * 加载数据
 */
async function loadData() {
  if (loading.value) return

  try {
    loading.value = true

    // 并行加载统计数据和待跟进列表
    const [statsResult, followResult] = await Promise.allSettled([
      getHomeStats(),
      getTodayFollowList()
    ])

    // 处理统计数据
    if (statsResult.status === 'fulfilled' && statsResult.value) {
      todayFollowCount.value = statsResult.value.todayFollowCount || 0
      pendingFollowCount.value = statsResult.value.pendingFollowCount || 0
      monthOrderCount.value = statsResult.value.monthOrderCount || 0
    }

    // 处理待跟进列表
    if (followResult.status === 'fulfilled' && Array.isArray(followResult.value)) {
      pendingFollowList.value = followResult.value.slice(0, 5) // 只显示前5条
      if (!statsResult.value?.pendingFollowCount) {
        pendingFollowCount.value = followResult.value.length
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    uni.showToast({
      title: '数据加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  color: #fff;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      margin-right: 20rpx;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
    }

    .info {
      flex: 1;

      .name {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
      }

      .role {
        display: block;
        font-size: 28rpx;
        opacity: 0.8;
      }
    }
  }

  .stats {
    display: flex;
    justify-content: space-around;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 48rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
      }

      .stat-label {
        display: block;
        font-size: 24rpx;
        opacity: 0.8;
      }
    }
  }
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .action-item {
    width: 25%;
    text-align: center;
    margin-bottom: 20rpx;

    .action-icon {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50rpx;
      margin: 0 auto 15rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50rpx;
    }

    .action-text {
      display: block;
      font-size: 24rpx;
      color: #666;
    }
  }
}

.todo-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #999;
    }
  }

  .todo-list {
    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .todo-content {
        flex: 1;

        .customer-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }

        .follow-time {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }

      .todo-arrow {
        font-size: 28rpx;
        color: #ccc;
      }
    }
  }

  .empty-todo {
    text-align: center;
    padding: 60rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}
</style>
