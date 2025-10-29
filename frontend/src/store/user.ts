import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi, type LoginParams, type UserInfo } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    const permissions = ref<string[]>([])

    // 检查权限
    const hasPermission = (permission: string | string[]): boolean => {
      if (!userInfo.value) return false

      // 超级管理员拥有所有权限
      if (userInfo.value.roleCode === 'admin' || userInfo.value.roleCode === 'super_admin') return true

      if (typeof permission === 'string') {
        return permissions.value.includes(permission)
      }

      // 数组形式：需要拥有所有权限
      return permission.every(p => permissions.value.includes(p))
    }

    // 检查是否拥有任一权限
    const hasAnyPermission = (perms: string[]): boolean => {
      if (!userInfo.value) return false
      if (userInfo.value.roleCode === 'admin' || userInfo.value.roleCode === 'super_admin') return true
      return perms.some(p => permissions.value.includes(p))
    }

    // 登录
    const login = async (loginParams: LoginParams) => {
      try {
        const res = await loginApi(loginParams)
        token.value = res.access_token
        userInfo.value = res.user
        permissions.value = res.user.permissions || []
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    }

    // 获取用户信息
    const getUserInfo = async () => {
      try {
        const res = await getUserInfoApi()
        userInfo.value = res
        permissions.value = res.permissions || []
      } catch (error) {
        console.error('Get user info failed:', error)
        throw error
      }
    }

    // 登出
    const logout = () => {
      token.value = ''
      userInfo.value = null
      permissions.value = []
      router.push('/login')
    }

    return {
      token,
      userInfo,
      permissions,
      hasPermission,
      hasAnyPermission,
      login,
      getUserInfo,
      logout,
    }
  },
  {
    persist: {
      key: 'education-crm-user',
      storage: localStorage,
    },
  }
)
