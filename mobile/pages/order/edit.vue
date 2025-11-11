<template>
  <view class="edit-order-page">
    <view v-if="loading" class="loading-container">
      <text>加载中...</text>
    </view>

    <view v-else-if="formData" class="form-container">
      <!-- 订单号 -->
      <view class="form-item">
        <text class="form-label">订单号</text>
        <input class="form-input" :value="order?.orderNo" disabled />
      </view>

      <!-- 客户信息（只读） -->
      <view class="form-item">
        <text class="form-label">客户</text>
        <input class="form-input" :value="customerName" disabled />
      </view>

      <!-- 课程名称 -->
      <view class="form-item required">
        <text class="form-label">课程名称</text>
        <input class="form-input" v-model="formData.courseName" placeholder="请输入课程名称" />
      </view>

      <!-- 支付金额 -->
      <view class="form-item required">
        <text class="form-label">支付金额</text>
        <input
          class="form-input"
          type="digit"
          v-model="formData.paymentAmount"
          placeholder="请输入支付金额"
        />
      </view>

      <!-- 支付时间 -->
      <view class="form-item">
        <text class="form-label">支付时间</text>
        <picker mode="date" :value="formData.paymentTime" @change="onPaymentTimeChange">
          <view class="picker-value">
            {{ formatDate(formData.paymentTime) }}
          </view>
        </picker>
      </view>

      <!-- 订单状态 -->
      <view class="form-item required">
        <text class="form-label">订单状态</text>
        <picker :range="orderStatuses" range-key="label" :value="statusIndex" @change="onStatusChange">
          <view class="picker-value">
            {{ formData.orderStatus }}
          </view>
        </picker>
      </view>

      <!-- 是否新生 -->
      <view class="form-item">
        <text class="form-label">学生类型</text>
        <radio-group @change="onNewStudentChange">
          <label class="radio-item">
            <radio value="true" :checked="formData.isNewStudent" />
            <text>新生</text>
          </label>
          <label class="radio-item">
            <radio value="false" :checked="!formData.isNewStudent" />
            <text>老生</text>
          </label>
        </radio-group>
      </view>

      <!-- 教师姓名 -->
      <view class="form-item">
        <text class="form-label">教师姓名</text>
        <input class="form-input" v-model="formData.teacherName" placeholder="请输入教师姓名" />
      </view>

      <!-- 订单标签 -->
      <view class="form-item">
        <text class="form-label">订单标签</text>
        <picker :range="orderTags" :value="tagIndex" @change="onTagChange">
          <view class="picker-value">
            {{ formData.orderTag || '请选择订单标签' }}
          </view>
        </picker>
      </view>

      <!-- 备注 -->
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
import type { Order } from '@shared/types'
import { ORDER_STATUSES, ORDER_TAGS } from '@shared/constants'
import { formatDate } from '@shared/utils'
import { getOrderDetail } from '@/api/order'
import { http } from '@/utils/request'

const loading = ref(false)
const submitting = ref(false)
const order = ref<Order | null>(null)
const formData = ref<any>({})
let orderId = 0

const orderStatuses = ORDER_STATUSES
const orderTags = ORDER_TAGS

const customerName = computed(() => {
  return order.value?.customerName || order.value?.wechatNickname || '未知客户'
})

const statusIndex = computed(() =>
  orderStatuses.findIndex(item => item.value === formData.value.orderStatus)
)

const tagIndex = computed(() =>
  orderTags.findIndex(item => item === formData.value.orderTag)
)

/**
 * 加载订单详情
 */
async function loadOrderDetail() {
  try {
    loading.value = true
    order.value = await getOrderDetail(orderId)
    formData.value = {
      courseName: order.value.courseName,
      paymentAmount: order.value.paymentAmount,
      paymentTime: order.value.paymentTime,
      orderStatus: order.value.orderStatus,
      isNewStudent: order.value.isNewStudent,
      teacherName: order.value.teacherName,
      orderTag: order.value.orderTag,
      remark: order.value.remark
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function onPaymentTimeChange(e: any) {
  formData.value.paymentTime = e.detail.value
}

function onStatusChange(e: any) {
  formData.value.orderStatus = orderStatuses[e.detail.value].value
}

function onNewStudentChange(e: any) {
  formData.value.isNewStudent = e.detail.value === 'true'
}

function onTagChange(e: any) {
  formData.value.orderTag = orderTags[e.detail.value]
}

/**
 * 提交保存
 */
async function handleSubmit() {
  // 表单验证
  if (!formData.value.courseName) {
    uni.showToast({ title: '请输入课程名称', icon: 'none' })
    return
  }

  if (!formData.value.paymentAmount || formData.value.paymentAmount <= 0) {
    uni.showToast({ title: '请输入正确的支付金额', icon: 'none' })
    return
  }

  try {
    submitting.value = true
    await http.patch(`/order/${orderId}`, formData.value)

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
  orderId = parseInt(options.id)
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.edit-order-page {
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
      color: #333;
    }

    .radio-item {
      display: inline-flex;
      align-items: center;
      margin-right: 40rpx;

      text {
        margin-left: 10rpx;
        font-size: 28rpx;
        color: #333;
      }
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
    background: #FFB800;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 40rpx;
  }
}
</style>
