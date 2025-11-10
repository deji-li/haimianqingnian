<template>
  <view class="error-boundary">
    <slot v-if="!hasError"></slot>

    <view v-else class="error-container">
      <view class="error-icon">⚠️</view>
      <view class="error-title">出错了</view>
      <view class="error-message">{{ errorMessage }}</view>
      <button class="retry-btn" @click="handleRetry">重试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

const emit = defineEmits<{
  (e: 'retry'): void
}>()

/**
 * 显示错误
 */
function showError(message: string) {
  hasError.value = true
  errorMessage.value = message || '加载失败，请稍后重试'
}

/**
 * 重置错误
 */
function reset() {
  hasError.value = false
  errorMessage.value = ''
}

/**
 * 重试
 */
function handleRetry() {
  reset()
  emit('retry')
}

defineExpose({
  showError,
  reset
})
</script>

<style lang="scss" scoped>
.error-container {
  padding: 120rpx 40rpx;
  text-align: center;

  .error-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .error-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .error-message {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 40rpx;
    line-height: 1.6;
  }

  .retry-btn {
    width: 300rpx;
    height: 80rpx;
    background: #3b82f6;
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
  }
}
</style>
