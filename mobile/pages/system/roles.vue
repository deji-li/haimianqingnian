<template>
  <view class="roles-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input v-model="searchKeyword" placeholder="搜索角色名称" @input="handleSearch" />
      </view>
    </view>

    <!-- 角色列表 -->
    <view class="roles-list">
      <view v-for="role in roleList" :key="role.id" class="role-card" @click="handleRoleDetail(role)">
        <view class="role-header">
          <view class="role-left">
            <view class="role-icon" :style="{ background: getRoleColor(role.roleKey) }">
              <text>{{ getRoleEmoji(role.roleKey) }}</text>
            </view>
            <view class="role-info">
              <text class="role-name">{{ role.roleName }}</text>
              <text class="role-key">{{ role.roleKey }}</text>
            </view>
          </view>
          <view class="role-status">
            <view class="status-tag" :class="role.status === 1 ? 'status-active' : 'status-inactive'">
              {{ role.status === 1 ? '启用' : '禁用' }}
            </view>
          </view>
        </view>
        <view v-if="role.remark" class="role-desc">{{ role.remark }}</view>
        <view class="role-footer">
          <text class="role-tag" v-if="role.isSystem">🔒 系统内置</text>
          <text class="config-text" @click.stop="handleConfig(role)">配置权限 ></text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="roleList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无角色数据</text>
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
import { ref, onMounted } from 'vue'
import { http } from '@/utils/request'

interface Role {
  id: number
  roleName: string
  roleKey: string
  status: number
  remark?: string
  isSystem?: boolean
}

const roleList = ref<Role[]>([])
const allRoles = ref<Role[]>([])
const searchKeyword = ref('')
const loading = ref(false)

/**
 * 获取角色颜色
 */
function getRoleColor(roleKey: string): string {
  const colors: Record<string, string> = {
    admin: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sales_manager: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    sales: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    finance: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    teacher: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  }
  return colors[roleKey] || 'linear-gradient(135deg, #FFB800 0%, #FF9800 100%)'
}

/**
 * 获取角色图标
 */
function getRoleEmoji(roleKey: string): string {
  const emojis: Record<string, string> = {
    admin: '👑',
    sales_manager: '📊',
    sales: '💼',
    finance: '💰',
    teacher: '👨‍🏫',
  }
  return emojis[roleKey] || '🎭'
}

/**
 * 加载角色列表
 */
async function loadRoles() {
  try {
    loading.value = true
    const result = await http.get('/role')
    allRoles.value = result || []
    roleList.value = allRoles.value
  } catch (error) {
    console.error('加载角色列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 搜索角色
 */
function handleSearch() {
  if (!searchKeyword.value.trim()) {
    roleList.value = allRoles.value
    return
  }

  roleList.value = allRoles.value.filter(role =>
    role.roleName.includes(searchKeyword.value) ||
    role.roleKey.includes(searchKeyword.value)
  )
}

/**
 * 查看角色详情
 */
function handleRoleDetail(role: Role) {
  uni.navigateTo({
    url: `/pages/system/role-detail?id=${role.id}`
  })
}

/**
 * 配置权限
 */
function handleConfig(role: Role) {
  uni.navigateTo({
    url: `/pages/system/role-permissions?id=${role.id}&name=${role.roleName}`
  })
}

/**
 * 添加角色
 */
function handleAdd() {
  uni.navigateTo({
    url: '/pages/system/role-edit'
  })
}

onMounted(() => {
  loadRoles()
})
</script>

<style lang="scss" scoped>
.roles-page {
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

.roles-list {
  padding: 20rpx;

  .role-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .role-left {
        display: flex;
        align-items: center;
        flex: 1;

        .role-icon {
          width: 90rpx;
          height: 90rpx;
          border-radius: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44rpx;
          margin-right: 25rpx;
        }

        .role-info {
          flex: 1;

          .role-name {
            display: block;
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 8rpx;
          }

          .role-key {
            display: block;
            font-size: 24rpx;
            color: #999;
            font-family: monospace;
          }
        }
      }

      .role-status {
        .status-tag {
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
    }

    .role-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20rpx;
    }

    .role-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;

      .role-tag {
        font-size: 24rpx;
        color: #999;
      }

      .config-text {
        font-size: 26rpx;
        color: #667eea;
        font-weight: 500;
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
