<template>
  <view class="empty-state">
    <view class="empty-icon">{{ icon }}</view>
    <view class="empty-text">{{ text }}</view>
    <button v-if="buttonText" class="empty-btn" @click="handleAction">
      {{ buttonText }}
    </button>
  </view>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  text?: string
  buttonText?: string
}

withDefaults(defineProps<Props>(), {
  icon: '📭',
  text: '暂无数据',
  buttonText: ''
})

const emit = defineEmits<{
  (e: 'action'): void
}>()

function handleAction() {
  emit('action')
}
</script>

<style lang="scss" scoped>
.empty-state {
  padding: 120rpx 40rpx;
  text-align: center;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }

  .empty-btn {
    width: 300rpx;
    height: 80rpx;
    background: #3b82f6;
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
  }
}
</style>
