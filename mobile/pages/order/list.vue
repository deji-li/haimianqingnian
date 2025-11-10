<template>
  <view class="order-list-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="status in orderStatuses"
        :key="status.value"
        :class="['filter-item', { active: currentStatus === status.value }]"
        @click="handleFilterChange(status.value)"
      >
        {{ status.label }}
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      class="order-list"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view
        v-for="order in orderList"
        :key="order.id"
        class="order-item"
        @click="navigateToDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <view :class="['order-status', `status-${order.orderStatus}`]">
            {{ order.orderStatus }}
          </view>
        </view>

        <view class="order-content">
          <text class="course-name">{{ order.courseName }}</text>
          <text class="order-amount">¥{{ formatMoney(order.paymentAmount, false) }}</text>
        </view>

        <view class="order-info">
          <text class="info-item">客户: {{ order.customerName || order.wechatNickname || '未知' }}</text>
          <text class="info-item">{{ order.isNewStudent ? '新生' : '老生' }}</text>
        </view>

        <view class="order-footer">
          <text class="order-time">{{ formatDate(order.paymentTime) }}</text>
        </view>
      </view>

      <view v-if="!loading && orderList.length === 0" class="empty-list">
        <text>暂无订单数据</text>
      </view>

      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>

      <view v-if="!hasMore && orderList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="navigateToAdd">
      <text>+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Order, OrderQuery, OrderStatus } from '@shared/types'
import { ORDER_STATUSES } from '@shared/constants'
import { formatDate, formatMoney } from '@shared/utils'
import { getOrderList } from '@/api/order'

const orderList = ref<Order[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const currentStatus = ref<OrderStatus | undefined>(undefined)

const queryParams = ref<OrderQuery>({
  page: 1,
  pageSize: 20,
  orderStatus: undefined
})

const orderStatuses = [
  { label: '全部', value: undefined },
  ...ORDER_STATUSES
]

/**
 * 加载订单列表
 */
async function loadOrderList(append = false) {
  if (loading.value) return

  try {
    loading.value = true
    const result = await getOrderList(queryParams.value)

    if (append) {
      orderList.value = [...orderList.value, ...result.list]
    } else {
      orderList.value = result.list
    }

    hasMore.value = orderList.value.length < result.total
  } catch (error) {
    console.error('加载订单列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

/**
 * 筛选状态
 */
function handleFilterChange(status: any) {
  currentStatus.value = status
  queryParams.value.orderStatus = status
  queryParams.value.page = 1
  loadOrderList()
}

/**
 * 下拉刷新
 */
function onRefresh() {
  refreshing.value = true
  queryParams.value.page = 1
  loadOrderList()
}

/**
 * 加载更多
 */
function loadMore() {
  if (!hasMore.value || loading.value) return

  queryParams.value.page! += 1
  loadOrderList(true)
}

/**
 * 导航到详情
 */
function navigateToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/order/detail?id=${id}`
  })
}

/**
 * 导航到添加页面
 */
function navigateToAdd() {
  uni.navigateTo({
    url: '/pages/order/add'
  })
}

onMounted(() => {
  loadOrderList()
})
</script>

<style lang="scss" scoped>
.order-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.filter-bar {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  overflow-x: auto;
  white-space: nowrap;

  .filter-item {
    padding: 10rpx 30rpx;
    margin-right: 20rpx;
    background: #f5f5f5;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: #666;

    &.active {
      background: #3b82f6;
      color: #fff;
    }
  }
}

.order-list {
  flex: 1;
  padding: 20rpx;

  .order-item {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .order-no {
        font-size: 24rpx;
        color: #999;
      }

      .order-status {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        color: #fff;

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
    }

    .order-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .course-name {
        flex: 1;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .order-amount {
        font-size: 36rpx;
        font-weight: bold;
        color: #ef4444;
        margin-left: 20rpx;
      }
    }

    .order-info {
      display: flex;
      margin-bottom: 15rpx;

      .info-item {
        font-size: 26rpx;
        color: #666;
        margin-right: 30rpx;
      }
    }

    .order-footer {
      .order-time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .empty-list,
  .loading-more,
  .no-more {
    text-align: center;
    padding: 60rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}

.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.5);

  text {
    font-size: 80rpx;
    color: #fff;
    line-height: 1;
  }
}
</style>
