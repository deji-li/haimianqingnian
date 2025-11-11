<template>
  <view class="customer-detail-page">
    <view v-if="customer" class="detail-content">
      <!-- 客户基本信息 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
        </view>
        <view class="info-row">
          <text class="label">姓名:</text>
          <text class="value">{{ customer.realName || '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="label">微信昵称:</text>
          <text class="value">{{ customer.wechatNickname || '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="label">微信ID:</text>
          <text class="value">{{ customer.wechatId }}</text>
        </view>
        <view class="info-row">
          <text class="label">手机号:</text>
          <text class="value">{{ customer.phone ? formatPhone(customer.phone) : '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="label">意向等级:</text>
          <view :class="['intent-tag', `intent-${customer.customerIntent}`]">
            {{ customer.customerIntent }}意向
          </view>
        </view>
        <view class="info-row">
          <text class="label">生命周期:</text>
          <text class="value">{{ customer.lifecycleStage || '未设置' }}</text>
        </view>
      </view>

      <!-- 跟进记录 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">跟进记录</text>
          <text class="card-action" @click="showAddFollowDialog">+ 添加</text>
        </view>
        <view v-if="followRecords.length > 0" class="follow-list">
          <view v-for="record in followRecords" :key="record.id" class="follow-item">
            <view class="follow-header">
              <text class="operator">{{ record.operatorName }}</text>
              <text class="time">{{ formatDate(record.followTime, 'YYYY-MM-DD HH:mm') }}</text>
            </view>
            <view class="follow-content">{{ record.followContent }}</view>
            <view v-if="record.nextFollowTime" class="next-follow">
              下次跟进: {{ formatDate(record.nextFollowTime) }}
            </view>
          </view>
        </view>
        <view v-else class="empty-follow">
          <text>暂无跟进记录</text>
        </view>
      </view>

      <!-- 订单记录 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">订单记录</text>
        </view>
        <view v-if="orders.length > 0" class="order-list">
          <view v-for="order in orders" :key="order.id" class="order-item">
            <view class="order-header">
              <text class="order-name">{{ order.courseName }}</text>
              <text class="order-amount">¥{{ formatMoney(order.paymentAmount, false) }}</text>
            </view>
            <view class="order-info">
              <text>{{ formatDate(order.paymentTime) }}</text>
              <view :class="['order-status', `status-${order.orderStatus}`]">
                {{ order.orderStatus }}
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-order">
          <text>暂无订单记录</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <button class="action-btn" @click="handleEdit">编辑</button>
      <button class="action-btn" @click="handleCall">拨打电话</button>
      <button class="action-btn primary" @click="showAddFollowDialog">添加跟进</button>
    </view>

    <!-- 添加跟进记录弹窗 -->
    <uni-popup ref="followPopup" type="bottom">
      <view class="follow-form">
        <view class="form-header">
          <text class="form-title">添加跟进记录</text>
          <text class="form-close" @click="closeFollowDialog">×</text>
        </view>
        <textarea
          class="follow-textarea"
          v-model="followForm.followContent"
          placeholder="请输入跟进内容"
          maxlength="500"
        />
        <view class="form-row">
          <text class="form-label">下次跟进时间</text>
          <picker
            mode="date"
            :value="followForm.nextFollowTime"
            @change="onDateChange"
          >
            <view class="picker-value">
              {{ followForm.nextFollowTime || '选择日期' }}
            </view>
          </picker>
        </view>
        <button class="submit-btn" type="primary" @click="handleAddFollow">提交</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Customer, FollowRecord, Order } from '@shared/types'
import { formatDate, formatPhone, formatMoney } from '@shared/utils'
import { getCustomerDetail } from '@/api/customer'
import { getFollowRecords, createFollowRecord } from '@/api/follow'
import { getCustomerOrders } from '@/api/order'

const customer = ref<Customer | null>(null)
const followRecords = ref<FollowRecord[]>([])
const orders = ref<Order[]>([])
const followPopup = ref()

const followForm = ref({
  followContent: '',
  nextFollowTime: ''
})

let customerId = 0

/**
 * 加载客户详情
 */
async function loadCustomerDetail() {
  try {
    customer.value = await getCustomerDetail(customerId)
  } catch (error) {
    console.error('加载客户详情失败:', error)
  }
}

/**
 * 加载跟进记录
 */
async function loadFollowRecords() {
  try {
    followRecords.value = await getFollowRecords(customerId)
  } catch (error) {
    console.error('加载跟进记录失败:', error)
  }
}

/**
 * 加载订单记录
 */
async function loadOrders() {
  try {
    orders.value = await getCustomerOrders(customerId)
  } catch (error) {
    console.error('加载订单记录失败:', error)
  }
}

/**
 * 显示添加跟进弹窗
 */
function showAddFollowDialog() {
  followPopup.value.open()
}

/**
 * 关闭弹窗
 */
function closeFollowDialog() {
  followPopup.value.close()
}

/**
 * 日期选择
 */
function onDateChange(e: any) {
  followForm.value.nextFollowTime = e.detail.value
}

/**
 * 添加跟进记录
 */
async function handleAddFollow() {
  if (!followForm.value.followContent) {
    uni.showToast({
      title: '请输入跟进内容',
      icon: 'none'
    })
    return
  }

  try {
    await createFollowRecord({
      customerId,
      followContent: followForm.value.followContent,
      nextFollowTime: followForm.value.nextFollowTime || undefined
    })

    uni.showToast({
      title: '添加成功',
      icon: 'success'
    })

    followForm.value.followContent = ''
    followForm.value.nextFollowTime = ''
    closeFollowDialog()
    loadFollowRecords()
  } catch (error) {
    console.error('添加跟进记录失败:', error)
  }
}

/**
 * 编辑客户
 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages/customer/edit?id=${customerId}`
  })
}

/**
 * 拨打电话
 */
function handleCall() {
  if (!customer.value?.phone) {
    uni.showToast({
      title: '该客户未设置手机号',
      icon: 'none'
    })
    return
  }

  uni.makePhoneCall({
    phoneNumber: customer.value.phone
  })
}

onLoad((options: any) => {
  customerId = parseInt(options.id)
  loadCustomerDetail()
  loadFollowRecords()
  loadOrders()
})
</script>

<style lang="scss" scoped>
.customer-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.detail-content {
  padding: 20rpx;
}

.info-card {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .card-action {
      font-size: 28rpx;
      color: #FFB800;
    }
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 25rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      width: 180rpx;
      font-size: 28rpx;
      color: #666;
    }

    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .intent-tag {
      padding: 6rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      color: #fff;

      &.intent-高 {
        background: #ef4444;
      }

      &.intent-中 {
        background: #f59e0b;
      }

      &.intent-低 {
        background: #6b7280;
      }
    }
  }

  .follow-list,
  .order-list {
    .follow-item,
    .order-item {
      padding: 25rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }

    .follow-item {
      .follow-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15rpx;

        .operator {
          font-size: 26rpx;
          color: #666;
        }

        .time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .follow-content {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 10rpx;
      }

      .next-follow {
        font-size: 24rpx;
        color: #FFB800;
      }
    }

    .order-item {
      .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15rpx;

        .order-name {
          flex: 1;
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }

        .order-amount {
          font-size: 32rpx;
          font-weight: bold;
          color: #ef4444;
        }
      }

      .order-info {
        display: flex;
        justify-content: space-between;
        font-size: 24rpx;
        color: #999;

        .order-status {
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          color: #fff;
          font-size: 22rpx;

          &.status-待上课 {
            background: #f59e0b;
          }

          &.status-上课中 {
            background: #FFB800;
          }

          &.status-已完成 {
            background: #10b981;
          }

          &.status-已退款 {
            background: #6b7280;
          }
        }
      }
    }
  }

  .empty-follow,
  .empty-order {
    text-align: center;
    padding: 60rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;

  .action-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    margin: 0 10rpx;

    &.primary {
      background: #FFB800;
      color: #fff;
    }
  }
}

.follow-form {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .form-title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .form-close {
      font-size: 60rpx;
      color: #999;
      line-height: 1;
    }
  }

  .follow-textarea {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 10rpx;
    font-size: 28rpx;
    margin-bottom: 30rpx;
  }

  .form-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .form-label {
      font-size: 28rpx;
      color: #666;
    }

    .picker-value {
      font-size: 28rpx;
      color: #333;
    }
  }

  .submit-btn {
    width: 100%;
    height: 80rpx;
    background: #FFB800;
    color: #fff;
    font-size: 28rpx;
  }
}
</style>
