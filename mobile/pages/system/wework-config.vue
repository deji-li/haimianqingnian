<template>
  <view class="wework-config-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <text class="header-title">企业微信配置</text>
        <text class="header-subtitle">配置企业微信集成参数</text>
      </view>
      <view class="status-indicator" :class="{ active: config.isActive }">
        <text class="status-dot"></text>
        <text class="status-text">{{ config.isActive ? '已启用' : '未启用' }}</text>
      </view>
    </view>

    <!-- 配置表单 -->
    <view class="config-form">
      <!-- 基础配置 -->
      <view class="form-section">
        <view class="section-title">
          <uni-icons type="gear" size="20" color="#667eea" />
          <text>基础配置</text>
        </view>

        <view class="form-item">
          <text class="form-label">企业ID <text class="required">*</text></text>
          <input
            v-model="config.corpId"
            class="form-input"
            placeholder="请输入企业微信CorpID"
            :disabled="!isEditing"
          />
          <text class="form-hint">在企业微信管理后台-我的企业-企业信���中获取</text>
        </view>

        <view class="form-item">
          <text class="form-label">应用ID <text class="required">*</text></text>
          <input
            v-model="config.agentId"
            class="form-input"
            placeholder="请输入应用AgentID"
            :disabled="!isEditing"
          />
          <text class="form-hint">在企业微信应用管理页面获取</text>
        </view>

        <view class="form-item">
          <text class="form-label">应用Secret <text class="required">*</text></text>
          <input
            v-model="config.secret"
            class="form-input"
            placeholder="请输入应用Secret"
            :disabled="!isEditing"
            :password="!showSecret"
          />
          <view class="input-actions">
            <button @click="showSecret = !showSecret" class="action-btn" size="mini">
              <uni-icons :type="showSecret ? 'eye-slash' : 'eye'" size="16" />
            </button>
          </view>
          <text class="form-hint">用于API调用认证，请妥善保管</text>
        </view>

        <view class="form-item">
          <text class="form-label">回调URL</text>
          <input
            v-model="config.callbackUrl"
            class="form-input"
            placeholder="企业微信事件回调URL"
            :disabled="!isEditing"
          />
          <text class="form-hint">用于接收企业微信事件推送</text>
        </view>
      </view>

      <!-- 回调配置 -->
      <view class="form-section">
        <view class="section-title">
          <uni-icons type="loop" size="20" color="#f093fb" />
          <text>回调配置</text>
        </view>

        <view class="form-item">
          <text class="form-label">回调Token</text>
          <input
            v-model="config.token"
            class="form-input"
            placeholder="事件回调验证Token"
            :disabled="!isEditing"
          />
          <text class="form-hint">用于验证回调请求的合法性</text>
        </view>

        <view class="form-item">
          <text class="form-label">回调AESKey</text>
          <input
            v-model="config.aesKey"
            class="form-input"
            placeholder="消息加解密Key"
            :disabled="!isEditing"
          />
          <text class="form-hint">用于回调消息的加密和解密</text>
        </view>
      </view>

      <!-- 功能开关 -->
      <view class="form-section">
        <view class="section-title">
          <uni-icons type="checkbox" size="20" color="#43e97b" />
          <text>功能开关</text>
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">联系人同步</text>
            <text class="switch-desc">同步企业微信外部联系人到CRM</text>
          </view>
          <switch
            :checked="config.features.contactSync"
            @change="config.features.contactSync = $event.detail.value"
            :disabled="!isEditing"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">聊天记录分析</text>
            <text class="switch-desc">使用AI分析企业微信聊天记录</text>
          </view>
          <switch
            :checked="config.features.chatAnalysis"
            @change="config.features.chatAnalysis = $event.detail.value"
            :disabled="!isEditing"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">消息推送</text>
            <text class="switch-desc">向企业微信推送重要通知</text>
          </view>
          <switch
            :checked="config.features.messagePush"
            @change="config.features.messagePush = $event.detail.value"
            :disabled="!isEditing"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">会话存档</text>
            <text class="switch-desc">启用企业微信会话内容存档</text>
          </view>
          <switch
            :checked="config.features.chatArchive"
            @change="config.features.chatArchive = $event.detail.value"
            :disabled="!isEditing"
          />
        </view>
      </view>

      <!-- 同步策略 -->
      <view class="form-section" v-if="config.features.contactSync">
        <view class="section-title">
          <uni-icons type="refresh" size="20" color="#FFB800" />
          <text>同步策略</text>
        </view>

        <view class="form-item">
          <text class="form-label">同步频率</text>
          <picker
            mode="selector"
            :range="syncIntervalOptions"
            range-key="label"
            :value="syncIntervalIndex"
            @change="onSyncIntervalChange"
            :disabled="!isEditing"
          >
            <view class="picker-view">
              <text class="picker-text">{{ syncIntervalOptions[syncIntervalIndex].label }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">自动同步</text>
            <text class="switch-desc">启用定时自动同步</text>
          </view>
          <switch
            :checked="config.syncStrategy.autoSync"
            @change="config.syncStrategy.autoSync = $event.detail.value"
            :disabled="!isEditing"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">增量同步</text>
            <text class="switch-desc">只同步有变更的数据</text>
          </view>
          <switch
            :checked="config.syncStrategy.incrementalSync"
            @change="config.syncStrategy.incrementalSync = $event.detail.value"
            :disabled="!isEditing"
          />
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button v-if="!isEditing" @click="editConfig" class="action-btn edit">
        <uni-icons type="compose" size="18" />
        编辑配置
      </button>

      <template v-else>
        <button @click="cancelEdit" class="action-btn cancel">
          <uni-icons type="close" size="18" />
          取消
        </button>
        <button @click="testConnection" class="action-btn test" :loading="testing">
          <uni-icons type="checkmarkempty" size="18" />
          测试连接
        </button>
        <button @click="saveConfig" class="action-btn save" :loading="saving">
          <uni-icons type="checkmarkempty" size="18" />
          保存配置
        </button>
      </template>
    </view>

    <!-- 连接状态 -->
    <view class="connection-status" v-if="connectionStatus">
      <view class="status-card" :class="connectionStatus.success ? 'success' : 'error'">
        <uni-icons :type="connectionStatus.success ? 'checkmarkempty' : 'closeempty'" size="24" :color="connectionStatus.success ? '#4caf50' : '#f44336'" />
        <view class="status-content">
          <text class="status-title">{{ connectionStatus.success ? '连接测试成功' : '连接测试失败' }}</text>
          <text class="status-message">{{ connectionStatus.message }}</text>
          <text class="status-time">{{ connectionStatus.timestamp }}</text>
        </view>
      </view>
    </view>

    <!-- 使用说明 -->
    <view class="help-section">
      <view class="help-title">
        <uni-icons type="help" size="18" color="#999" />
        <text>配置说明</text>
      </view>
      <view class="help-content">
        <text class="help-item">1. 在企业微信管理后台创建应用并获取CorpID、AgentID和Secret</text>
        <text class="help-item">2. 配置可信域名和回调URL以启用OAuth2和事件推送</text>
        <text class="help-item">3. 根据业务需求开启相应的功能开关</text>
        <text class="help-item">4. 建议先测试连接确认配置正确后再启用功能</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// 响应式数据
const isEditing = ref(false)
const showSecret = ref(false)
const saving = ref(false)
const testing = ref(false)
const connectionStatus = ref<any>(null)

// 配置数据
const config = reactive({
  isActive: false,
  corpId: '',
  agentId: '',
  secret: '',
  callbackUrl: '',
  token: '',
  aesKey: '',
  features: {
    contactSync: true,
    chatAnalysis: true,
    messagePush: true,
    chatArchive: false
  },
  syncStrategy: {
    interval: 60, // 分钟
    autoSync: true,
    incrementalSync: true
  }
})

// 原始配置备份
const originalConfig = ref({})

// 同步频率选项
const syncIntervalOptions = [
  { label: '每5分钟', value: 5 },
  { label: '每15分钟', value: 15 },
  { label: '每30分钟', value: 30 },
  { label: '每小时', value: 60 },
  { label: '每2小时', value: 120 },
  { label: '每4小时', value: 240 },
  { label: '每天', value: 1440 }
]

const syncIntervalIndex = computed(() => {
  return syncIntervalOptions.findIndex(option => option.value === config.syncStrategy.interval)
})

// 加载配置
const loadConfig = async () => {
  try {
    uni.showLoading({ title: '加载配置...' })

    const response = await uni.request({
      url: '/api/wework/config',
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data.success) {
      Object.assign(config, response.data.config)
      originalConfig.value = JSON.parse(JSON.stringify(config))
    }

    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '加载配置失败',
      icon: 'error'
    })
  }
}

// 编辑配置
const editConfig = () => {
  isEditing.value = true
  originalConfig.value = JSON.parse(JSON.stringify(config))
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  Object.assign(config, originalConfig.value)
}

// 测试连接
const testConnection = async () => {
  testing.value = true

  try {
    const response = await uni.request({
      url: '/api/wework/test-connection',
      method: 'POST',
      data: {
        corpId: config.corpId,
        agentId: config.agentId,
        secret: config.secret
      }
    })

    if (response.statusCode === 200) {
      connectionStatus.value = {
        success: response.data.success,
        message: response.data.message,
        timestamp: new Date().toLocaleString()
      }
    } else {
      connectionStatus.value = {
        success: false,
        message: '网络请求失败',
        timestamp: new Date().toLocaleString()
      }
    }
  } catch (error) {
    connectionStatus.value = {
      success: false,
      message: '连接测试异常',
      timestamp: new Date().toLocaleString()
    }
  } finally {
    testing.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  // 验证必填字段
  if (!config.corpId || !config.agentId || !config.secret) {
    uni.showToast({
      title: '请填写必填项',
      icon: 'none'
    })
    return
  }

  saving.value = true

  try {
    const response = await uni.request({
      url: '/api/wework/config',
      method: 'POST',
      data: config
    })

    if (response.statusCode === 200 && response.data.success) {
      isEditing.value = false
      uni.showToast({
        title: '配置保存成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: response.data.message || '保存失败',
        icon: 'error'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '保存配置失败',
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

// 同步频率变更
const onSyncIntervalChange = (e: any) => {
  const index = e.detail.value
  config.syncStrategy.interval = syncIntervalOptions[index].value
}

// 页面加载时获取配置
onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.wework-config-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 30rpx 40rpx;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-content {
    flex: 1;

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

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;

    &.active {
      .status-dot {
        background: #4caf50;
      }
    }

    .status-dot {
      width: 12rpx;
      height: 12rpx;
      background: #ff9800;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .status-text {
      font-size: 24rpx;
    }
  }
}

.config-form {
  padding: 0 20rpx;

  .form-section {
    background: white;
    border-radius: 15rpx;
    margin-top: 20rpx;
    overflow: hidden;

    .section-title {
      padding: 30rpx;
      background: #f8f9fa;
      border-bottom: 1rpx solid #eee;
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .form-item {
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .form-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 15rpx;
        font-weight: 500;

        .required {
          color: #f44336;
        }
      }

      .form-input {
        width: 100%;
        height: 80rpx;
        border: 2rpx solid #e0e0e0;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        background: #fff;

        &:focus {
          border-color: #667eea;
        }

        &:disabled {
          background: #f5f5f5;
          color: #999;
        }
      }

      .input-actions {
        position: absolute;
        right: 20rpx;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        gap: 10rpx;

        .action-btn {
          width: 60rpx;
          height: 60rpx;
          border: none;
          background: #f5f5f5;
          border-radius: 6rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .form-hint {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-top: 10rpx;
      }

      .picker-view {
        height: 80rpx;
        border: 2rpx solid #e0e0e0;
        border-radius: 8rpx;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;

        .picker-text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }

    .switch-item {
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:last-child {
        border-bottom: none;
      }

      .switch-left {
        flex: 1;

        .switch-label {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
          font-weight: 500;
        }

        .switch-desc {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

.action-buttons {
  padding: 30rpx 20rpx;
  display: flex;
  gap: 20rpx;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;

    &.edit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.cancel {
      background: #f5f5f5;
      color: #666;
    }

    &.test {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
    }

    &.save {
      background: linear-gradient(135deg, #FFB800 0%, #FF9800 100%);
      color: white;
    }
  }
}

.connection-status {
  padding: 0 20rpx;

  .status-card {
    background: white;
    border-radius: 15rpx;
    padding: 30rpx;
    display: flex;
    align-items: flex-start;
    gap: 20rpx;
    border-left: 6rpx solid;

    &.success {
      border-left-color: #4caf50;
    }

    &.error {
      border-left-color: #f44336;
    }

    .status-content {
      flex: 1;

      .status-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        margin-bottom: 8rpx;
      }

      .status-message {
        display: block;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .status-time {
        display: block;
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.help-section {
  margin: 30rpx 20rpx;
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;

  .help-title {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }

  .help-content {
    .help-item {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 12rpx;
      padding-left: 20rpx;
      position: relative;

      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 12rpx;
        width: 8rpx;
        height: 8rpx;
        background: #FFB800;
        border-radius: 50%;
      }
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
</style>