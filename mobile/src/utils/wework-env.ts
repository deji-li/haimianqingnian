/**
 * 企业微信环境检测工具
 * 用于检测当前运行环境是否为企业微信
 */

export interface PlatformInfo {
  platform: 'wework' | 'h5' | 'app' | 'mp' | 'unknown'
  isWeWork: boolean
  userAgent: string
}

export class WeWorkEnv {
  private static _platformInfo: PlatformInfo | null = null

  /**
   * 检测是否在企业微信环境中
   */
  static isWeWork(): boolean {
    this._detectPlatform()
    return this._platformInfo!.isWeWork
  }

  /**
   * 获取当前平台类型
   */
  static getPlatform(): 'wework' | 'h5' | 'app' | 'mp' | 'unknown' {
    this._detectPlatform()
    return this._platformInfo!.platform
  }

  /**
   * 获取平台详细信息
   */
  static getPlatformInfo(): PlatformInfo {
    this._detectPlatform()
    return this._platformInfo!
  }

  /**
   * 检测平台信息
   */
  private static _detectPlatform(): void {
    if (this._platformInfo) {
      return
    }

    const userAgent = this._getUserAgent()

    this._platformInfo = {
      platform: this._getPlatformType(userAgent),
      isWeWork: this._isWeWorkEnvironment(userAgent),
      userAgent
    }
  }

  /**
   * 获取用户代理字符串
   */
  private static _getUserAgent(): string {
    // #ifdef H5
    return navigator.userAgent
    // #endif

    // #ifdef MP-WEIXIN
    return 'mp-weixin'
    // #endif

    // #ifdef APP-PLUS
    return uni.getSystemInfoSync().platform || 'app'
    // #endif

    // #ifdef MP
    return 'mp'
    // #endif

    return 'unknown'
  }

  /**
   * 判断是否为企业微信环境
   */
  private static _isWeWorkEnvironment(userAgent: string): boolean {
    // H5环境检测
    // #ifdef H5
    // 检查是否在企业微信浏览器中
    return /wxwork/i.test(userAgent) ||
           /micromessenger/i.test(userAgent) && /wxwork/i.test(userAgent) ||
           window.wx?.env?.platform === 'workwx'
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序环境检测
    try {
      const accountInfo = wx.getAccountInfoSync?.()
      return accountInfo?.miniProgram?.envVersion === 'trial' ||
             accountInfo?.miniProgram?.envVersion === 'develop'
    } catch (error) {
      return false
    }
    // #endif

    // #ifdef APP-PLUS
    // App环境检测企业微信
    try {
      // 通过plus.runtime检测
      const runtime = plus.runtime
      return runtime?.application?.widget?.id?.includes('wework') || false
    } catch (error) {
      return false
    }
    // #endif

    return false
  }

  /**
   * 获取平台类型
   */
  private static _getPlatformType(userAgent: string): 'wework' | 'h5' | 'app' | 'mp' | 'unknown' {
    // #ifdef H5
    if (/micromessenger/i.test(userAgent)) {
      if (/wxwork/i.test(userAgent)) {
        return 'wework'
      }
      return 'h5'
    }
    return 'h5'
    // #endif

    // #ifdef MP-WEIXIN
    return 'mp'
    // #endif

    // #ifdef APP-PLUS
    return 'app'
    // #endif

    // #ifdef MP
    return 'mp'
    // #endif

    return 'unknown'
  }

  /**
   * 检查企业微信功能可用性
   */
  static checkWeWorkFeatures(): {
    jssdk: boolean
    oauth: boolean
    selectContact: boolean
    openChat: boolean
    shareMessage: boolean
  } {
    const features = {
      jssdk: false,
      oauth: false,
      selectContact: false,
      openChat: false,
      shareMessage: false
    }

    if (!this.isWeWork()) {
      return features
    }

    // 检查JS-SDK可用性
    // #ifdef H5
    features.jssdk = typeof window.wx !== 'undefined'
    // #endif

    // #ifdef MP-WEIXIN
    features.jssdk = typeof wx !== 'undefined'
    // #endif

    // #ifdef APP-PLUS
    features.jssdk = typeof wx !== 'undefined'
    // #endif

    if (features.jssdk) {
      const wxGlobal = typeof wx !== 'undefined' ? wx : (window as any).wx

      features.oauth = true // 企业微信都支持OAuth
      features.selectContact = typeof wxGlobal?.invoke === 'function'
      features.openChat = typeof wxGlobal?.invoke === 'function'
      features.shareMessage = typeof wxGlobal?.onMenuShareAppMessage === 'function'
    }

    return features
  }

  /**
   * 获取企业微信版本信息
   */
  static getWeWorkVersion(): string | null {
    if (!this.isWeWork()) {
      return null
    }

    // #ifdef H5
    const userAgent = this._getUserAgent()
    const match = userAgent.match(/wxwork\/([\d.]+)/)
    return match ? match[1] : null
    // #endif

    // #ifdef MP-WEIXIN
    try {
      const systemInfo = wx.getSystemInfoSync()
      return systemInfo.version || null
    } catch (error) {
      return null
    }
    // #endif

    // #ifdef APP-PLUS
    try {
      const systemInfo = plus.device.getInfo()
      return systemInfo.version || null
    } catch (error) {
      return null
    }
    // #endif

    return null
  }

  /**
   * 判断是否支持特定API
   */
  static supportsApi(apiName: string): boolean {
    if (!this.isWeWork()) {
      return false
    }

    // #ifdef H5
    const wxGlobal = (window as any).wx
    if (!wxGlobal) return false

    const apiPath = apiName.split('.')
    let current = wxGlobal

    for (const path of apiPath) {
      if (typeof current[path] !== 'function') {
        return false
      }
      current = current[path]
    }

    return true
    // #endif

    // #ifdef MP-WEIXIN || APP-PLUS
    try {
      const apiPath = apiName.split('.')
      let current = wx

      for (const path of apiPath) {
        if (typeof current[path] !== 'function') {
          return false
        }
        current = current[path]
      }

      return true
    } catch (error) {
      return false
    }
    // #endif

    return false
  }

  /**
   * 调试信息输出
   */
  static debugInfo(): void {
    const info = this.getPlatformInfo()
    const features = this.checkWeWorkFeatures()
    const version = this.getWeWorkVersion()

    console.group('🔍 企业微信环境检测结果')
    console.log('📱 平台类型:', info.platform)
    console.log('✅ 企业微信环境:', info.isWeWork)
    console.log('🌐 用户代理:', info.userAgent)
    console.log('📋 版本信息:', version)
    console.log('🚀 功能支持:', features)
    console.groupEnd()
  }
}

// 导出类和默认实例
export { WeWorkEnv }
export default WeWorkEnv