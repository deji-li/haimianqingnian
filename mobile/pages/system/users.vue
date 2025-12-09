<template>
  <view class="users-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input v-model="searchKeyword" placeholder="搜索用户姓名或账号" @input="handleSearch" />
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <scroll-view scroll-x class="tabs-scroll">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeTab === tab.value }"
          @click="handleTabChange(tab.value)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 用户列表 -->
    <view class="users-list">
      <view v-for="user in filteredUsers" :key="user.id" class="user-card" @click="handleUserDetail(user)">
        <view class="card-left">
          <image class="avatar" :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="user-info">
            <text class="user-name">{{ user.realName }}</text>
            <text class="user-account">@{{ user.username }}</text>
          </view>
        </view>
        <view class="card-right">
          <view class="role-tag" :style="{ background: getRoleColor(user.roleCode) }">
            {{ user.roleName }}
          </view>
          <view class="status-tag" :class="user.status === 1 ? 'status-active' : 'status-inactive'">
            {{ user.status === 1 ? '正常' : '禁用' }}
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredUsers.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-text">暂无用户数据</text>
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
import { http } from '@/utils/request'

interface User {
  id: number
  username: string
  realName: string
  avatar?: string
  roleCode: string
  roleName: string
  departmentName?: string
  campusName?: string
  status: number
}

const allUsers = ref<User[]>([])
const searchKeyword = ref('')
const activeTab = ref('all')
const loading = ref(false)

// 筛选标签
const tabs = [
  { label: '全部', value: 'all' },
  { label: '管理员', value: 'admin' },
  { label: '销售主管', value: 'sales_manager' },
  { label: '销售顾问', value: 'sales' },
  { label: '财务人员', value: 'finance' },
  { label: '授课老师', value: 'teacher' },
]

/**
 * 过滤后的用户列表
 */
const filteredUsers = computed(() => {
  let result = allUsers.value

  // 按角色筛选
  if (activeTab.value !== 'all') {
    result = result.filter(u => u.roleCode === activeTab.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(u =>
      u.realName.toLowerCase().includes(keyword) ||
      u.username.toLowerCase().includes(keyword)
    )
  }

  return result
})

/**
 * 获取角色颜色
 */
function getRoleColor(roleCode: string): string {
  const colors: Record<string, string> = {
    admin: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sales_manager: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    sales: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    finance: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    teacher: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  }
  return colors[roleCode] || 'linear-gradient(135deg, #FFB800 0%, #FF9800 100%)'
}

/**
 * 加载用户列表
 */
async function loadUsers() {
  try {
    loading.value = true
    const result = await http.get('/user')
    allUsers.value = result || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
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
 * 切换标签
 */
function handleTabChange(tab: string) {
  activeTab.value = tab
}

/**
 * 查看用户详情
 */
function handleUserDetail(user: User) {
  uni.navigateTo({
    url: `/pages/system/user-detail?id=${user.id}`
  })
}

/**
 * 添加用户
 */
function handleAdd() {
  uni.navigateTo({
    url: '/pages/system/user-edit'
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.users-page {
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

.filter-tabs {
  background: #fff;
  padding: 20rpx;

  .tabs-scroll {
    white-space: nowrap;

    .tab-item {
      display: inline-block;
      padding: 15rpx 30rpx;
      margin-right: 15rpx;
      border-radius: 50rpx;
      background: #f5f5f5;
      font-size: 26rpx;
      color: #666;
      transition: all 0.3s;

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }
    }
  }
}

.users-list {
  padding: 20rpx;

  .user-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .card-left {
      display: flex;
      align-items: center;
      flex: 1;

      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50rpx;
        margin-right: 25rpx;
        border: 3rpx solid #f0f0f0;
      }

      .user-info {
        flex: 1;

        .user-name {
          display: block;
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 10rpx;
        }

        .user-account {
          display: block;
          font-size: 24rpx;
          color: #999;
          font-family: monospace;
        }
      }
    }

    .card-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .role-tag {
        padding: 8rpx 20rpx;
        border-radius: 30rpx;
        font-size: 22rpx;
        color: #fff;
        margin-bottom: 10rpx;
      }

      .status-tag {
        padding: 6rpx 15rpx;
        border-radius: 30rpx;
        font-size: 20rpx;

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.4);

  text {
    font-size: 60rpx;
    color: #fff;
    font-weight: 300;
  }
}
</style>
