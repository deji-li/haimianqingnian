/**
 * 企业微信认证API
 * 处理企业微信OAuth2授权和用户登录
 */

import { WeWorkEnv } from '@/utils/wework-env'
import { WeWorkSDK } from '@/utils/wework-sdk'
import WeWorkConfigManager from '@/utils/wework-config'

export interface WeWorkUserInfo {
  UserId: string
  Name: string
  Avatar: string
  Department: number[]
  Position: string
  Mobile: string
  Gender: string
  Email: string
  Status: number
  IsLeader: number
  DirectLeader: string[]
  IsOwner: number
}

export interface LoginResult {
  success: boolean
  user?: any
  token?: string
  weWorkInfo?: WeWorkUserInfo
  message?: string
}

export interface AuthConfig {
  corpId: string
  agentId: string
  redirectUri: string
  scope?: string
}

export class WeWorkAuthService {
  private static readonly AUTH_STORAGE_KEY = 'wework_auth_info'

  /**
   * 获取企业微信授权URL
   */
  static getAuthUrl(config: AuthConfig): string {
    const { corpId, agentId, redirectUri, scope = 'snsapi_base' } = config

    const params = new URLSearchParams({
      appid: corpId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      agentid: agentId,
      state: this.generateState()
    })

    return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`
  }

  /**
   * 生成随机状态值
   */
  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15)
  }

  /**
   * 企业微信OAuth2授权
   */
  static async authorize(): Promise<void> {
    if (!WeWorkEnv.isWeWork()) {
      throw new Error('当前不在企业微信环境中，无法使用OAuth2授权')
    }

    const config = this.getAuthConfig()
    const authUrl = this.getAuthUrl(config)

    // 保存授权配置到本地存储
    this.saveAuthConfig(config)

    // 跳转到授权页面
    window.location.href = authUrl
  }

  /**
   * 获取授权配置
   */
  private static getAuthConfig(): AuthConfig {
    // 从动态配置管理器获取配置
    const authConfig = WeWorkConfigManager.getAuthConfig()

    return {
      corpId: authConfig.corpId,
      agentId: authConfig.agentId,
      redirectUri: authConfig.callbackUrl,
      scope: 'snsapi_base'
    }
  }

  /**
   * 保存授权配置
   */
  private static saveAuthConfig(config: AuthConfig): void {
    try {
      uni.setStorageSync(this.AUTH_STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('保存授权配置失败:', error)
    }
  }

  /**
   * 获取保存的授权配置
   */
  private static getSavedAuthConfig(): AuthConfig | null {
    try {
      const configStr = uni.getStorageSync(this.AUTH_STORAGE_KEY)
      return configStr ? JSON.parse(configStr) : null
    } catch (error) {
      console.error('获取授权配置失败:', error)
      return null
    }
  }

  /**
   * 处理授权回调
   */
  static async handleAuthCallback(): Promise<{ code: string; state: string }> {
    // 从URL参数中获取授权码和状态
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (!code) {
      throw new Error('授权回调中未找到授权码')
    }

    if (!state) {
      throw new Error('授权回调中未找到状态参数')
    }

    return { code, state }
  }

  /**
   * 通过授权码获取用户信息
   */
  static async getUserInfo(code: string): Promise<WeWorkUserInfo> {
    try {
      const config = this.getSavedAuthConfig()
      if (!config) {
        throw new Error('未找到授权配置信息')
      }

      const response = await uni.request({
        url: '/api/wework/auth/userinfo',
        method: 'POST',
        data: {
          code,
          corpId: config.corpId
        }
      })

      if (response.statusCode !== 200) {
        throw new Error(`获取用户信息失败: ${response.statusCode}`)
      }

      const data = response.data
      if (!data.success) {
        throw new Error(data.message || '获取用户信息失败')
      }

      return data.userInfo
    } catch (error) {
      console.error('获取企业微信用户信息失败:', error)
      throw new Error(`获取用户信息失败: ${error.message}`)
    }
  }

  /**
   * 企业微信登录
   */
  static async login(): Promise<LoginResult> {
    try {
      // 检查是否在企业微信环境
      if (!WeWorkEnv.isWeWork()) {
        return await this.normalLogin()
      }

      // 尝试从URL获取授权码
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')

      if (!code) {
        // 没有授权码，需要重新授权
        await this.authorize()
        return {
          success: false,
          message: '正在跳转到企业微信授权...'
        }
      }

      // 通过授权码获取用户信息
      const weWorkInfo = await this.getUserInfo(code)

      // 使用企业微信用户信息登录系统
      const loginResult = await this.loginWithWeWorkInfo(weWorkInfo)

      // 清理URL参数
      this.cleanAuthCallback()

      return {
        success: true,
        user: loginResult.user,
        token: loginResult.token,
        weWorkInfo,
        message: '企业微信登录成功'
      }
    } catch (error) {
      console.error('企业微信登录失败:', error)
      return {
        success: false,
        message: error.message || '企业微信登录失败'
      }
    }
  }

  /**
   * 使用企业微信用户信息登录系统
   */
  private static async loginWithWeWorkInfo(weWorkInfo: WeWorkUserInfo): Promise<{
    user: any
    token: string
  }> {
    const response = await uni.request({
      url: '/api/auth/wework-login',
      method: 'POST',
      data: {
        userId: weWorkInfo.UserId,
        name: weWorkInfo.Name,
        avatar: weWorkInfo.Avatar,
        departmentIds: weWorkInfo.Department,
        position: weWorkInfo.Position,
        mobile: weWorkInfo.Mobile,
        gender: weWorkInfo.Gender,
        email: weWorkInfo.Email,
        status: weWorkInfo.Status,
        isLeader: weWorkInfo.IsLeader,
        directLeader: weWorkInfo.DirectLeader,
        isOwner: weWorkInfo.IsOwner,
        platform: WeWorkEnv.getPlatform()
      }
    })

    if (response.statusCode !== 200) {
      throw new Error(`登录失败: ${response.statusCode}`)
    }

    const data = response.data
    if (!data.success) {
      throw new Error(data.message || '登录失败')
    }

    return {
      user: data.user,
      token: data.token
    }
  }

  /**
   * 普通登录（非企业微信环境）
   */
  private static async normalLogin(): Promise<LoginResult> {
    try {
      // 这里可以调用原有的登录逻辑
      // 如果没有原有登录，则跳转到登录页面
      uni.navigateTo({
        url: '/pages/login/index'
      })

      return {
        success: false,
        message: '请使用账号密码登录'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败'
      }
    }
  }

  /**
   * 清理授权回调URL
   */
  private static cleanAuthCallback(): void {
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      url.searchParams.delete('state')

      // 使用replaceState避免添加历史记录
      window.history.replaceState({}, '', url.toString())
    } catch (error) {
      console.error('清理授权回调URL失败:', error)
    }
  }

  /**
   * 检查登录状态
   */
  static async checkLoginStatus(): Promise<boolean> {
    try {
      const token = uni.getStorageSync('auth_token')
      if (!token) {
        return false
      }

      const response = await uni.request({
        url: '/api/auth/check',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        }
      })

      return response.statusCode === 200 && response.data.success
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }

  /**
   * 登出
   */
  static async logout(): Promise<void> {
    try {
      const token = uni.getStorageSync('auth_token')
      if (token) {
        await uni.request({
          url: '/api/auth/logout',
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })
      }

      // 清理本地存储
      uni.removeStorageSync('auth_token')
      uni.removeStorageSync('user_info')
      uni.removeStorageSync(this.AUTH_STORAGE_KEY)

      // 在企业微信环境中，可以关闭页面
      if (WeWorkEnv.isWeWork()) {
        const weworkSDK = WeWorkSDK.getInstance()
        if (weworkSDK.isReady()) {
          weworkSDK.closeWindow()
        } else {
          // 重定向到登录页
          uni.reLaunch({
            url: '/pages/login/index'
          })
        }
      } else {
        // 重定向到登录页
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  /**
   * 获取当前用户信息
   */
  static getCurrentUser(): any {
    try {
      return uni.getStorageSync('user_info')
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      return null
    }
  }

  /**
   * 刷新用户信息
   */
  static async refreshUserInfo(): Promise<any> {
    try {
      const token = uni.getStorageSync('auth_token')
      if (!token) {
        throw new Error('未登录')
      }

      const response = await uni.request({
        url: '/api/auth/userinfo',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.statusCode === 200 && response.data.success) {
        const userInfo = response.data.user
        uni.setStorageSync('user_info', userInfo)
        return userInfo
      }

      throw new Error('刷新用户信息失败')
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      throw error
    }
  }
}

export default WeWorkAuthService