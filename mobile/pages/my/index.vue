<template>
  <view class="my-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-header">
        <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-info">
          <text class="user-name">{{ userInfo?.realName || '未登录' }}</text>
          <text class="user-role">{{ userInfo?.roleName || '' }}</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="navigateTo('/pages/my/profile')">
        <view class="menu-left">
          <text class="menu-icon">👤</text>
          <text class="menu-title">个人信息</text>
        </view>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="navigateTo('/pages/my/notifications')">
        <view class="menu-left">
          <text class="menu-icon">🔔</text>
          <text class="menu-title">消息通知</text>
        </view>
        <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="navigateTo('/pages/my/settings')">
        <view class="menu-left">
          <text class="menu-icon">⚙️</text>
          <text class="menu-title">设置</text>
        </view>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="navigateTo('/pages/my/about')">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-title">关于我们</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>版本号: v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { http } from '@/utils/request'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const unreadCount = ref(0)

/**
 * 获取未读消息数
 */
async function getUnreadCount() {
  try {
    const result = await http.get('/notification/unread-count')
    unreadCount.value = result.count || 0
  } catch (error) {
    console.error('获取未读消息数失败:', error)
  }
}

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

onMounted(() => {
  getUnreadCount()
})
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx;
  color: #fff;

  .user-header {
    display: flex;
    align-items: center;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      margin-right: 30rpx;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
    }

    .user-info {
      flex: 1;

      .user-name {
        display: block;
        font-size: 40rpx;
        font-weight: bold;
        margin-bottom: 15rpx;
      }

      .user-role {
        display: block;
        font-size: 28rpx;
        opacity: 0.8;
      }
    }
  }
}

.menu-section {
  margin: 20rpx;
  background: #fff;
  border-radius: 15rpx;
  overflow: hidden;

  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 35rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .menu-left {
      display: flex;
      align-items: center;

      .menu-icon {
        font-size: 44rpx;
        margin-right: 25rpx;
      }

      .menu-title {
        font-size: 30rpx;
        color: #333;
      }
    }

    .badge {
      padding: 4rpx 12rpx;
      background: #ef4444;
      color: #fff;
      font-size: 20rpx;
      border-radius: 20rpx;
      margin-left: auto;
      margin-right: 20rpx;
    }

    .menu-arrow {
      font-size: 32rpx;
      color: #ccc;
    }
  }
}

.logout-section {
  padding: 40rpx 20rpx;

  .logout-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background: #fff;
    color: #ef4444;
    font-size: 30rpx;
    border-radius: 15rpx;
  }
}

.version-info {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
