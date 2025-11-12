import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token

    console.log('=== REQUEST INTERCEPTOR DEBUG ===')
    console.log('userStore:', userStore)
    console.log('token from store:', token)
    console.log('config.url:', config.url)
    console.log('config.headers before:', config.headers)
    console.log('=================================')

    // 添加 Token - 使用正确的方式设置header
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('Authorization header set:', config.headers['Authorization'])
      console.log('config.headers after:', config.headers)
    } else {
      console.warn('No token found in userStore!')
    }

    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    console.log('[响应拦截器] 收到响应:', {
      url: response.config.url,
      status: response.status,
      data: res
    })

    // 业务成功
    if (res.code === 200) {
      console.log('[响应拦截器] 业务成功，返回数据:', res.data)
      return res.data
    }

    // 业务失败
    console.error('[响应拦截器] 业务失败:', res)
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || 'Error'))
  },
  (error) => {
    console.error('Response Error:', error)

    // 判断是否为静默请求（某些后台接口失败不应该弹出提示）
    const config = error.config
    const isSilent = config?.headers?.['X-Silent-Error']

    if (!isSilent) {
      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 401:
            ElMessage.error('未授权，请重新登录')
            const userStore = useUserStore()
            userStore.logout()
            router.push('/login')
            break
          case 403:
            ElMessage.error('拒绝访问')
            break
          case 404:
            ElMessage.error('请求资源不存在')
            break
          case 500:
            ElMessage.error('服务器错误')
            break
          default:
            ElMessage.error(data?.message || '请求失败')
        }
      } else if (error.request) {
        ElMessage.error('网络错误，请检查网络连接')
      } else {
        ElMessage.error('请求配置错误')
      }
    }

    return Promise.reject(error)
  }
)

export default service
