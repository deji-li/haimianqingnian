/**
 * 路由辅助工具
 * 用于在特定环境下自动导航到增强版页面
 */

import WeWorkEnv from '@/utils/wework-env'

export class RouteHelper {
  /**
   * 获取企业微信增强版页面路径
   * @param originalPath 原始页面路径
   * @returns 企业微信增强版页面路径
   */
  static getWeWorkEnhancedPath(originalPath: string): string {
    // 如果不在企业微信环境，返回原路径
    if (!WeWorkEnv.isWeWork()) {
      return originalPath
    }

    // 定义页面映射关系
    const weWorkPageMap: Record<string, string> = {
      // 客户详情页面映射
      'pages/customer/detail': 'pages/customer/detail-wework',
      // 可以添加更多页面映射
      // 'pages/order/detail': 'pages/order/detail-wework',
      // 'pages/customer/list': 'pages/customer/list-wework'
    }

    return weWorkPageMap[originalPath] || originalPath
  }

  /**
   * 智能导航到页面（自动选择增强版）
   * @param options uni.navigateTo选项
   */
  static smartNavigateTo(options: UniApp.NavigateToOptions): void {
    const enhancedPath = this.getWeWorkEnhancedPath(options.url)

    // 如果路径有变化，说明使用了增强版
    if (enhancedPath !== options.url) {
      console.log(`[RouteHelper] 路由增强: ${options.url} -> ${enhancedPath}`)
    }

    uni.navigateTo({
      ...options,
      url: enhancedPath
    })
  }

  /**
   * 智能��定向到页面（自动选择增强版）
   * @param options uni.reLaunch选项
   */
  static smartReLaunch(options: UniApp.ReLaunchOptions): void {
    const enhancedPath = this.getWeWorkEnhancedPath(options.url)

    if (enhancedPath !== options.url) {
      console.log(`[RouteHelper] 重定向增强: ${options.url} -> ${enhancedPath}`)
    }

    uni.reLaunch({
      ...options,
      url: enhancedPath
    })
  }

  /**
   * 智能切换标签页（自动选择增强版）
   * @param options uni.switchTab选项
   */
  static smartSwitchTab(options: UniApp.SwitchTabOptions): void {
    const enhancedPath = this.getWeWorkEnhancedPath(options.url)

    if (enhancedPath !== options.url) {
      console.log(`[RouteHelper] Tab切换增强: ${options.url} -> ${enhancedPath}`)
    }

    uni.switchTab({
      ...options,
      url: enhancedPath
    })
  }

  /**
   * 检查当前页面是否为企业微信增强版
   * @param currentPagePath 当前页面路径
   * @returns 是否为增强版页面
   */
  static isWeWorkEnhancedPage(currentPagePath: string): boolean {
    return currentPagePath.includes('-wework') || currentPagePath.startsWith('pages/wework/')
  }

  /**
   * 获取页面参数中的客户ID等关键信息
   * @param url 页面URL
   * @returns 解析后的参数对象
   */
  static parseUrlParams(url: string): Record<string, string> {
    const [path, queryString] = url.split('?')
    const params: Record<string, string> = {}

    if (queryString) {
      const urlParams = new URLSearchParams(queryString)
      urlParams.forEach((value, key) => {
        params[key] = value
      })
    }

    return params
  }

  /**
   * 构建带参数的URL
   * @param path 页面路径
   * @param params 参数对象
   * @returns 完整的URL
   */
  static buildUrl(path: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return path
    }

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')

    return queryString ? `${path}?${queryString}` : path
  }
}

// 兼容性导出
export default RouteHelper