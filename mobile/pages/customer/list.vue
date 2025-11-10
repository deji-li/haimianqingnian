<template>
  <view class="customer-list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        class="search-input"
        type="text"
        v-model="searchKeyword"
        placeholder="搜索客户姓名/微信号/手机号"
        @confirm="handleSearch"
      />
      <button class="search-btn" type="primary" size="mini" @click="handleSearch">搜索</button>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="stage in lifecycleStages"
        :key="stage.value"
        :class="['filter-item', { active: queryParams.lifecycleStage === stage.value }]"
        @click="handleFilterChange(stage.value)"
      >
        {{ stage.label }}
      </view>
    </view>

    <!-- 客户列表 -->
    <scroll-view
      class="customer-list"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view
        v-for="customer in customerList"
        :key="customer.id"
        class="customer-item"
        @click="navigateToDetail(customer.id)"
      >
        <view class="customer-header">
          <view class="customer-name">
            <text class="name">{{ customer.realName || customer.wechatNickname || '未命名客户' }}</text>
            <view :class="['intent-tag', `intent-${customer.customerIntent}`]">
              {{ customer.customerIntent }}意向
            </view>
          </view>
          <text class="customer-time">{{ formatRelativeTime(customer.createTime) }}</text>
        </view>

        <view class="customer-info">
          <text class="info-item">微信: {{ customer.wechatId }}</text>
          <text v-if="customer.phone" class="info-item">电话: {{ formatPhone(customer.phone) }}</text>
        </view>

        <view v-if="customer.nextFollowTime" class="customer-follow">
          <text>下次跟进: {{ formatDate(customer.nextFollowTime) }}</text>
        </view>
      </view>

      <view v-if="!loading && customerList.length === 0" class="empty-list">
        <text>暂无客户数据</text>
      </view>

      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>

      <view v-if="!hasMore && customerList.length > 0" class="no-more">
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
import type { Customer, CustomerQuery } from '@shared/types'
import { LIFECYCLE_STAGES } from '@shared/constants'
import { formatDate, formatPhone, formatRelativeTime } from '@shared/utils'
import { getCustomerList } from '@/api/customer'

const searchKeyword = ref('')
const customerList = ref<Customer[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)

const queryParams = ref<CustomerQuery>({
  page: 1,
  pageSize: 20,
  lifecycleStage: undefined,
  keyword: ''
})

const lifecycleStages = [
  { label: '全部', value: undefined },
  ...LIFECYCLE_STAGES
]

/**
 * 加载客户列表
 */
async function loadCustomerList(append = false) {
  if (loading.value) return

  try {
    loading.value = true
    const result = await getCustomerList(queryParams.value)

    if (append) {
      customerList.value = [...customerList.value, ...result.list]
    } else {
      customerList.value = result.list
    }

    hasMore.value = customerList.value.length < result.total
  } catch (error) {
    console.error('加载客户列表失败:', error)
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
 * 搜索
 */
function handleSearch() {
  queryParams.value.keyword = searchKeyword.value
  queryParams.value.page = 1
  loadCustomerList()
}

/**
 * 筛选
 */
function handleFilterChange(stage: any) {
  queryParams.value.lifecycleStage = stage
  queryParams.value.page = 1
  loadCustomerList()
}

/**
 * 下拉刷新
 */
function onRefresh() {
  refreshing.value = true
  queryParams.value.page = 1
  loadCustomerList()
}

/**
 * 加载更多
 */
function loadMore() {
  if (!hasMore.value || loading.value) return

  queryParams.value.page! += 1
  loadCustomerList(true)
}

/**
 * 导航到详情
 */
function navigateToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/customer/detail?id=${id}`
  })
}

/**
 * 导航到添加页面
 */
function navigateToAdd() {
  uni.navigateTo({
    url: '/pages/customer/add'
  })
}

onMounted(() => {
  loadCustomerList()
})
</script>

<style lang="scss" scoped>
.customer-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;

  .search-input {
    flex: 1;
    height: 70rpx;
    background: #f5f5f5;
    border-radius: 35rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
  }

  .search-btn {
    margin-left: 20rpx;
  }
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

.customer-list {
  flex: 1;
  padding: 20rpx;

  .customer-item {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .customer-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;

      .customer-name {
        flex: 1;

        .name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-right: 15rpx;
        }

        .intent-tag {
          display: inline-block;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          font-size: 22rpx;
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

      .customer-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .customer-info {
      margin-bottom: 15rpx;

      .info-item {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 8rpx;
      }
    }

    .customer-follow {
      font-size: 24rpx;
      color: #3b82f6;
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
