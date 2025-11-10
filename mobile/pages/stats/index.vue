<template>
  <view class="stats-page">
    <view class="page-header">
      <text class="page-title">数据统计</text>
    </view>

    <!-- 日期筛选 -->
    <view class="date-filter">
      <picker mode="date" :value="startDate" @change="onStartDateChange">
        <view class="date-item">
          <text class="date-label">开始日期</text>
          <text class="date-value">{{ startDate }}</text>
        </view>
      </picker>
      <text class="date-separator">至</text>
      <picker mode="date" :value="endDate" @change="onEndDateChange">
        <view class="date-item">
          <text class="date-label">结束日期</text>
          <text class="date-value">{{ endDate }}</text>
        </view>
      </picker>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <view class="stat-value">{{ stats.customerCount }}</view>
        <view class="stat-label">客户数</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ stats.orderCount }}</view>
        <view class="stat-label">订单数</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">¥{{ formatMoney(stats.totalAmount, false) }}</view>
        <view class="stat-label">总金额</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ stats.followCount }}</view>
        <view class="stat-label">跟进次数</view>
      </view>
    </view>

    <!-- 详细统计 -->
    <view class="detail-stats">
      <view class="stats-section">
        <view class="section-title">客户统计</view>
        <view class="stats-item">
          <text class="item-label">高意向客户</text>
          <text class="item-value">{{ stats.highIntentCount }}</text>
        </view>
        <view class="stats-item">
          <text class="item-label">中意向客户</text>
          <text class="item-value">{{ stats.mediumIntentCount }}</text>
        </view>
        <view class="stats-item">
          <text class="item-label">低意向客户</text>
          <text class="item-value">{{ stats.lowIntentCount }}</text>
        </view>
      </view>

      <view class="stats-section">
        <view class="section-title">订单统计</view>
        <view class="stats-item">
          <text class="item-label">新生订单</text>
          <text class="item-value">{{ stats.newStudentOrderCount }}</text>
        </view>
        <view class="stats-item">
          <text class="item-label">老生订单</text>
          <text class="item-value">{{ stats.oldStudentOrderCount }}</text>
        </view>
        <view class="stats-item">
          <text class="item-label">平均客单价</text>
          <text class="item-value">¥{{ formatMoney(stats.avgOrderAmount, false) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatMoney, formatDate } from '@shared/utils'
import { getOrderStats } from '@/api/order'

// 获取当月第一天和今天
const now = new Date()
const startDate = ref(formatDate(new Date(now.getFullYear(), now.getMonth(), 1)))
const endDate = ref(formatDate(now))

const stats = ref({
  customerCount: 0,
  orderCount: 0,
  totalAmount: 0,
  followCount: 0,
  highIntentCount: 0,
  mediumIntentCount: 0,
  lowIntentCount: 0,
  newStudentOrderCount: 0,
  oldStudentOrderCount: 0,
  avgOrderAmount: 0
})

/**
 * 加载统计数据
 */
async function loadStats() {
  try {
    uni.showLoading({ title: '加载中...' })

    const result = await getOrderStats({
      startDate: startDate.value,
      endDate: endDate.value
    })

    // TODO: 根据实际API返回的数据结构更新stats
    stats.value = {
      ...stats.value,
      ...result
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

function onStartDateChange(e: any) {
  startDate.value = e.detail.value
  loadStats()
}

function onEndDateChange(e: any) {
  endDate.value = e.detail.value
  loadStats()
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.stats-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  color: #fff;

  .page-title {
    font-size: 40rpx;
    font-weight: bold;
  }
}

.date-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #fff;
  margin-bottom: 20rpx;

  .date-item {
    flex: 1;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 10rpx;

    .date-label {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 10rpx;
    }

    .date-value {
      display: block;
      font-size: 28rpx;
      color: #333;
    }
  }

  .date-separator {
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.stats-cards {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
  gap: 20rpx;

  .stat-card {
    width: calc(50% - 10rpx);
    background: #fff;
    border-radius: 15rpx;
    padding: 40rpx 20rpx;
    text-align: center;

    .stat-value {
      font-size: 48rpx;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 15rpx;
    }

    .stat-label {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.detail-stats {
  padding: 0 20rpx 20rpx;

  .stats-section {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 30rpx;
    }

    .stats-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .item-label {
        font-size: 28rpx;
        color: #666;
      }

      .item-value {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }
  }
}
</style>
