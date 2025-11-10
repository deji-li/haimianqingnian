<template>
  <view class="add-order-page">
    <view class="form-container">
      <!-- 客户选择 -->
      <view class="form-item required">
        <text class="form-label">客户</text>
        <view class="customer-select" @click="showCustomerPicker">
          <text :class="['customer-name', { placeholder: !selectedCustomer }]">
            {{ selectedCustomer ? selectedCustomer.realName || selectedCustomer.wechatNickname : '请选择客户' }}
          </text>
          <text class="arrow">></text>
        </view>
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
      <view class="form-item required">
        <text class="form-label">支付时间</text>
        <picker mode="date" :value="formData.paymentTime" @change="onPaymentTimeChange">
          <view class="picker-value">
            {{ formData.paymentTime || '请选择支付时间' }}
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
        <picker :range="orderTags" @change="onTagChange">
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
        {{ submitting ? '提交中...' : '提交' }}
      </button>
    </view>

    <!-- 客户选择弹窗 -->
    <uni-popup ref="customerPopup" type="bottom">
      <view class="customer-picker">
        <view class="picker-header">
          <text class="picker-title">选择客户</text>
          <text class="picker-close" @click="closeCustomerPicker">×</text>
        </view>
        <view class="search-box">
          <input
            class="search-input"
            v-model="searchKeyword"
            placeholder="搜索客户"
            @input="handleSearchCustomer"
          />
        </view>
        <scroll-view class="customer-list" scroll-y>
          <view
            v-for="customer in customerList"
            :key="customer.id"
            class="customer-item"
            @click="selectCustomer(customer)"
          >
            <view class="customer-info">
              <text class="customer-name">{{ customer.realName || customer.wechatNickname }}</text>
              <text class="customer-phone">{{ customer.phone }}</text>
            </view>
            <text class="customer-arrow">></text>
          </view>
          <view v-if="customerList.length === 0" class="empty-list">
            <text>未找到客户</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Customer, CreateOrderDto } from '@shared/types'
import { ORDER_TAGS } from '@shared/constants'
import { formatDate } from '@shared/utils'
import { searchCustomers } from '@/api/customer'
import { createOrder } from '@/api/order'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const formData = ref<CreateOrderDto>({
  customerId: undefined,
  courseName: '',
  paymentAmount: 0,
  paymentTime: formatDate(new Date()),
  isNewStudent: true,
  teacherName: '',
  orderTag: '',
  remark: ''
})

const submitting = ref(false)
const customerPopup = ref()
const selectedCustomer = ref<Customer | null>(null)
const customerList = ref<Customer[]>([])
const searchKeyword = ref('')
const orderTags = ORDER_TAGS

/**
 * 显示客户选择器
 */
function showCustomerPicker() {
  customerPopup.value.open()
  // 初始加载客户列表
  if (customerList.value.length === 0) {
    handleSearchCustomer()
  }
}

/**
 * 关闭客户选择器
 */
function closeCustomerPicker() {
  customerPopup.value.close()
}

/**
 * 搜索客户
 */
async function handleSearchCustomer() {
  try {
    const result = await searchCustomers(searchKeyword.value || '')
    customerList.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.error('搜索客户失败:', error)
  }
}

/**
 * 选择客户
 */
function selectCustomer(customer: Customer) {
  selectedCustomer.value = customer
  formData.value.customerId = customer.id
  closeCustomerPicker()
}

/**
 * 支付时间改变
 */
function onPaymentTimeChange(e: any) {
  formData.value.paymentTime = e.detail.value
}

/**
 * 是否新生改变
 */
function onNewStudentChange(e: any) {
  formData.value.isNewStudent = e.detail.value === 'true'
}

/**
 * 订单标签改变
 */
function onTagChange(e: any) {
  formData.value.orderTag = orderTags[e.detail.value]
}

/**
 * 提交订单
 */
async function handleSubmit() {
  // 表单验证
  if (!formData.value.customerId) {
    uni.showToast({ title: '请选择客户', icon: 'none' })
    return
  }

  if (!formData.value.courseName) {
    uni.showToast({ title: '请输入课程名称', icon: 'none' })
    return
  }

  if (!formData.value.paymentAmount || formData.value.paymentAmount <= 0) {
    uni.showToast({ title: '请输入正确的支付金额', icon: 'none' })
    return
  }

  if (!formData.value.paymentTime) {
    uni.showToast({ title: '请选择支付时间', icon: 'none' })
    return
  }

  try {
    submitting.value = true
    await createOrder(formData.value)

    uni.showToast({
      title: '创建成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    console.error('创建订单失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.add-order-page {
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
      color: #333;
    }

    .customer-select {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 80rpx;
      padding: 0 20rpx;
      background: #f5f5f5;
      border-radius: 10rpx;

      .customer-name {
        flex: 1;
        font-size: 28rpx;
        color: #333;

        &.placeholder {
          color: #999;
        }
      }

      .arrow {
        font-size: 28rpx;
        color: #ccc;
      }
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
    background: #3b82f6;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 40rpx;
  }
}

.customer-picker {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  height: 80vh;
  display: flex;
  flex-direction: column;

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .picker-title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .picker-close {
      font-size: 60rpx;
      color: #999;
      line-height: 1;
    }
  }

  .search-box {
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .search-input {
      width: 100%;
      height: 70rpx;
      background: #f5f5f5;
      border-radius: 35rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
    }
  }

  .customer-list {
    flex: 1;
    padding: 0 30rpx;

    .customer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      .customer-info {
        flex: 1;

        .customer-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }

        .customer-phone {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }

      .customer-arrow {
        font-size: 28rpx;
        color: #ccc;
      }
    }

    .empty-list {
      text-align: center;
      padding: 60rpx 0;
      color: #999;
      font-size: 28rpx;
    }
  }
}
</style>
