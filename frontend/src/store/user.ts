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

    // 登录
    const login = async (loginParams: LoginParams) => {
      try {
        const res = await loginApi(loginParams)
        token.value = res.access_token
        userInfo.value = res.user
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
      } catch (error) {
        console.error('Get user info failed:', error)
        throw error
      }
    }

    // 登出
    const logout = () => {
      token.value = ''
      userInfo.value = null
      router.push('/login')
    }

    return {
      token,
      userInfo,
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
