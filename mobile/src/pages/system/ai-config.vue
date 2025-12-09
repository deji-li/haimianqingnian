<template>
  <view class="ai-config-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="header-title">AI配置</text>
      <text class="header-subtitle">管理AI模型和功能配置</text>
    </view>

    <!-- 配置列表 -->
    <view class="config-list">
      <!-- DeepSeek配置 -->
      <view class="config-section">
        <view class="section-header">
          <view class="section-title">
            <text class="title-icon">🤖</text>
            <text>DeepSeek AI配置</text>
          </view>
          <view class="section-status" :class="{ active: configs.deepseek.enabled }">
            <text class="status-dot"></text>
            <text class="status-text">{{ configs.deepseek.enabled ? '已启用' : '未启用' }}</text>
          </view>
        </view>

        <view class="config-items">
          <view class="config-item">
            <text class="item-label">API Key</text>
            <input
              v-model="configs.deepseek.apiKey"
              class="item-input"
              placeholder="请输入DeepSeek API Key"
              :password="!showDeepSeekKey"
              :disabled="!isEditing"
            />
            <button @click="showDeepSeekKey = !showDeepSeekKey" class="input-action" size="mini">
              <uni-icons :type="showDeepSeekKey ? 'eye-slash' : 'eye'" size="16" />
            </button>
          </view>

          <view class="config-item">
            <text class="item-label">模型名称</text>
            <picker
              mode="selector"
              :range="deepseekModels"
              :value="configs.deepseek.modelIndex"
              @change="onDeepSeekModelChange"
              :disabled="!isEditing"
            >
              <view class="picker-input">
                <text>{{ deepseekModels[configs.deepseek.modelIndex] }}</text>
                <uni-icons type="right" size="16" color="#ccc" />
              </view>
            </picker>
          </view>

          <view class="config-item">
            <text class="item-label">温度参数</text>
            <slider
              v-model="configs.deepseek.temperature"
              :min="0"
              :max="100"
              :step="1"
              :disabled="!isEditing"
              @change="onTemperatureChange"
            />
            <text class="slider-value">{{ (configs.deepseek.temperature / 100).toFixed(2) }}</text>
          </view>

          <view class="config-switch">
            <view class="switch-left">
              <text class="switch-label">启用DeepSeek</text>
              <text class="switch-desc">用于聊天分析和客户洞察</text>
            </view>
            <switch
              :checked="configs.deepseek.enabled"
              @change="configs.deepseek.enabled = $event.detail.value"
              :disabled="!isEditing"
            />
          </view>
        </view>
      </view>

      <!-- OCR配置 -->
      <view class="config-section">
        <view class="section-header">
          <view class="section-title">
            <text class="title-icon">📷</text>
            <text>OCR识别配置</text>
          </view>
          <view class="section-status" :class="{ active: configs.ocr.enabled }">
            <text class="status-dot"></text>
            <text class="status-text">{{ configs.ocr.enabled ? '已启用' : '未启用' }}</text>
          </view>
        </view>

        <view class="config-items">
          <view class="config-item">
            <text class="item-label">OCR服务商</text>
            <picker
              mode="selector"
              :range="ocrProviders"
              :value="configs.ocr.providerIndex"
              @change="onOcrProviderChange"
              :disabled="!isEditing"
            >
              <view class="picker-input">
                <text>{{ ocrProviders[configs.ocr.providerIndex] }}</text>
                <uni-icons type="right" size="16" color="#ccc" />
              </view>
            </picker>
          </view>

          <view class="config-item">
            <text class="item-label">API Key</text>
            <input
              v-model="configs.ocr.apiKey"
              class="item-input"
              placeholder="请输入OCR服务API Key"
              :password="!showOcrKey"
              :disabled="!isEditing"
            />
            <button @click="showOcrKey = !showOcrKey" class="input-action" size="mini">
              <uni-icons :type="showOcrKey ? 'eye-slash' : 'eye'" size="16" />
            </button>
          </view>

          <view class="config-switch">
            <view class="switch-left">
              <text class="switch-label">启用OCR识别</text>
              <text class="switch-desc">自动识别图片中的文字内容</text>
            </view>
            <switch
              :checked="configs.ocr.enabled"
              @change="configs.ocr.enabled = $event.detail.value"
              :disabled="!isEditing"
            />
          </view>
        </view>
      </view>

      <!-- 功能开关 -->
      <view class="config-section">
        <view class="section-header">
          <view class="section-title">
            <text class="title-icon">⚙️</text>
            <text>AI功能开关</text>
          </view>
        </view>

        <view class="config-items">
          <view class="config-switch">
            <view class="switch-left">
              <text class="switch-label">智能客户分析</text>
              <text class="switch-desc">基于聊天记录自动分析客户特征</text>
            </view>
            <switch
              :checked="configs.features.customerAnalysis"
              @change="configs.features.customerAnalysis = $event.detail.value"
              :disabled="!isEditing"
            />
          </view>

          <view class="config-switch">
            <view class="switch-left">
              <text class="switch-label">自动标签生成</text>
              <text class="switch-desc">根据分析结果自动为客户打标签</text>
            </view>
            <switch
              :checked="configs.features.autoTagging"
              @change="configs.features.autoTagging = $event.detail.value"
              :disabled="!isEditing"
            />
          </view>

          <view class="config-switch">
            <view class="switch-left">
              <text class="switch-label">销售建议生成</text>
              <text class="switch-desc">基于客户分析生成跟进建议</text>
            </view>
            <switch
              :checked="configs.features.salesSuggestion"
              @change="configs.features.salesSuggestion = $event.detail.value"
              :disabled="!isEditing"
            />
          </view>

          <view class="config-switch">
            <view class="switch-left">
              <text class="switch-label">缓存AI结果</text>
              <text class="switch-desc">缓存分析结果以提高响应速度</text>
            </view>
            <switch
              :checked="configs.features.cacheResults"
              @change="configs.features.cacheResults = $event.detail.value"
              :disabled="!isEditing"
            />
          </view>
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
        <button @click="testConfig" class="action-btn test" :loading="testing">
          <uni-icons type="checkmarkempty" size="18" />
          测试配置
        </button>
        <button @click="saveConfig" class="action-btn save" :loading="saving">
          <uni-icons type="checkmarkempty" size="18" />
          保存配置
        </button>
      </template>
    </view>

    <!-- 测试结果 -->
    <view class="test-results" v-if="testResults.length > 0">
      <view class="results-header">
        <text class="results-title">测试结果</text>
        <button @click="clearResults" class="clear-btn" size="mini">清除</button>
      </view>

      <view class="result-list">
        <view
          v-for="result in testResults"
          :key="result.id"
          class="result-item"
          :class="result.success ? 'success' : 'error'"
        >
          <view class="result-header">
            <uni-icons
              :type="result.success ? 'checkmarkempty' : 'closeempty'"
              :color="result.success ? '#4caf50' : '#f44336'"
              size="16"
            />
            <text class="result-title">{{ result.title }}</text>
            <text class="result-time">{{ formatTime(result.timestamp) }}</text>
          </view>
          <text class="result-message">{{ result.message }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 响应式数据
const isEditing = ref(false)
const showDeepSeekKey = ref(false)
const showOcrKey = ref(false)
const saving = ref(false)
const testing = ref(false)
const testResults = ref<any[]>([])

// 配置数据
const configs = reactive({
  deepseek: {
    enabled: false,
    apiKey: '',
    modelIndex: 0,
    temperature: 70
  },
  ocr: {
    enabled: false,
    apiKey: '',
    providerIndex: 0
  },
  features: {
    customerAnalysis: true,
    autoTagging: true,
    salesSuggestion: true,
    cacheResults: true
  }
})

// 原始配置备份
const originalConfigs = ref({})

// 模型选项
const deepseekModels = [
  'deepseek-chat',
  'deepseek-coder',
  'deepseek-math'
]

const ocrProviders = [
  '豆包OCR',
  '百度OCR',
  '腾讯OCR',
  '阿里云OCR'
]

// 方法
const loadConfigs = async () => {
  try {
    uni.showLoading({ title: '加载配置...' })

    const response = await uni.request({
      url: '/api/ai/config',
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data.success) {
      Object.assign(configs, response.data.configs)
      originalConfigs.value = JSON.parse(JSON.stringify(configs))
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

const editConfig = () => {
  isEditing.value = true
  originalConfigs.value = JSON.parse(JSON.stringify(configs))
}

const cancelEdit = () => {
  isEditing.value = false
  Object.assign(configs, originalConfigs.value)
}

const testConfig = async () => {
  testing.value = true

  try {
    const response = await uni.request({
      url: '/api/ai/test-config',
      method: 'POST',
      data: configs
    })

    const result = {
      id: Date.now(),
      title: '配置测试',
      success: response.statusCode === 200 && response.data.success,
      message: response.data?.message || '测试完成',
      timestamp: new Date().toISOString()
    }

    testResults.value.unshift(result)

    if (result.success) {
      uni.showToast({
        title: '测试成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '测试失败',
        icon: 'error'
      })
    }
  } catch (error) {
    const result = {
      id: Date.now(),
      title: '配置测试',
      success: false,
      message: '测试请求失败',
      timestamp: new Date().toISOString()
    }

    testResults.value.unshift(result)

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
    const response = await uni.request({
      url: '/api/ai/config',
      method: 'POST',
      data: configs
    })

    if (response.statusCode === 200 && response.data.success) {
      isEditing.value = false
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: response.data?.message || '保存失败',
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

const onDeepSeekModelChange = (e: any) => {
  configs.deepseek.modelIndex = e.detail.value
}

const onOcrProviderChange = (e: any) => {
  configs.ocr.providerIndex = e.detail.value
}

const onTemperatureChange = (e: any) => {
  configs.deepseek.temperature = e.detail.value
}

const clearResults = () => {
  testResults.value = []
}

const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  } catch {
    return timestamp
  }
}

// 页面加载时获取配置
onMounted(() => {
  loadConfigs()
})
</script>

<style lang="scss" scoped>
.ai-config-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
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

.config-list {
  padding: 0 20rpx;
}

.config-section {
  background: white;
  border-radius: 15rpx;
  margin-top: 20rpx;
  overflow: hidden;

  .section-header {
    padding: 30rpx;
    background: #f8f9fa;
    border-bottom: 1rpx solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-title {
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 32rpx;
      font-weight: 600;
      color: #333;

      .title-icon {
        font-size: 36rpx;
      }
    }

    .section-status {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 8rpx 16rpx;
      background: rgba(255, 152, 0, 0.1);
      border-radius: 20rpx;

      &.active {
        background: rgba(76, 175, 80, 0.1);

        .status-dot {
          background: #4caf50;
        }
      }

      .status-dot {
        width: 12rpx;
        height: 12rpx;
        background: #ff9800;
        border-radius: 50%;
      }

      .status-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .config-items {
    padding: 0 30rpx;

    .config-item {
      padding: 25rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      position: relative;

      &:last-child {
        border-bottom: none;
      }

      .item-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 15rpx;
        font-weight: 500;
      }

      .item-input {
        width: 100%;
        height: 70rpx;
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

      .input-action {
        position: absolute;
        right: 10rpx;
        top: 70rpx;
        width: 60rpx;
        height: 60rpx;
        border: none;
        background: #f5f5f5;
        border-radius: 6rpx;
        display: flex;
        align-items: center;
        justify-content: center;
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

      .slider-value {
        display: block;
        text-align: center;
        font-size: 24rpx;
        color: #666;
        margin-top: 10rpx;
      }
    }

    .config-switch {
      padding: 25rpx 0;
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

.test-results {
  margin: 30rpx 20rpx;
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .results-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .clear-btn {
      background: #f5f5f5;
      color: #666;
      border: none;
    }
  }

  .result-list {
    .result-item {
      padding: 20rpx;
      border-radius: 10rpx;
      margin-bottom: 15rpx;
      border-left: 6rpx solid;

      &.success {
        border-left-color: #4caf50;
        background: rgba(76, 175, 80, 0.05);
      }

      &.error {
        border-left-color: #f44336;
        background: rgba(244, 67, 54, 0.05);
      }

      .result-header {
        display: flex;
        align-items: center;
        gap: 10rpx;
        margin-bottom: 8rpx;

        .result-title {
          flex: 1;
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
        }

        .result-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .result-message {
        font-size: 26rpx;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}
</style>