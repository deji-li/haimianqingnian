<template>
  <view class="edit-customer-page">
    <view v-if="loading" class="loading-container">
      <text>加载中...</text>
    </view>

    <view v-else-if="formData" class="form-container">
      <view class="form-item">
        <text class="form-label">微信ID</text>
        <input class="form-input" v-model="formData.wechatId" placeholder="请输入微信ID" disabled />
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
        <picker :range="intentLevels" range-key="label" :value="intentIndex" @change="onIntentChange">
          <view class="picker-value">
            {{ formData.customerIntent || '请选择意向等级' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">生命周期</text>
        <picker :range="lifecycleStages" range-key="label" :value="lifecycleIndex" @change="onLifecycleChange">
          <view class="picker-value">
            {{ formData.lifecycleStage || '请选择生命周期' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">流量平台</text>
        <picker :range="trafficPlatforms" range-key="label" :value="platformIndex" @change="onPlatformChange">
          <view class="picker-value">
            {{ formData.trafficPlatform || '请选择流量平台' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">流量城市</text>
        <picker :range="trafficCities" range-key="label" :value="cityIndex" @change="onCityChange">
          <view class="picker-value">
            {{ formData.trafficCity || '请选择流量城市' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">学生年级</text>
        <picker :range="studentGrades" :value="gradeIndex" @change="onGradeChange">
          <view class="picker-value">
            {{ formData.studentGrade || '请选择学生年级' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">学生年龄</text>
        <input class="form-input" type="number" v-model.number="formData.studentAge" placeholder="请输入学生年龄" />
      </view>

      <view class="form-item">
        <text class="form-label">家庭经济水平</text>
        <picker :range="economicLevels" range-key="label" :value="economicIndex" @change="onEconomicChange">
          <view class="picker-value">
            {{ formData.familyEconomicLevel || '请选择家庭经济水平' }}
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
        {{ submitting ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Customer, UpdateCustomerDto } from '@shared/types'
import {
  CUSTOMER_INTENT_LEVELS,
  LIFECYCLE_STAGES,
  TRAFFIC_PLATFORMS,
  TRAFFIC_CITIES,
  ECONOMIC_LEVELS,
  STUDENT_GRADES
} from '@shared/constants'
import { validatePhone } from '@shared/utils'
import { getCustomerDetail, updateCustomer } from '@/api/customer'

const loading = ref(false)
const submitting = ref(false)
const formData = ref<UpdateCustomerDto & { wechatId?: string }>({})
let customerId = 0

const intentLevels = CUSTOMER_INTENT_LEVELS
const lifecycleStages = LIFECYCLE_STAGES.filter(s => s.value)
const trafficPlatforms = TRAFFIC_PLATFORMS
const trafficCities = TRAFFIC_CITIES
const economicLevels = ECONOMIC_LEVELS
const studentGrades = STUDENT_GRADES

// 计算当前选中的索引
const intentIndex = computed(() =>
  intentLevels.findIndex(item => item.value === formData.value.customerIntent)
)
const lifecycleIndex = computed(() =>
  lifecycleStages.findIndex(item => item.value === formData.value.lifecycleStage)
)
const platformIndex = computed(() =>
  trafficPlatforms.findIndex(item => item.value === formData.value.trafficPlatform)
)
const cityIndex = computed(() =>
  trafficCities.findIndex(item => item.value === formData.value.trafficCity)
)
const economicIndex = computed(() =>
  economicLevels.findIndex(item => item.value === formData.value.familyEconomicLevel)
)
const gradeIndex = computed(() =>
  studentGrades.findIndex(item => item === formData.value.studentGrade)
)

/**
 * 加载客户详情
 */
async function loadCustomerDetail() {
  try {
    loading.value = true
    const customer = await getCustomerDetail(customerId)
    formData.value = {
      ...customer
    }
  } catch (error) {
    console.error('加载客户详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function onIntentChange(e: any) {
  formData.value.customerIntent = intentLevels[e.detail.value].value
}

function onLifecycleChange(e: any) {
  formData.value.lifecycleStage = lifecycleStages[e.detail.value].value
}

function onPlatformChange(e: any) {
  formData.value.trafficPlatform = trafficPlatforms[e.detail.value].value
}

function onCityChange(e: any) {
  formData.value.trafficCity = trafficCities[e.detail.value].value
}

function onEconomicChange(e: any) {
  formData.value.familyEconomicLevel = economicLevels[e.detail.value].value
}

function onGradeChange(e: any) {
  formData.value.studentGrade = studentGrades[e.detail.value]
}

/**
 * 提交保存
 */
async function handleSubmit() {
  // 表单验证
  if (formData.value.phone && !validatePhone(formData.value.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  try {
    submitting.value = true

    // 移除不需要的字段
    const { wechatId, createTime, updateTime, id, ...updateData } = formData.value as any

    await updateCustomer(customerId, updateData)

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

onLoad((options: any) => {
  customerId = parseInt(options.id)
  loadCustomerDetail()
})
</script>

<style lang="scss" scoped>
.edit-customer-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.loading-container {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.form-container {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;

  .form-item {
    margin-bottom: 40rpx;

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
      color: #333;
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
