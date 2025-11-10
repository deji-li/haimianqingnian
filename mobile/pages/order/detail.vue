<template>
  <view class="order-detail-page">
    <view v-if="order" class="detail-content">
      <!-- 订单状态 -->
      <view class="status-card">
        <view :class="['status-badge', `status-${order.orderStatus}`]">
          {{ order.orderStatus }}
        </view>
        <text class="order-no">订单号: {{ order.orderNo }}</text>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <view class="card-title">订单信息</view>
        <view class="info-row">
          <text class="label">课程名称:</text>
          <text class="value">{{ order.courseName }}</text>
        </view>
        <view class="info-row">
          <text class="label">支付金额:</text>
          <text class="value amount">¥{{ formatMoney(order.paymentAmount, false) }}</text>
        </view>
        <view class="info-row">
          <text class="label">支付时间:</text>
          <text class="value">{{ formatDate(order.paymentTime, 'YYYY-MM-DD HH:mm') }}</text>
        </view>
        <view class="info-row">
          <text class="label">学生类型:</text>
          <text class="value">{{ order.isNewStudent ? '新生' : '老生' }}</text>
        </view>
        <view v-if="order.teacherName" class="info-row">
          <text class="label">教师:</text>
          <text class="value">{{ order.teacherName }}</text>
        </view>
        <view v-if="order.remark" class="info-row">
          <text class="label">备注:</text>
          <text class="value">{{ order.remark }}</text>
        </view>
      </view>

      <!-- 客户信息 -->
      <view class="info-card">
        <view class="card-title">客户信息</view>
        <view class="info-row">
          <text class="label">客户姓名:</text>
          <text class="value">{{ order.customerName || order.wechatNickname || '未知' }}</text>
        </view>
        <view v-if="order.phone" class="info-row">
          <text class="label">联系电话:</text>
          <text class="value">{{ formatPhone(order.phone) }}</text>
        </view>
        <view v-if="order.wechatId" class="info-row">
          <text class="label">微信ID:</text>
          <text class="value">{{ order.wechatId }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <button class="action-btn" @click="handleEdit">编辑订单</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Order } from '@shared/types'
import { formatDate, formatMoney, formatPhone } from '@shared/utils'
import { getOrderDetail } from '@/api/order'

const order = ref<Order | null>(null)

/**
 * 加载订单详情
 */
async function loadOrderDetail(id: number) {
  try {
    order.value = await getOrderDetail(id)
  } catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

/**
 * 编辑订单
 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages/order/edit?id=${order.value?.id}`
  })
}

onLoad((options: any) => {
  const orderId = parseInt(options.id)
  loadOrderDetail(orderId)
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.detail-content {
  padding: 20rpx;
}

.status-card {
  background: #fff;
  border-radius: 15rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  text-align: center;

  .status-badge {
    display: inline-block;
    padding: 15rpx 50rpx;
    border-radius: 50rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;

    &.status-待上课 {
      background: #f59e0b;
    }

    &.status-上课中 {
      background: #3b82f6;
    }

    &.status-已完成 {
      background: #10b981;
    }

    &.status-已退款 {
      background: #6b7280;
    }
  }

  .order-no {
    display: block;
    font-size: 24rpx;
    color: #999;
  }
}

.info-card {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }

  .info-row {
    display: flex;
    align-items: flex-start;
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

      &.amount {
        font-size: 36rpx;
        font-weight: bold;
        color: #ef4444;
      }
    }
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
    background: #3b82f6;
    color: #fff;
  }
}
</style>
