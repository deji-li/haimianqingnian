<template>
  <view v-if="showStatus && isWeWork" class="wework-status" :class="statusClass">
    <view class="status-content">
      <view class="status-left">
        <view class="status-icon">
          <uni-icons :type="statusIcon" :color="statusIconColor" size="16" />
        </view>
        <text class="status-text">{{ statusText }}</text>
      </view>

      <view class="status-right" v-if="showActions">
        <button v-if="showReconnect" @click="handleReconnect" class="status-btn" size="mini">
          重新连接
        </button>
        <button v-if="showSettings" @click="handleSettings" class="status-btn" size="mini">
          设置
        </button>
      </view>
    </view>

    <!-- 详细状态信息 -->
    <view v-if="showDetails && config" class="status-details">
      <text class="detail-item">企业ID: {{ config.corpId ? '已配置' : '未配置' }}</text>
      <text class="detail-item">应用ID: {{ config.agentId || '未配置' }}</text>
      <text class="detail-item" v-if="lastSyncTime">最后同步: {{ formatTime(lastSyncTime) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { WeWorkEnv } from '@/utils/wework-env'
import { weworkApi } from '@/api/wework'

interface Props {
  showStatus?: boolean
  showActions?: boolean
  showReconnect?: boolean
  showSettings?: boolean
  showDetails?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: true,
  showActions: true,
  showReconnect: true,
  showSettings: true,
  showDetails: false,
  compact: false
})

// 响应式数据
const config = ref<any>(null)
const connectionStatus = ref<'connected' | 'disconnected' | 'unknown'>('unknown')
const lastSyncTime = ref<string | null>(null)
const loading = ref(false)

// 计算属性
const isWeWork = computed(() => WeWorkEnv.isWeWork())

const statusClass = computed(() => ({
  'connected': connectionStatus.value === 'connected',
  'disconnected': connectionStatus.value === 'disconnected',
  'compact': props.compact
}))

const statusIcon = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'checkmarkempty'
    case 'disconnected':
      return 'closeempty'
    default:
      return 'info'
  }
})

const statusIconColor = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return '#4caf50'
    case 'disconnected':
      return '#f44336'
    default:
      return '#ff9800'
  }
})

const statusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return '企业微信已连接'
    case 'disconnected':
      return '企业微信未连接'
    default:
      return '检查企业微信状态...'
  }
})

// 方法
const checkConnectionStatus = async () => {
  try {
    loading.value = true

    // 获取企业微信配置
    const configResponse = await weworkApi.getConfig()
    if (configResponse.success) {
      config.value = configResponse.config

      if (configResponse.config.isActive) {
        // 测试连接状态
        const testResponse = await weworkApi.testConnection({
          corpId: configResponse.config.corpId,
          agentId: configResponse.config.agentId,
          secret: '***' // 不发送真实secret进行状态检查
        })

        connectionStatus.value = testResponse.success ? 'connected' : 'disconnected'
      } else {
        connectionStatus.value = 'disconnected'
      }

      // 获取同步状态
      const syncResponse = await weworkApi.getSyncStatus()
      if (syncResponse.success && syncResponse.status.lastSyncTime) {
        lastSyncTime.value = syncResponse.status.lastSyncTime
      }
    } else {
      connectionStatus.value = 'disconnected'
    }
  } catch (error) {
    console.error('检查企业微信连接状态失败:', error)
    connectionStatus.value = 'disconnected'
  } finally {
    loading.value = false
  }
}

const handleReconnect = async () => {
  if (loading.value) return

  try {
    loading.value = true
    await checkConnectionStatus()

    uni.showToast({
      title: connectionStatus.value === 'connected' ? '连接成功' : '连接失败',
      icon: connectionStatus.value === 'connected' ? 'success' : 'error'
    })
  } catch (error) {
    uni.showToast({
      title: '重连失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleSettings = () => {
  uni.navigateTo({
    url: '/pages/system/wework-config'
  })
}

const formatTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleDateString()
    }
  } catch {
    return timeStr
  }
}

// 组件挂载时检查状态
onMounted(() => {
  if (isWeWork.value && props.showStatus) {
    checkConnectionStatus()
  }
})

// 暴露方法给父组件
defineExpose({
  checkConnectionStatus,
  connectionStatus,
  config
})
</script>

<style lang="scss" scoped>
.wework-status {
  margin: 10rpx 20rpx;
  border-radius: 10rpx;
  overflow: hidden;
  border: 2rpx solid #e0e0e0;

  &.connected {
    border-color: #4caf50;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%);
  }

  &.disconnected {
    border-color: #f44336;
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(244, 67, 54, 0.1) 100%);
  }

  &.compact {
    margin: 5rpx 20rpx;
  }

  .status-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;

    .status-left {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .status-icon {
        width: 32rpx;
        height: 32rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      }

      .status-text {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
      }
    }

    .status-right {
      display: flex;
      gap: 10rpx;

      .status-btn {
        height: 60rpx;
        padding: 0 20rpx;
        border: none;
        border-radius: 30rpx;
        font-size: 24rpx;
        background: rgba(255, 255, 255, 0.9);
        color: #666;
        box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }

  .status-details {
    padding: 0 20rpx 20rpx;
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.5);

    .detail-item {
      display: block;
      font-size: 24rpx;
      color: #666;
      padding: 8rpx 0;

      &:first-child {
        padding-top: 15rpx;
      }
    }
  }
}

// 响应式适配
@media screen and (max-width: 750rpx) {
  .wework-status {
    .status-content {
      padding: 15rpx;

      .status-left {
        .status-text {
          font-size: 26rpx;
        }
      }

      .status-right {
        .status-btn {
          height: 50rpx;
          font-size: 22rpx;
        }
      }
    }
  }
}
</style>