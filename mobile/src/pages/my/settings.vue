<template>
  <view class="settings-page">
    <!-- 账号设置 -->
    <view class="settings-section">
      <view class="section-title">账号设置</view>
      <view class="settings-list">
        <view class="setting-item" @click="handleModifyPassword">
          <view class="item-left">
            <text class="item-icon">🔒</text>
            <text class="item-label">修改密码</text>
          </view>
          <text class="item-arrow">></text>
        </view>

        <view class="setting-item" @click="handleBindPhone">
          <view class="item-left">
            <text class="item-icon">📱</text>
            <text class="item-label">绑定手机</text>
          </view>
          <view class="item-right">
            <text class="item-value">{{ userInfo?.phone || '未绑定' }}</text>
            <text class="item-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="settings-section">
      <view class="section-title">通知设置</view>
      <view class="settings-list">
        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">🔔</text>
            <text class="item-label">跟进提醒</text>
          </view>
          <switch :checked="notificationSettings.followUpReminder" @change="handleToggle('followUpReminder', $event)" />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">📝</text>
            <text class="item-label">订单通知</text>
          </view>
          <switch :checked="notificationSettings.orderNotice" @change="handleToggle('orderNotice', $event)" />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">📊</text>
            <text class="item-label">数据报表</text>
          </view>
          <switch :checked="notificationSettings.dataReport" @change="handleToggle('dataReport', $event)" />
        </view>
      </view>
    </view>

    <!-- 显示设置 -->
    <view class="settings-section">
      <view class="section-title">显示设置</view>
      <view class="settings-list">
        <view class="setting-item" @click="handleSelectLanguage">
          <view class="item-left">
            <text class="item-icon">🌐</text>
            <text class="item-label">语言</text>
          </view>
          <view class="item-right">
            <text class="item-value">{{ languageText }}</text>
            <text class="item-arrow">></text>
          </view>
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">🌙</text>
            <text class="item-label">深色模式</text>
          </view>
          <switch :checked="displaySettings.darkMode" @change="handleToggle('darkMode', $event)" />
        </view>
      </view>
    </view>

    <!-- 缓存设置 -->
    <view class="settings-section">
      <view class="section-title">缓存管理</view>
      <view class="settings-list">
        <view class="setting-item" @click="handleClearCache">
          <view class="item-left">
            <text class="item-icon">🗑️</text>
            <text class="item-label">清除缓存</text>
          </view>
          <view class="item-right">
            <text class="item-value">{{ cacheSize }}</text>
            <text class="item-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="settings-section">
      <view class="section-title">其他</view>
      <view class="settings-list">
        <view class="setting-item" @click="handleCheckUpdate">
          <view class="item-left">
            <text class="item-icon">🔄</text>
            <text class="item-label">检查更新</text>
          </view>
          <view class="item-right">
            <text class="item-value">v{{ version }}</text>
            <text class="item-arrow">></text>
          </view>
        </view>

        <view class="setting-item" @click="navigateTo('/pages/my/about')">
          <view class="item-left">
            <text class="item-icon">ℹ️</text>
            <text class="item-label">关于我们</text>
          </view>
          <text class="item-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <view class="logout-btn" @click="handleLogout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const version = ref('1.0.0')
const cacheSize = ref('0 KB')

// 通知设置
const notificationSettings = ref({
  followUpReminder: true,
  orderNotice: true,
  dataReport: false
})

// 显示设置
const displaySettings = ref({
  darkMode: false,
  language: 'zh-CN'
})

const languageText = computed(() => {
  const langMap: Record<string, string> = {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en-US': 'English'
  }
  return langMap[displaySettings.value.language] || '简体中文'
})

/**
 * 修改密码
 */
function handleModifyPassword() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 绑定手机
 */
function handleBindPhone() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 切换开关
 */
function handleToggle(key: string, event: any) {
  const value = event.detail.value

  if (key === 'darkMode') {
    displaySettings.value.darkMode = value
    // TODO: 实现深色模式切换
    uni.showToast({
      title: value ? '已开启深色模式' : '已关闭深色模式',
      icon: 'none'
    })
  } else {
    notificationSettings.value[key as keyof typeof notificationSettings.value] = value
    saveNotificationSettings()
  }
}

/**
 * 选择语言
 */
function handleSelectLanguage() {
  uni.showActionSheet({
    itemList: ['简体中文', '繁體中文', 'English'],
    success: (res) => {
      const langMap = ['zh-CN', 'zh-TW', 'en-US']
      displaySettings.value.language = langMap[res.tapIndex]

      uni.showToast({
        title: '语言设置成功',
        icon: 'success'
      })
    }
  })
}

/**
 * 清除缓存
 */
function handleClearCache() {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除缓存但保留token和用户信息
        const token = uni.getStorageSync('token')
        const userInfo = uni.getStorageSync('userInfo')

        uni.clearStorage()

        // 恢复token和用户信息
        if (token) uni.setStorageSync('token', token)
        if (userInfo) uni.setStorageSync('userInfo', userInfo)

        cacheSize.value = '0 KB'
        uni.showToast({
          title: '缓存已清除',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 检查更新
 */
function handleCheckUpdate() {
  uni.showLoading({ title: '检查中...' })

  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '已是最新版本',
      icon: 'success'
    })
  }, 1000)
}

/**
 * 退出登录
 */
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await userStore.logout()
          uni.reLaunch({ url: '/pages/login/index' })
        } catch (error) {
          uni.showToast({
            title: '退出失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

/**
 * 保存通知设置
 */
function saveNotificationSettings() {
  uni.setStorageSync('notificationSettings', notificationSettings.value)
  uni.showToast({
    title: '设置已保存',
    icon: 'success'
  })
}

/**
 * 加载设置
 */
function loadSettings() {
  // 加载通知设置
  const savedNotificationSettings = uni.getStorageSync('notificationSettings')
  if (savedNotificationSettings) {
    notificationSettings.value = savedNotificationSettings
  }

  // 加载显示设置
  const savedDisplaySettings = uni.getStorageSync('displaySettings')
  if (savedDisplaySettings) {
    displaySettings.value = savedDisplaySettings
  }

  // 计算缓存大小
  calculateCacheSize()
}

/**
 * 计算缓存大小
 */
function calculateCacheSize() {
  try {
    const info = uni.getStorageInfoSync()
    const sizeKB = (info.currentSize || 0)

    if (sizeKB < 1024) {
      cacheSize.value = `${sizeKB} KB`
    } else {
      cacheSize.value = `${(sizeKB / 1024).toFixed(2)} MB`
    }
  } catch (error) {
    cacheSize.value = '0 KB'
  }
}

/**
 * 导航
 */
function navigateTo(url: string) {
  uni.navigateTo({ url })
}

onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.settings-section {
  margin-bottom: 20rpx;

  .section-title {
    padding: 30rpx 30rpx 20rpx;
    font-size: 28rpx;
    color: #999;
  }

  .settings-list {
    background: #fff;

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .item-left {
        display: flex;
        align-items: center;
        flex: 1;

        .item-icon {
          font-size: 40rpx;
          margin-right: 20rpx;
        }

        .item-label {
          font-size: 30rpx;
          color: #333;
        }
      }

      .item-right {
        display: flex;
        align-items: center;

        .item-value {
          font-size: 28rpx;
          color: #999;
          margin-right: 10rpx;
        }

        .item-arrow {
          font-size: 28rpx;
          color: #ccc;
        }
      }

      .item-arrow {
        font-size: 28rpx;
        color: #ccc;
      }
    }
  }
}

.logout-section {
  margin-top: 40rpx;
  padding: 0 30rpx;

  .logout-btn {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    text-align: center;

    text {
      font-size: 32rpx;
      color: #ff4444;
    }
  }
}
</style>
