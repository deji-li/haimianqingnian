<template>
  <view v-if="isWeWork" class="wework-header">
    <view class="header-content">
      <!-- 返回按钮 -->
      <view v-if="showBack" class="back-btn" @click="handleBack">
        <uni-icons type="left" size="20" color="#fff" />
      </view>

      <!-- 标题区域 -->
      <view class="title-area">
        <text class="title">{{ title }}</text>
        <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
      </view>

      <!-- 操作区域 -->
      <view class="actions">
        <button
          v-if="showShare"
          class="action-btn"
          @click="handleShare"
        >
          <uni-icons type="redo" size="16" color="#fff" />
          <text class="btn-text">分享</text>
        </button>

        <button
          v-if="showChat && customer?.weworkExternalUserId"
          class="action-btn"
          @click="handleChat"
        >
          <uni-icons type="chat" size="16" color="#fff" />
          <text class="btn-text">发消息</text>
        </button>

        <button
          v-if="showMore"
          class="action-btn"
          @click="handleMore"
        >
          <uni-icons type="more-filled" size="16" color="#fff" />
        </button>
      </view>
    </view>

    <!-- 企业微信状态指示器 -->
    <view v-if="showStatus" class="status-indicator">
      <view class="status-dot"></view>
      <text class="status-text">企业微信</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WeWorkEnv } from '@/utils/wework-env'
import { WeWorkSDK } from '@/utils/wework-sdk'

interface Props {
  title: string
  subtitle?: string
  showBack?: boolean
  showShare?: boolean
  showChat?: boolean
  showMore?: boolean
  showStatus?: boolean
  customer?: any
}

interface Emits {
  (e: 'back'): void
  (e: 'share'): void
  (e: 'chat'): void
  (e: 'more'): void
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  showShare: true,
  showChat: true,
  showMore: false,
  showStatus: true
})

const emit = defineEmits<Emits>()

// 计算属性
const isWeWork = computed(() => WeWorkEnv.isWeWork())

// 获取企业微信SDK实例
const weworkSDK = WeWorkSDK.getInstance()

// 返回处理
const handleBack = () => {
  emit('back')
}

// 分享处理
const handleShare = async () => {
  try {
    if (!props.customer) {
      uni.showToast({
        title: '没有可分享的内容',
        icon: 'none'
      })
      return
    }

    await weworkSDK.shareToChat({
      title: `${props.customer.realName || props.customer.name} - 客户资料`,
      desc: `意向度: ${props.customer.customerIntent || '未知'} | 生命周期: ${props.customer.lifecycleStage || '未知'}`,
      link: `${getCurrentBaseUrl()}/pages/customer/detail?id=${props.customer.id}`,
      imgUrl: props.customer.avatar || '/static/default-avatar.png'
    })

    emit('share')

    // 记录分享行为
    recordShareAction('share')
  } catch (error) {
    console.error('分享失败:', error)
    uni.showToast({
      title: '分享失败',
      icon: 'error'
    })
  }
}

// 聊天处理
const handleChat = async () => {
  try {
    if (!props.customer?.weworkExternalUserId) {
      uni.showToast({
        title: '未关联企微联系人',
        icon: 'none'
      })
      return
    }

    await weworkSDK.openEnterpriseChat({
      externalUserIds: [props.customer.weworkExternalUserId]
    })

    emit('chat')

    // 记录聊天行为
    recordShareAction('chat')
  } catch (error) {
    console.error('打开聊天失败:', error)
    uni.showToast({
      title: '打开聊天失败',
      icon: 'error'
    })
  }
}

// 更多操作
const handleMore = () => {
  uni.showActionSheet({
    itemList: ['复制链接', '收藏', '举报'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          copyLink()
          break
        case 1:
          toggleFavorite()
          break
        case 2:
          reportContent()
          break
      }
    }
  })
}

// 复制链接
const copyLink = async () => {
  try {
    const link = `${getCurrentBaseUrl()}/pages/customer/detail?id=${props.customer?.id}`
    await navigator.clipboard.writeText(link)
    uni.showToast({
      title: '链接已复制',
      icon: 'success'
    })
  } catch (error) {
    console.error('复制链接失败:', error)
    uni.showToast({
      title: '复制失败',
      icon: 'error'
    })
  }
}

// 切换收藏
const toggleFavorite = () => {
  // 实现收藏逻辑
  uni.showToast({
    title: '收藏功能开发中',
    icon: 'none'
  })
}

// 举报内容
const reportContent = () => {
  // 实现举报逻辑
  uni.showToast({
    title: '举报功能开发中',
    icon: 'none'
  })
}

// 获取当前基础URL
const getCurrentBaseUrl = (): string => {
  return process.env.VUE_APP_BASE_URL || 'https://your-domain.com/mobile'
}

// 记录用户行为
const recordShareAction = (action: string) => {
  try {
    uni.request({
      url: '/api/wework/user-action',
      method: 'POST',
      data: {
        action,
        customerId: props.customer?.id,
        customerName: props.customer?.realName || props.customer?.name,
        timestamp: new Date().toISOString(),
        platform: WeWorkEnv.getPlatform()
      }
    })
  } catch (error) {
    console.error('记录用户行为失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.wework-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20rpx 30rpx;
  min-height: 88rpx;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &:active {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0.95);
    }
  }

  .title-area {
    flex: 1;
    text-align: center;
    padding: 0 20rpx;
  }

  .title {
    font-size: 32rpx;
    font-weight: 600;
    display: block;
    margin-bottom: 4rpx;
  }

  .subtitle {
    font-size: 24rpx;
    opacity: 0.9;
    display: block;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 12rpx 16rpx;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 24rpx;
    color: white;
    font-size: 24rpx;
    transition: all 0.3s ease;

    &:active {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0.95);
    }

    .btn-text {
      font-size: 22rpx;
      opacity: 0.9;
    }
  }

  .status-indicator {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 6rpx 12rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
    font-size: 20rpx;

    .status-dot {
      width: 8rpx;
      height: 8rpx;
      background: #4caf50;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .status-text {
      opacity: 0.8;
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .wework-header {
    .actions {
      .action-btn {
        padding: 10rpx 12rpx;

        .btn-text {
          display: none; /* 小屏幕下只显示图标 */
        }
      }
    }
  }
}
</style>