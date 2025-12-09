<template>
  <view class="permissions-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input v-model="searchKeyword" placeholder="搜索权限名称或代码" @input="handleSearch" />
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view
          v-for="filter in filters"
          :key="filter.value"
          class="filter-item"
          :class="{ active: activeFilter === filter.value }"
          @click="handleFilterChange(filter.value)"
        >
          <text class="filter-icon">{{ filter.icon }}</text>
          <text class="filter-label">{{ filter.label }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 权限统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ totalCount }}</text>
        <text class="stat-label">总权限数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ menuCount }}</text>
        <text class="stat-label">菜单</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ pageCount }}</text>
        <text class="stat-label">页面</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ functionCount }}</text>
        <text class="stat-label">功能</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ dataCount }}</text>
        <text class="stat-label">数据</text>
      </view>
    </view>

    <!-- 权限列表 -->
    <view class="permissions-list">
      <view v-for="permission in filteredPermissions" :key="permission.id" class="permission-card">
        <view class="card-header">
          <view class="header-left">
            <view class="permission-type" :style="{ background: getTypeColor(permission.permissionType) }">
              <text>{{ getTypeLabel(permission.permissionType) }}</text>
            </view>
            <text class="permission-name">{{ permission.name }}</text>
          </view>
          <view class="permission-status" :class="permission.status === 1 ? 'status-active' : 'status-inactive'">
            {{ permission.status === 1 ? '启用' : '禁用' }}
          </view>
        </view>

        <view class="card-body">
          <view class="info-item">
            <text class="info-label">权限代码:</text>
            <text class="info-value code">{{ permission.code }}</text>
          </view>
          <view v-if="permission.module" class="info-item">
            <text class="info-label">所属模块:</text>
            <text class="info-value">{{ permission.module }}</text>
          </view>
          <view v-if="permission.resourceCode" class="info-item">
            <text class="info-label">资源代码:</text>
            <text class="info-value code">{{ permission.resourceCode }}</text>
          </view>
        </view>

        <view v-if="permission.description" class="card-footer">
          <text class="description">{{ permission.description }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredPermissions.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无权限数据</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { http } from '@/utils/request'

interface Permission {
  id: number
  name: string
  code: string
  module?: string
  permissionType: string
  resourceCode?: string
  status: number
  description?: string
}

const allPermissions = ref<Permission[]>([])
const searchKeyword = ref('')
const activeFilter = ref('all')
const loading = ref(false)

// 筛选选项
const filters = [
  { label: '全部', value: 'all', icon: '📋' },
  { label: '菜单', value: 'menu', icon: '📂' },
  { label: '页面', value: 'page', icon: '📄' },
  { label: '功能', value: 'function', icon: '🔧' },
  { label: '数据', value: 'data', icon: '🗄️' },
]

/**
 * 统计信息
 */
const totalCount = computed(() => allPermissions.value.length)
const menuCount = computed(() => allPermissions.value.filter(p => p.permissionType === 'menu').length)
const pageCount = computed(() => allPermissions.value.filter(p => p.permissionType === 'page').length)
const functionCount = computed(() => allPermissions.value.filter(p => p.permissionType === 'function').length)
const dataCount = computed(() => allPermissions.value.filter(p => p.permissionType === 'data').length)

/**
 * 过滤后的权限列表
 */
const filteredPermissions = computed(() => {
  let result = allPermissions.value

  // 按类型筛选
  if (activeFilter.value !== 'all') {
    result = result.filter(p => p.permissionType === activeFilter.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.code.toLowerCase().includes(keyword)
    )
  }

  return result
})

/**
 * 获取类型颜色
 */
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    menu: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    page: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    function: 'linear-gradient(135deg, #FFB800 0%, #FF9800 100%)',
    data: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  }
  return colors[type] || 'linear-gradient(135deg, #999 0%, #666 100%)'
}

/**
 * 获取类型标签
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    menu: '菜单',
    page: '页面',
    function: '功能',
    data: '数据',
  }
  return labels[type] || type
}

/**
 * 加载权限列表
 */
async function loadPermissions() {
  try {
    loading.value = true
    const result = await http.get('/permission/list')
    // 如果返回的是树形结构，需要扁平化
    allPermissions.value = flattenPermissions(result.data || [])
  } catch (error) {
    console.error('加载权限列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 扁平化权限树
 */
function flattenPermissions(permissions: Permission[]): Permission[] {
  const result: Permission[] = []
  for (const permission of permissions) {
    result.push(permission)
    if ((permission as any).children) {
      result.push(...flattenPermissions((permission as any).children))
    }
  }
  return result
}

/**
 * 搜索
 */
function handleSearch() {
  // 触发计算属性更新
}

/**
 * 切换筛选
 */
function handleFilterChange(filter: string) {
  activeFilter.value = filter
}

onMounted(() => {
  loadPermissions()
})
</script>

<style lang="scss" scoped>
.permissions-page {
  min-height: 100vh;
  background: #f5f5f5;
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

.filter-bar {
  background: #fff;
  padding: 20rpx 20rpx 15rpx;

  .filter-scroll {
    white-space: nowrap;

    .filter-item {
      display: inline-block;
      padding: 15rpx 30rpx;
      margin-right: 15rpx;
      border-radius: 50rpx;
      background: #f5f5f5;
      transition: all 0.3s;

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .filter-icon,
        .filter-label {
          color: #fff;
        }
      }

      .filter-icon {
        font-size: 28rpx;
        margin-right: 8rpx;
      }

      .filter-label {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

.stats-card {
  margin: 20rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .stat-item {
    text-align: center;

    .stat-value {
      display: block;
      font-size: 44rpx;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 10rpx;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.permissions-list {
  padding: 0 20rpx 40rpx;

  .permission-card {
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

        .permission-type {
          padding: 8rpx 20rpx;
          border-radius: 30rpx;
          margin-right: 15rpx;

          text {
            font-size: 22rpx;
            color: #fff;
            font-weight: 500;
          }
        }

        .permission-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }
      }

      .permission-status {
        padding: 8rpx 20rpx;
        border-radius: 30rpx;
        font-size: 22rpx;

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
          color: #999;
          margin-right: 15rpx;
          min-width: 160rpx;
        }

        .info-value {
          font-size: 26rpx;
          color: #333;
          flex: 1;

          &.code {
            font-family: monospace;
            background: #f5f5f5;
            padding: 5rpx 15rpx;
            border-radius: 8rpx;
            color: #667eea;
          }
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
</style>
