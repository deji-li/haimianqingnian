<template>
  <view class="wework-settings">
    <!-- 设置头部 -->
    <view class="settings-header">
      <view class="header-content">
        <text class="header-title">企业微信设置</text>
        <text class="header-subtitle">配置企业微信集成参数</text>
      </view>
      <view class="config-status" :class="{ valid: configStatus.isValid }">
        <uni-icons
          :type="configStatus.isValid ? 'checkmarkempty' : 'closeempty'"
          :color="configStatus.isValid ? '#4caf50' : '#f44336'"
          size="20"
        />
        <text class="status-text">{{ configStatus.isValid ? '配置完整' : '配置不完整' }}</text>
      </view>
    </view>

    <!-- 配置表单 -->
    <view class="settings-form">
      <!-- 基础配置 -->
      <view class="form-section">
        <view class="section-title">
          <uni-icons type="gear" size="18" color="#667eea" />
          <text>基础配置</text>
        </view>

        <view class="form-item">
          <text class="item-label">企业ID <text class="required">*</text></text>
          <input
            v-model="localConfig.corpId"
            class="item-input"
            placeholder="请输入企业微信CorpID"
            @input="onConfigChange"
          />
          <text class="item-hint">在企业微信管理后台-我的企业-企业信息中获取</text>
        </view>

        <view class="form-item">
          <text class="item-label">应用ID <text class="required">*</text></text>
          <input
            v-model="localConfig.agentId"
            class="item-input"
            placeholder="请输入应用AgentID"
            @input="onConfigChange"
          />
          <text class="item-hint">在企业微信应用管理页面获取</text>
        </view>

        <view class="form-item">
          <text class="item-label">回调地址</text>
          <input
            v-model="localConfig.callbackUrl"
            class="item-input"
            placeholder="企业微信回调地址"
            @input="onConfigChange"
          />
          <text class="item-hint">用于接收企业微信事件推送</text>
        </view>
      </view>

      <!-- 功能开关 -->
      <view class="form-section">
        <view class="section-title">
          <uni-icons type="checkbox" size="18" color="#43e97b" />
          <text>功能开关</text>
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">自动登录</text>
            <text class="switch-desc">企业微信环境下自动登录系统</text>
          </view>
          <switch
            :checked="localConfig.features.autoLogin"
            @change="onFeatureChange('autoLogin', $event.detail.value)"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">联系人同步</text>
            <text class="switch-desc">同步企业微信联系人到CRM</text>
          </view>
          <switch
            :checked="localConfig.features.contactSync"
            @change="onFeatureChange('contactSync', $event.detail.value)"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">聊天分析</text>
            <text class="switch-desc">使用AI分析企业微信聊天记录</text>
          </view>
          <switch
            :checked="localConfig.features.chatAnalysis"
            @change="onFeatureChange('chatAnalysis', $event.detail.value)"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">消息推送</text>
            <text class="switch-desc">接收企业微信重要通知</text>
          </view>
          <switch
            :checked="localConfig.features.messagePush"
            @change="onFeatureChange('messagePush', $event.detail.value)"
          />
        </view>
      </view>

      <!-- 高级设置 -->
      <view class="form-section">
        <view class="section-title">
          <uni-icons type="settings" size="18" color="#FFB800" />
          <text>高级设置</text>
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">自动跳转</text>
            <text class="switch-desc">自动跳转到企业微信页面</text>
          </view>
          <switch
            :checked="localConfig.settings.autoRedirect"
            @change="onSettingChange('autoRedirect', $event.detail.value)"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">调试模式</text>
            <text class="switch-desc">开启企业微信调试日志</text>
          </view>
          <switch
            :checked="localConfig.settings.debugMode"
            @change="onSettingChange('debugMode', $event.detail.value)"
          />
        </view>

        <view class="switch-item">
          <view class="switch-left">
            <text class="switch-label">启用缓存</text>
            <text class="switch-desc">缓存企业微信数据提高性能</text>
          </view>
          <switch
            :checked="localConfig.settings.cacheEnabled"
            @change="onSettingChange('cacheEnabled', $event.detail.value)"
          />
        </view>

        <view class="form-item">
          <text class="item-label">同步间隔</text>
          <picker
            mode="selector"
            :range="syncIntervalOptions"
            range-key="label"
            :value="syncIntervalIndex"
            @change="onSyncIntervalChange"
          >
            <view class="picker-input">
              <text>{{ syncIntervalOptions[syncIntervalIndex].label }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button @click="testConfig" class="action-btn test" :loading="testing">
        <uni-icons type="checkmarkempty" size="18" />
        测试配置
      </button>
      <button @click="saveConfig" class="action-btn save" :loading="saving">
        <uni-icons type="checkmarkempty" size="18" />
        保存配置
      </button>
    </view>

    <!-- 配置信息 -->
    <view class="config-info">
      <view class="info-item">
        <text class="info-label">配置状态:</text>
        <text :class="['info-value', configStatus.isValid ? 'success' : 'error']">
          {{ configStatus.isValid ? '完整' : '不完整' }}
        </text>
      </view>

      <view class="info-item">
        <text class="info-label">本地配置:</text>
        <text class="info-value">{{ configStatus.hasLocalConfig ? '已保存' : '未保存' }}</text>
      </view>

      <view class="info-item">
        <text class="info-label">服务器配置:</text>
        <text class="info-value">{{ configStatus.hasServerConfig ? '已同步' : '未同步' }}</text>
      </view>

      <view class="info-item" v-if="configStatus.lastSyncTime">
        <text class="info-label">最后同步:</text>
        <text class="info-value">{{ formatTime(configStatus.lastSyncTime) }}</text>
      </view>
    </view>

    <!-- 高级操作 -->
    <view class="advanced-actions">
      <button @click="resetConfig" class="danger-btn">
        <uni-icons type="refreshempty" size="16" />
        重置配置
      </button>
      <button @click="exportConfig" class="export-btn">
        <uni-icons type="download" size="16" />
        导出配置
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import WeWorkConfigManager from '@/utils/wework-config'
import { weworkApi } from '@/api/wework'

// 响应式数据
const localConfig = ref(WeWorkConfigManager.getDefaultConfig())
const configStatus = ref(WeWorkConfigManager.getConfigStatus())
const saving = ref(false)
const testing = ref(false)

// 同步间隔选项
const syncIntervalOptions = [
  { label: '5分钟', value: 5 * 60 * 1000 },
  { label: '15分钟', value: 15 * 60 * 1000 },
  { label: '30分钟', value: 30 * 60 * 1000 },
  { label: '1小时', value: 60 * 60 * 1000 },
  { label: '2小时', value: 2 * 60 * 60 * 1000 }
]

const syncIntervalIndex = computed(() => {
  return syncIntervalOptions.findIndex(option => option.value === localConfig.value.settings.syncInterval)
})

// 方法
const loadConfig = async () => {
  try {
    // 从服务器获取最新配置
    const serverConfig = await WeWorkConfigManager.fetchConfig()
    if (serverConfig) {
      localConfig.value = serverConfig
    }

    // 更新状态信息
    configStatus.value = WeWorkConfigManager.getConfigStatus()
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const onConfigChange = () => {
  // 标记配置已更改
  configStatus.value = {
    ...configStatus.value,
    isValid: WeWorkConfigManager.validateConfig().isValid
  }
}

const onFeatureChange = (feature: string, enabled: boolean) => {
  localConfig.value.features = {
    ...localConfig.value.features,
    [feature]: enabled
  }
}

const onSettingChange = (setting: string, value: any) => {
  localConfig.value.settings = {
    ...localConfig.value.settings,
    [setting]: value
  }
}

const onSyncIntervalChange = (e: any) => {
  const index = e.detail.value
  localConfig.value.settings.syncInterval = syncIntervalOptions[index].value
}

const testConfig = async () => {
  testing.value = true

  try {
    const result = await WeWorkConfigManager.validateConfig()

    if (!result.isValid) {
      uni.showModal({
        title: '配置验证失败',
        content: `以下配置项未填写:\n${result.errors.join('\n')}`,
        showCancel: false
      })
      return
    }

    // 测试API连接
    const response = await weworkApi.testConnection({
      corpId: localConfig.value.corpId,
      agentId: localConfig.value.agentId,
      secret: '***' // 不发送真实secret进行测试
    })

    if (response.success) {
      uni.showToast({
        title: '配置测试成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '配置测试失败',
        icon: 'error'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '测试失败',
      icon: 'error'
    })
  } finally {
    testing.value = false
  }
}

const saveConfig = async () => {
  saving.value = true

  try {
    // 保存到服务器
    const success = await WeWorkConfigManager.syncConfig(localConfig.value)

    if (success) {
      WeWorkConfigManager.setLastSyncTime()
      configStatus.value = WeWorkConfigManager.getConfigStatus()

      uni.showToast({
        title: '配置保存成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '配置保存失败',
        icon: 'error'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

const resetConfig = () => {
  uni.showModal({
    title: '重置配置',
    content: '确定要重置所有企业微信配置吗？此操作不可恢复。',
    success: (res) => {
      if (res.confirm) {
        WeWorkConfigManager.resetConfig()
        localConfig.value = WeWorkConfigManager.getDefaultConfig()
        configStatus.value = WeWorkConfigManager.getConfigStatus()

        uni.showToast({
          title: '配置已重置',
          icon: 'success'
        })
      }
    }
  })
}

const exportConfig = () => {
  try {
    const configData = JSON.stringify(localConfig.value, null, 2)

    // 复制到剪贴板
    // #ifdef H5
    navigator.clipboard.writeText(configData)
      .then(() => {
        uni.showToast({
          title: '配置已复制到剪贴板',
          icon: 'success'
        })
      })
      .catch(() => {
        uni.showToast({
          title: '复制失败',
          icon: 'error'
        })
      })
    // #endif

    // #ifndef H5
    uni.setClipboardData({
      data: configData,
      success: () => {
        uni.showToast({
          title: '配置已复制到剪贴板',
          icon: 'success'
        })
      },
      fail: () => {
        uni.showToast({
          title: '复制失败',
          icon: 'error'
        })
      }
    })
    // #endif
  } catch (error) {
    uni.showToast({
      title: '导出失败',
      icon: 'error'
    })
  }
}

const formatTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleDateString()
    }
  } catch {
    return timeStr
  }
}

// 页面加载时获取配置
onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.wework-settings {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.settings-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-content {
    flex: 1;

    .header-title {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }

    .header-subtitle {
      display: block;
      font-size: 24rpx;
      opacity: 0.9;
    }
  }

  .config-status {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;

    &.valid {
      .status-text {
        color: #4caf50;
      }
    }

    .status-text {
      font-size: 22rpx;
    }
  }
}

.settings-form {
  .form-section {
    background: white;
    border-radius: 15rpx;
    margin-bottom: 20rpx;
    overflow: hidden;

    .section-title {
      padding: 25rpx;
      background: #f8f9fa;
      border-bottom: 1rpx solid #eee;
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }

    .form-item {
      padding: 25rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .item-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 12rpx;
        font-weight: 500;

        .required {
          color: #f44336;
        }
      }

      .item-input {
        width: 100%;
        height: 70rpx;
        border: 2rpx solid #e0e0e0;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 26rpx;
        background: #fff;

        &:focus {
          border-color: #667eea;
        }
      }

      .item-hint {
        display: block;
        font-size: 22rpx;
        color: #999;
        margin-top: 8rpx;
      }

      .picker-input {
        height: 70rpx;
        border: 2rpx solid #e0e0e0;
        border-radius: 8rpx;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
      }
    }

    .switch-item {
      padding: 25rpx;
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
          margin-bottom: 6rpx;
          font-weight: 500;
        }

        .switch-desc {
          display: block;
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 15rpx;
  margin-bottom: 20rpx;

  .action-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 28rpx;
    font-weight: 500;
    border: none;

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

.config-info {
  background: white;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 26rpx;
      color: #666;
    }

    .info-value {
      font-size: 26rpx;
      color: #333;

      &.success {
        color: #4caf50;
      }

      &.error {
        color: #f44336;
      }
    }
  }
}

.advanced-actions {
  display: flex;
  gap: 15rpx;

  .danger-btn,
  .export-btn {
    flex: 1;
    height: 70rpx;
    border-radius: 35rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 26rpx;
    border: none;

    &:active {
      transform: scale(0.95);
    }
  }

  .danger-btn {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: white;
  }

  .export-btn {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    color: white;
  }
}
</style>