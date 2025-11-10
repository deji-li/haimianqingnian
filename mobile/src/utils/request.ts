/**
 * 网络请求封装 - uni-app版本
 */
import type { ApiResponse } from '@shared/types'
import { getStorage, StorageKeys } from '@shared/utils'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
}

// API基础URL
const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api'

/**
 * 请求拦截器
 */
function requestInterceptor(options: RequestOptions) {
  // 添加token
  const token = getStorage<string>(StorageKeys.TOKEN)
  if (token) {
    options.header = {
      ...options.header,
      Authorization: `Bearer ${token}`
    }
  }

  // 显示加载提示
  if (options.showLoading !== false) {
    uni.showLoading({
      title: options.loadingText || '加载中...',
      mask: true
    })
  }

  return options
}

/**
 * 响应拦截器
 */
function responseInterceptor(response: any, options: RequestOptions) {
  // 隐藏加载提示
  if (options.showLoading !== false) {
    uni.hideLoading()
  }

  const { statusCode, data } = response

  // HTTP状态码检查
  if (statusCode !== 200) {
    let errorMessage = '请求失败'

    switch (statusCode) {
      case 401:
        errorMessage = '未授权，请重新登录'
        // 清除token并跳转到登录页
        uni.removeStorageSync(StorageKeys.TOKEN)
        uni.reLaunch({ url: '/pages/login/index' })
        break
      case 403:
        errorMessage = '没有权限访问'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        break
      case 500:
        errorMessage = '服务器错误'
        break
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000
    })

    return Promise.reject(new Error(errorMessage))
  }

  // 业务状态码检查
  if (data.code && data.code !== 200) {
    uni.showToast({
      title: data.message || '请求失败',
      icon: 'none',
      duration: 2000
    })
    return Promise.reject(new Error(data.message))
  }

  return data.data !== undefined ? data.data : data
}

/**
 * 统一请求方法
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  // 处理URL参数
  let url = BASE_URL + options.url
  if (options.params) {
    const queryString = Object.entries(options.params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')

    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }
  }

  // 请求拦截
  const interceptedOptions = requestInterceptor(options)

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url,
      method: interceptedOptions.method || 'GET',
      data: interceptedOptions.data,
      header: {
        'Content-Type': 'application/json',
        ...interceptedOptions.header
      },
      success: (res) => {
        try {
          const result = responseInterceptor(res, interceptedOptions)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (interceptedOptions.showLoading !== false) {
          uni.hideLoading()
        }

        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        })
        reject(err)
      }
    })
  })
}

// 便捷方法
export const http = {
  get: <T = any>(url: string, params?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'GET', params, ...options }),

  post: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'POST', data, ...options }),

  put: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PUT', data, ...options }),

  delete: <T = any>(url: string, params?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', params, ...options }),

  patch: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PATCH', data, ...options })
}
