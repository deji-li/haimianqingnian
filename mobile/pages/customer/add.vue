<template>
  <view class="add-customer-page">
    <view class="form-container">
      <view class="form-item required">
        <text class="form-label">微信ID</text>
        <input class="form-input" v-model="formData.wechatId" placeholder="请输入微信ID" />
      </view>

      <view class="form-item">
        <text class="form-label">微信昵称</text>
        <input class="form-input" v-model="formData.wechatNickname" placeholder="请输入微信昵称" />
      </view>

      <view class="form-item">
        <text class="form-label">真实姓名</text>
        <input class="form-input" v-model="formData.realName" placeholder="请输入真实姓名" />
      </view>

      <view class="form-item">
        <text class="form-label">手机号</text>
        <input class="form-input" type="number" v-model="formData.phone" placeholder="请输入手机号" />
      </view>

      <view class="form-item">
        <text class="form-label">意向等级</text>
        <picker :range="intentLevels" range-key="label" @change="onIntentChange">
          <view class="picker-value">
            {{ formData.customerIntent || '请选择意向等级' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">流量平台</text>
        <picker :range="trafficPlatforms" range-key="label" @change="onPlatformChange">
          <view class="picker-value">
            {{ formData.trafficPlatform || '请选择流量平台' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">流量城市</text>
        <picker :range="trafficCities" range-key="label" @change="onCityChange">
          <view class="picker-value">
            {{ formData.trafficCity || '请选择流量城市' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          v-model="formData.remark"
          placeholder="请输入备注信息"
          maxlength="200"
        />
      </view>

      <button class="submit-btn" type="primary" @click="handleSubmit" :loading="submitting">
        {{ submitting ? '提交中...' : '提交' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CreateCustomerDto } from '@shared/types'
import { CUSTOMER_INTENT_LEVELS, TRAFFIC_PLATFORMS, TRAFFIC_CITIES } from '@shared/constants'
import { validatePhone } from '@shared/utils'
import { createCustomer } from '@/api/customer'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const formData = ref<CreateCustomerDto>({
  wechatId: '',
  wechatNickname: '',
  realName: '',
  phone: '',
  customerIntent: '中',
  trafficPlatform: undefined,
  trafficCity: undefined,
  remark: ''
})

const submitting = ref(false)

const intentLevels = CUSTOMER_INTENT_LEVELS
const trafficPlatforms = TRAFFIC_PLATFORMS
const trafficCities = TRAFFIC_CITIES

function onIntentChange(e: any) {
  formData.value.customerIntent = intentLevels[e.detail.value].value
}

function onPlatformChange(e: any) {
  formData.value.trafficPlatform = trafficPlatforms[e.detail.value].value
}

function onCityChange(e: any) {
  formData.value.trafficCity = trafficCities[e.detail.value].value
}

async function handleSubmit() {
  // 表单验证
  if (!formData.value.wechatId) {
    uni.showToast({ title: '请输入微信ID', icon: 'none' })
    return
  }

  if (formData.value.phone && !validatePhone(formData.value.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  try {
    submitting.value = true
    await createCustomer(formData.value)

    uni.showToast({
      title: '添加成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    console.error('添加客户失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.add-customer-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.form-container {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;

  .form-item {
    margin-bottom: 40rpx;

    &.required .form-label::before {
      content: '*';
      color: #ef4444;
      margin-right: 8rpx;
    }

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 15rpx;
      font-weight: bold;
    }

    .form-input,
    .picker-value {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      padding: 0 20rpx;
      background: #f5f5f5;
      border-radius: 10rpx;
      font-size: 28rpx;
    }

    .picker-value {
      color: #999;
    }

    .form-textarea {
      width: 100%;
      min-height: 150rpx;
      padding: 20rpx;
      background: #f5f5f5;
      border-radius: 10rpx;
      font-size: 28rpx;
    }
  }

  .submit-btn {
    width: 100%;
    height: 90rpx;
    background: #3b82f6;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 40rpx;
  }
}
</style>
