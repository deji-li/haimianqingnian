<template>
  <view class="wework-settings-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="header-title">企业微信设置</text>
      <text class="header-subtitle">配置企业微信集成参数</text>
    </view>

    <!-- 设置组件 -->
    <WeWorkSettings @config-saved="onConfigSaved" />

    <!-- 返回按钮 -->
    <view class="footer-actions">
      <button @click="goBack" class="back-btn">
        <uni-icons type="left" size="18" />
        返回
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { WeWorkConfigManager } from '@/utils/wework-config'
import WeWorkSettings from '@/components/wework/WeWorkSettings.vue'

const onConfigSaved = () => {
  console.log('企业微信配置已保存')
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.wework-settings-page {
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

.footer-actions {
  padding: 30rpx;
  padding-top: 10rpx;

  .back-btn {
    width: 100%;
    height: 88rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    font-size: 32rpx;
    color: #666;
    background: white;

    &:active {
      background: #f5f5f5;
    }
  }
}
</style>