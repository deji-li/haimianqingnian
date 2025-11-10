<template>
  <view class="login-container">
    <view class="login-box">
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">教育CRM</text>
        <text class="app-desc">移动办公，随时随地</text>
      </view>

      <view class="form-section">
        <view class="input-group">
          <view class="input-icon">
            <text class="iconfont">👤</text>
          </view>
          <input
            class="input"
            type="text"
            v-model="formData.username"
            placeholder="请输入用户名"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <text class="iconfont">🔒</text>
          </view>
          <input
            class="input"
            type="password"
            v-model="formData.password"
            placeholder="请输入密码"
            placeholder-class="input-placeholder"
          />
        </view>

        <button class="login-btn" type="primary" @click="handleLogin" :loading="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import type { LoginDto } from '@shared/types'

const userStore = useUserStore()

const formData = ref<LoginDto>({
  username: '',
  password: ''
})

const loading = ref(false)

/**
 * 处理登录
 */
async function handleLogin() {
  // 表单验证
  if (!formData.value.username) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }

  if (!formData.value.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true
    await userStore.login(formData.value)

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 500)
  } catch (error: any) {
    console.error('登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-box {
  width: 100%;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 80rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
  }

  .app-name {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .app-desc {
    display: block;
    font-size: 28rpx;
    color: #999;
  }
}

.form-section {
  .input-group {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 10rpx;
    margin-bottom: 30rpx;
    padding: 0 20rpx;

    .input-icon {
      font-size: 40rpx;
      margin-right: 20rpx;
    }

    .input {
      flex: 1;
      height: 90rpx;
      font-size: 28rpx;
    }

    .input-placeholder {
      color: #ccc;
    }
  }

  .login-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10rpx;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 40rpx;
  }
}
</style>
