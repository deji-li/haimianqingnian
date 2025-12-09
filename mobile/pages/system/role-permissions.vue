<template>
  <view class="permissions-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="header-title">配置权限</text>
      <text class="header-subtitle">{{ roleName }}</text>
    </view>

    <!-- 权限类型标签 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="handleTabChange(tab.value)"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="tip-card">
      <text class="tip-icon">💡</text>
      <text class="tip-text">{{ getCurrentTip() }}</text>
    </view>

    <!-- 权限列表 -->
    <view class="permissions-list">
      <view v-for="permission in currentPermissions" :key="permission.id" class="permission-group">
        <!-- 父级权限 -->
        <view class="permission-item parent" @click="togglePermission(permission)">
          <view class="item-left">
            <view class="checkbox" :class="{ checked: isChecked(permission.id) }">
              <text v-if="isChecked(permission.id)">✓</text>
            </view>
            <text class="item-name">{{ permission.name }}</text>
          </view>
          <text v-if="permission.children && permission.children.length > 0" class="expand-icon">
            {{ expandedGroups.includes(permission.id) ? '▼' : '▶' }}
          </text>
        </view>

        <!-- 子级权限 -->
        <view
          v-if="permission.children && permission.children.length > 0 && expandedGroups.includes(permission.id)"
          class="children-permissions"
        >
          <view
            v-for="child in permission.children"
            :key="child.id"
            class="permission-item child"
            @click="togglePermission(child)"
          >
            <view class="item-left">
              <view class="checkbox small" :class="{ checked: isChecked(child.id) }">
                <text v-if="isChecked(child.id)">✓</text>
              </view>
              <text class="item-name">{{ child.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="currentPermissions.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无权限数据</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar">
      <button class="footer-btn cancel" @click="handleCancel">取消</button>
      <button class="footer-btn confirm" @click="handleSave">保存配置</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { http } from '@/utils/request'

interface Permission {
  id: number
  name: string
  code: string
  permissionType: string
  children?: Permission[]
}

const roleId = ref<number>(0)
const roleName = ref<string>('')
const activeTab = ref<string>('menu')
const loading = ref(false)
const saving = ref(false)

// 权限数据
const allPermissions = ref<Permission[]>([])
const menuPermissions = ref<Permission[]>([])
const pagePermissions = ref<Permission[]>([])
const functionPermissions = ref<Permission[]>([])
const dataPermissions = ref<Permission[]>([])

// 选中的权限
const checkedPermissions = ref<Set<number>>(new Set())

// 展开的分组
const expandedGroups = ref<number[]>([])

// 标签页配置
const tabs = [
  { label: '菜单权限', value: 'menu', icon: '📂' },
  { label: '页面权限', value: 'page', icon: '📄' },
  { label: '功能权限', value: 'function', icon: '🔧' },
  { label: '数据权限', value: 'data', icon: '🗄️' },
]

/**
 * 当前显示的权限列表
 */
const currentPermissions = computed(() => {
  switch (activeTab.value) {
    case 'menu':
      return menuPermissions.value
    case 'page':
      return pagePermissions.value
    case 'function':
      return functionPermissions.value
    case 'data':
      return dataPermissions.value
    default:
      return []
  }
})

/**
 * 获取当前提示文本
 */
function getCurrentTip(): string {
  const tips: Record<string, string> = {
    menu: '菜单权限控制左侧导航菜单的可见性',
    page: '页面权限控制页面的访问权限',
    function: '功能权限控制页面内的按钮和操作',
    data: '数据权限控制数据的访问范围',
  }
  return tips[activeTab.value] || ''
}

/**
 * 切换标签页
 */
function handleTabChange(tab: string) {
  activeTab.value = tab
}

/**
 * 按类型过滤权限
 */
function filterPermissionsByType(permissions: Permission[], type: string): Permission[] {
  const result: Permission[] = []
  for (const permission of permissions) {
    if (permission.permissionType === type) {
      result.push({
        ...permission,
        children: permission.children
          ? filterPermissionsByType(permission.children, type)
          : undefined,
      })
    } else if (permission.children) {
      const filteredChildren = filterPermissionsByType(permission.children, type)
      if (filteredChildren.length > 0) {
        result.push({
          ...permission,
          children: filteredChildren,
        })
      }
    }
  }
  return result
}

/**
 * 加载权限数据
 */
async function loadPermissions() {
  try {
    loading.value = true

    // 加载权限树
    const permissionsResult = await http.get('/permission/tree')
    allPermissions.value = permissionsResult.data || []

    // 按类型分组
    menuPermissions.value = filterPermissionsByType(allPermissions.value, 'menu')
    pagePermissions.value = filterPermissionsByType(allPermissions.value, 'page')
    functionPermissions.value = filterPermissionsByType(allPermissions.value, 'function')
    dataPermissions.value = filterPermissionsByType(allPermissions.value, 'data')

    // 加载角色已有权限
    const rolePermissionsResult = await http.get(`/permission/role/${roleId.value}`)
    const rolePermissions = rolePermissionsResult.data || []

    // 设置选中状态
    checkedPermissions.value = new Set(rolePermissions.map((p: Permission) => p.id))

    // 展开所有有选中子项的分组
    expandedGroups.value = getExpandedGroups(allPermissions.value)
  } catch (error) {
    console.error('加载权限失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 获取应该展开的分组
 */
function getExpandedGroups(permissions: Permission[]): number[] {
  const expanded: number[] = []
  for (const permission of permissions) {
    if (permission.children && permission.children.length > 0) {
      // 如果子项有被选中的，展开该分组
      const hasCheckedChild = permission.children.some(child => checkedPermissions.value.has(child.id))
      if (hasCheckedChild) {
        expanded.push(permission.id)
      }
    }
  }
  return expanded
}

/**
 * 检查是否选中
 */
function isChecked(id: number): boolean {
  return checkedPermissions.value.has(id)
}

/**
 * 切换权限选中状态
 */
function togglePermission(permission: Permission) {
  const id = permission.id

  // 如果有子项，切换展开状态
  if (permission.children && permission.children.length > 0) {
    const index = expandedGroups.value.indexOf(id)
    if (index > -1) {
      expandedGroups.value.splice(index, 1)
    } else {
      expandedGroups.value.push(id)
    }
  }

  // 切换选中状态
  if (checkedPermissions.value.has(id)) {
    checkedPermissions.value.delete(id)
    // 取消选中子项
    if (permission.children) {
      permission.children.forEach(child => {
        checkedPermissions.value.delete(child.id)
      })
    }
  } else {
    checkedPermissions.value.add(id)
    // 自动选中子项
    if (permission.children) {
      permission.children.forEach(child => {
        checkedPermissions.value.add(child.id)
      })
    }
  }

  // 触发响应式更新
  checkedPermissions.value = new Set(checkedPermissions.value)
}

/**
 * 保存配置
 */
async function handleSave() {
  if (saving.value) return

  try {
    saving.value = true

    const permissionIds = Array.from(checkedPermissions.value)

    await http.post(`/permission/assign/${roleId.value}`, {
      permissionIds
    })

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}

/**
 * 取消
 */
function handleCancel() {
  uni.navigateBack()
}

onLoad((options: any) => {
  if (options.id) {
    roleId.value = parseInt(options.id)
  }
  if (options.name) {
    roleName.value = decodeURIComponent(options.name)
  }
})

onMounted(() => {
  if (roleId.value) {
    loadPermissions()
  }
})
</script>

<style lang="scss" scoped>
.permissions-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 30rpx 40rpx;
  color: #fff;

  .header-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
  overflow-x: auto;

  .tab-item {
    flex-shrink: 0;
    padding: 20rpx 30rpx;
    margin-right: 15rpx;
    border-radius: 50rpx;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    transition: all 0.3s;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      .tab-icon,
      .tab-label {
        color: #fff;
      }
    }

    .tab-icon {
      font-size: 32rpx;
      margin-right: 10rpx;
    }

    .tab-label {
      font-size: 26rpx;
      color: #666;
      white-space: nowrap;
    }
  }
}

.tip-card {
  margin: 20rpx;
  padding: 25rpx 30rpx;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0e7ff 100%);
  border-radius: 15rpx;
  display: flex;
  align-items: center;

  .tip-icon {
    font-size: 32rpx;
    margin-right: 15rpx;
  }

  .tip-text {
    flex: 1;
    font-size: 26rpx;
    color: #667eea;
    line-height: 1.6;
  }
}

.permissions-list {
  padding: 0 20rpx 20rpx;

  .permission-group {
    margin-bottom: 20rpx;

    .permission-item {
      background: #fff;
      padding: 30rpx;
      border-radius: 15rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.parent {
        margin-bottom: 10rpx;
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
      }

      &.child {
        margin-left: 40rpx;
        margin-bottom: 10rpx;
        padding: 25rpx;
      }

      .item-left {
        display: flex;
        align-items: center;
        flex: 1;

        .checkbox {
          width: 40rpx;
          height: 40rpx;
          border: 3rpx solid #ddd;
          border-radius: 8rpx;
          margin-right: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;

          &.small {
            width: 36rpx;
            height: 36rpx;
          }

          &.checked {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: #667eea;

            text {
              color: #fff;
              font-size: 24rpx;
              font-weight: bold;
            }
          }
        }

        .item-name {
          font-size: 28rpx;
          color: #333;
        }
      }

      .expand-icon {
        font-size: 20rpx;
        color: #999;
        margin-left: 15rpx;
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

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .footer-btn {
    flex: 1;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 50rpx;
    font-size: 30rpx;
    border: none;

    &.cancel {
      background: #f5f5f5;
      color: #666;
      margin-right: 15rpx;
    }

    &.confirm {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}
</style>
