/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo, LoginDto } from '@shared/types'
import { setStorage, getStorage, removeStorage, StorageKeys } from '@shared/utils'
import { login as loginApi, getUserInfo as getUserInfoApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref(false)

  /**
   * 初始化 - 从本地存储恢复状态
   */
  function init() {
    const savedToken = getStorage<string>(StorageKeys.TOKEN)
    const savedUserInfo = getStorage<UserInfo>(StorageKeys.USER_INFO)

    if (savedToken) {
      token.value = savedToken
      isLoggedIn.value = true
    }

    if (savedUserInfo) {
      userInfo.value = savedUserInfo
    }
  }

  /**
   * 登录
   */
  async function login(loginData: LoginDto) {
    try {
      const result = await loginApi(loginData)

      // 保存token和用户信息
      token.value = result.access_token
      userInfo.value = result.user
      isLoggedIn.value = true

      // 持久化到本地存储
      setStorage(StorageKeys.TOKEN, result.access_token)
      setStorage(StorageKeys.USER_INFO, result.user)

      return result
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 获取用户信息
   */
  async function getUserInfo() {
    try {
      const info = await getUserInfoApi()
      userInfo.value = info
      setStorage(StorageKeys.USER_INFO, info)
      return info
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 退出登录
   */
  function logout() {
    token.value = ''
    userInfo.value = null
    isLoggedIn.value = false

    // 清除本地存储
    removeStorage(StorageKeys.TOKEN)
    removeStorage(StorageKeys.USER_INFO)

    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/index'
    })
  }

  /**
   * 检查是否有权限
   */
  function hasPermission(permission: string): boolean {
    if (!userInfo.value || !userInfo.value.permissions) {
      return false
    }
    return userInfo.value.permissions.includes(permission)
  }

  /**
   * 检查是否有任一权限
   */
  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => hasPermission(permission))
  }

  /**
   * 检查是否拥有所有权限
   */
  function hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => hasPermission(permission))
  }

  return {
    // 状态
    token,
    userInfo,
    isLoggedIn,

    // 方法
    init,
    login,
    getUserInfo,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
})
