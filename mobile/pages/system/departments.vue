<template>
  <view class="departments-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input v-model="searchKeyword" placeholder="搜索部门名称" @input="handleSearch" />
      </view>
    </view>

    <!-- 部门列表 -->
    <view class="departments-list">
      <view v-for="dept in filteredDepartments" :key="dept.id" class="dept-card">
        <view class="card-header">
          <view class="header-left">
            <view class="dept-icon">
              <text>🏢</text>
            </view>
            <view class="dept-info">
              <text class="dept-name">{{ dept.name }}</text>
              <text v-if="dept.code" class="dept-code">部门编号：{{ dept.code }}</text>
            </view>
          </view>
          <view class="dept-status" :class="dept.status === 1 ? 'status-active' : 'status-inactive'">
            {{ dept.status === 1 ? '启用' : '禁用' }}
          </view>
        </view>

        <view class="card-body">
          <view v-if="dept.managerName" class="info-item">
            <text class="info-label">👤 负责人:</text>
            <text class="info-value">{{ dept.managerName }}</text>
          </view>
          <view v-if="dept.phone" class="info-item">
            <text class="info-label">📞 电话:</text>
            <text class="info-value">{{ dept.phone }}</text>
          </view>
          <view v-if="dept.parentName" class="info-item">
            <text class="info-label">📂 上级部门:</text>
            <text class="info-value">{{ dept.parentName }}</text>
          </view>
        </view>

        <view v-if="dept.description" class="card-footer">
          <text class="description">{{ dept.description }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredDepartments.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">🏢</text>
        <text class="empty-text">暂无部门数据</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="handleAdd">
      <text>+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getDepartmentList } from '@/api/system'

interface Department {
  id: number
  name: string
  code?: string
  managerName?: string
  phone?: string
  parentName?: string
  status: number
  description?: string
}

const allDepartments = ref<Department[]>([])
const searchKeyword = ref('')
const loading = ref(false)

/**
 * 过滤后的部门列表
 */
const filteredDepartments = computed(() => {
  if (!searchKeyword.value.trim()) {
    return allDepartments.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return allDepartments.value.filter(dept =>
    dept.name.toLowerCase().includes(keyword) ||
    (dept.code && dept.code.toLowerCase().includes(keyword))
  )
})

/**
 * 加载部门列表
 */
async function loadDepartments() {
  try {
    loading.value = true
    const result = await getDepartmentList()
    allDepartments.value = result || []
  } catch (error) {
    console.error('加载部门列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
function handleSearch() {
  // 触发计算属性更新
}

/**
 * 添加部门
 */
function handleAdd() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  loadDepartments()
})
</script>

<style lang="scss" scoped>
.departments-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.search-bar {
  padding: 20rpx;
  background: #fff;

  .search-input {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 50rpx;
    padding: 20rpx 30rpx;

    .search-icon {
      font-size: 32rpx;
      margin-right: 15rpx;
    }

    input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.departments-list {
  padding: 20rpx;

  .dept-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .header-left {
        display: flex;
        align-items: center;
        flex: 1;

        .dept-icon {
          width: 90rpx;
          height: 90rpx;
          border-radius: 20rpx;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44rpx;
          margin-right: 25rpx;
        }

        .dept-info {
          flex: 1;

          .dept-name {
            display: block;
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 8rpx;
          }

          .dept-code {
            display: block;
            font-size: 24rpx;
            color: #999;
          }
        }
      }

      .dept-status {
        padding: 10rpx 20rpx;
        border-radius: 30rpx;
        font-size: 24rpx;

        &.status-active {
          background: #d1fae5;
          color: #10b981;
        }

        &.status-inactive {
          background: #fee2e2;
          color: #ef4444;
        }
      }
    }

    .card-body {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 15rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-size: 26rpx;
          color: #666;
          margin-right: 15rpx;
          min-width: 180rpx;
        }

        .info-value {
          font-size: 26rpx;
          color: #333;
          flex: 1;
        }
      }
    }

    .card-footer {
      padding-top: 20rpx;
      margin-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;

      .description {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 120rpx 0;

  .empty-icon {
    display: block;
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .empty-text {
    display: block;
    font-size: 28rpx;
    color: #999;
  }
}

.loading {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(79, 172, 254, 0.4);

  text {
    font-size: 60rpx;
    color: #fff;
    font-weight: 300;
  }
}
</style>
