/**
 * 统一错误处理
 */

interface ErrorResponse {
  code?: number
  message?: string
  data?: any
}

/**
 * 处理API错误
 */
export function handleApiError(error: any): string {
  console.error('API Error:', error)

  // 网络错误
  if (!error.response) {
    return '网络连接失败，请检查网络'
  }

  const response = error.response as ErrorResponse

  // HTTP状态码错误
  const statusCode = response.code || error.statusCode

  switch (statusCode) {
    case 400:
      return response.message || '请求参数错误'
    case 401:
      return '登录已过期，请重新登录'
    case 403:
      return '没有权限访问'
    case 404:
      return '请求的资源不存在'
    case 500:
      return '服务器错误，请稍后重试'
    case 503:
      return '服务暂时不可用'
    default:
      return response.message || '请求失败，请稍后重试'
  }
}

/**
 * 显示错误提示
 */
export function showError(error: any) {
  const message = handleApiError(error)

  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 错误日志上报
 */
export function reportError(error: any, context?: string) {
  // TODO: 实现错误上报到服务器
  console.error(`[Error Report] ${context || 'Unknown'}:`, error)

  // 生产环境可以上报到监控平台
  if (import.meta.env.PROD) {
    // uploadErrorLog({
    //   message: error.message,
    //   stack: error.stack,
    //   context,
    //   timestamp: new Date().toISOString()
    // })
  }
}
