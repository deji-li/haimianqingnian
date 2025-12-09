/**
 * 企业微信JS-SDK封装工具
 * 提供企业微信API调用的统一接口
 */

import WeWorkEnv from './wework-env'

export interface WeWorkConfig {
  corpId: string
  agentId: string
  timestamp: number
  nonceStr: string
  signature: string
  jsApiList?: string[]
}

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

export interface SelectContactResult {
  err_msg: string
  selectedUserId?: string
  selectedUserIds?: string[]
}

export interface ShareOptions {
  title: string
  desc: string
  link: string
  imgUrl: string
}

export class WeWorkSDK {
  private static instance: WeWorkSDK
  private config: WeWorkConfig | null = null
  private isReady: boolean = false
  private readyPromise: Promise<void> | null = null
  private debugMode: boolean = false

  private constructor() {
    this.debugMode = process.env.NODE_ENV === 'development'
  }

  /**
   * 获取SDK单例实例
   */
  static getInstance(): WeWorkSDK {
    if (!WeWorkSDK.instance) {
      WeWorkSDK.instance = new WeWorkSDK()
    }
    return WeWorkSDK.instance
  }

  /**
   * 初始化企业微信SDK
   */
  async initialize(config: WeWorkConfig): Promise<void> {
    if (!WeWorkEnv.isWeWork()) {
      const error = new Error('当前不在企业微信环境中')
      this.log('error', '初始化失败:', error.message)
      throw error
    }

    if (this.isReady && this.config?.corpId === config.corpId) {
      this.log('info', '企业微信SDK已初始化，跳过重复初始化')
      return
    }

    this.config = config

    // 避免重复初始化
    if (this.readyPromise) {
      return this.readyPromise
    }

    this.readyPromise = new Promise((resolve, reject) => {
      try {
        const wxGlobal = this.getWxGlobal()

        if (!wxGlobal) {
          const error = new Error('企业微信SDK不可用')
          reject(error)
          return
        }

        wxGlobal.config({
          beta: true, // 必须为true
          debug: this.debugMode,
          appId: config.corpId,
          timestamp: config.timestamp,
          nonceStr: config.nonceStr,
          signature: config.signature,
          jsApiList: config.jsApiList || this.getDefaultJsApiList()
        })

        wxGlobal.ready(() => {
          this.isReady = true
          this.log('info', '企业微信SDK初始化成功')
          this.log('debug', 'SDK配置:', config)
          resolve()
        })

        wxGlobal.error((error: any) => {
          this.log('error', '企业微信SDK初始化失败:', error)
          this.isReady = false
          this.readyPromise = null
          reject(new Error(`企业微信SDK初始化失败: ${error.errMsg || '未知错误'}`))
        })

      } catch (error) {
        this.log('error', 'SDK初始化异常:', error)
        this.readyPromise = null
        reject(error)
      }
    })

    return this.readyPromise
  }

  /**
   * 获取企业微信全局对象
   */
  private getWxGlobal(): any {
    // #ifdef H5
    if (typeof window !== 'undefined' && (window as any).wx) {
      return (window as any).wx
    }
    // #endif

    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined') {
      return wx
    }
    // #endif

    // #ifdef APP-PLUS
    if (typeof wx !== 'undefined') {
      return wx
    }
    // #endif

    return null
  }

  /**
   * 获取默认的JS-SDK API列表
   */
  private getDefaultJsApiList(): string[] {
    return [
      // 基础功能
      'hideOptionMenu',
      'showOptionMenu',
      'closeWindow',
      'onHistoryBack',
      'hideAllNonBaseMenuItem',
      'showAllNonBaseMenuItem',

      // 联系人相关
      'selectExternalContact',
      'selectEnterpriseContact',
      'openUserProfile',
      'openEnterpriseChat',

      // 分享功能
      'onMenuShareAppMessage',
      'onMenuShareTimeline',
      'onMenuShareQQ',
      'onMenuShareQZone',

      // 文件操作
      'previewFile',
      'getNetworkType',
      'chooseImage',
      'uploadImage',
      'downloadImage',
      'startRecord',
      'stopRecord',
      'playVoice',
      'pauseVoice',
      'stopVoice',
      'onVoicePlayEnd',
      'chooseVideo',
      'uploadVideo',
      'downloadVideo',

      // 地理位置
      'getLocation',
      'openLocation',

      // 扫码
      'scanQRCode',

      // 设备信息
      'getSystemInfo',
      'getAppInfo'
    ]
  }

  /**
   * 检查SDK是否已准备就绪
   */
  isReady(): boolean {
    return this.isReady
  }

  /**
   * 检查是否在企业微信环境
   */
  isInWeWork(): boolean {
    return WeWorkEnv.isWeWork()
  }

  /**
   * 选择外部联系人
   */
  async selectExternalContact(options: {
    type?: 'single' | 'multi'
    filter?: any
  } = {}): Promise<string> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.invoke('selectExternalContact', {
        type: options.type || 'single',
        filter: options.filter || {
          type: 1 // 1-企业微信用户 2-外部联系人
        }
      }, (res: SelectContactResult) => {
        this.log('debug', '选择外部联系人结果:', res)

        if (res.err_msg === 'selectExternalContact:ok') {
          resolve(res.selectedUserId || '')
        } else {
          reject(new Error(`选择联系人失败: ${res.err_msg}`))
        }
      })
    })
  }

  /**
   * 选择企业联系人
   */
  async selectEnterpriseContact(options: {
    type?: 'single' | 'multi'
    departmentId?: number
    filter?: any
  } = {}): Promise<string[]> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.invoke('selectEnterpriseContact', {
        type: options.type || 'single',
        departmentId: options.departmentId,
        filter: options.filter || {}
      }, (res: any) => {
        this.log('debug', '选择企业联系人结果:', res)

        if (res.err_msg === 'selectEnterpriseContact:ok') {
          resolve(res.selectedUserIds || [])
        } else {
          reject(new Error(`选择企业联系人失败: ${res.err_msg}`))
        }
      })
    })
  }

  /**
   * 打开企业微信聊天
   */
  async openEnterpriseChat(params: {
    userIds?: string[]
    groupName?: string
    externalUserIds?: string[]
  }): Promise<void> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.invoke('openEnterpriseChat', {
        userIds: params.userIds?.join(';') || '',
        groupName: params.groupName || '',
        externalUserIds: params.externalUserIds?.join(';') || ''
      }, (res: any) => {
        this.log('debug', '打开企业微信聊天结果:', res)

        if (res.err_msg === 'openEnterpriseChat:ok') {
          resolve()
        } else {
          reject(new Error(`打开聊天失败: ${res.err_msg}`))
        }
      })
    })
  }

  /**
   * 打开用户资料页
   */
  async openUserProfile(userId: string): Promise<void> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.invoke('openUserProfile', {
        type: 'enterprise',
        userid: userId
      }, (res: any) => {
        this.log('debug', '打开用户资料页结果:', res)

        if (res.err_msg === 'openUserProfile:ok') {
          resolve()
        } else {
          reject(new Error(`打开用户资料页失败: ${res.err_msg}`))
        }
      })
    })
  }

  /**
   * 预览文件
   */
  async previewFile(url: string, name: string, size: number): Promise<void> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.previewFile({
        url: url,
        name: name,
        size: size
      }, (res: any) => {
        this.log('debug', '预览文件结果:', res)

        if (res.err_msg === 'previewFile:ok') {
          resolve()
        } else {
          reject(new Error(`预览文件失败: ${res.err_msg}`))
        }
      })
    })
  }

  /**
   * 设置分享到聊天
   */
  async shareToChat(options: ShareOptions): Promise<void> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.onMenuShareAppMessage({
        title: options.title,
        desc: options.desc,
        link: options.link,
        imgUrl: options.imgUrl,
        success: () => {
          this.log('info', '分享到聊天成功')
          resolve()
        },
        fail: (error: any) => {
          this.log('error', '分享到聊天失败:', error)
          reject(new Error(`分享到聊天失败: ${error.errMsg || '未知错误'}`))
        }
      })
    })
  }

  /**
   * 获取网络类型
   */
  async getNetworkType(): Promise<string> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.getNetworkType({
        success: (res: any) => {
          resolve(res.networkType)
        },
        fail: (error: any) => {
          reject(new Error(`获取网络类型失败: ${error.errMsg || '未知错误'}`))
        }
      })
    })
  }

  /**
   * 获取系统信息
   */
  async getSystemInfo(): Promise<any> {
    this.ensureReady()

    return new Promise((resolve, reject) => {
      const wxGlobal = this.getWxGlobal()

      wxGlobal!.getSystemInfo({
        success: (res: any) => {
          resolve(res)
        },
        fail: (error: any) => {
          reject(new Error(`获取系统信息失败: ${error.errMsg || '未知错误'}`))
        }
      })
    })
  }

  /**
   * 隐藏右上角菜单
   */
  hideOptionMenu(): void {
    this.ensureReady()
    const wxGlobal = this.getWxGlobal()
    wxGlobal!.hideOptionMenu()
  }

  /**
   * 显示右上角菜单
   */
  showOptionMenu(): void {
    this.ensureReady()
    const wxGlobal = this.getWxGlobal()
    wxGlobal!.showOptionMenu()
  }

  /**
   * 关闭当前页面
   */
  closeWindow(): void {
    this.ensureReady()
    const wxGlobal = this.getWxGlobal()
    wxGlobal!.closeWindow()
  }

  /**
   * 确保SDK已准备就绪
   */
  private ensureReady(): void {
    if (!this.isReady) {
      const error = new Error('企业微信SDK未初始化或初始化失败')
      this.log('error', 'SDK未准备就绪:', error.message)
      throw error
    }
  }

  /**
   * 日志输出
   */
  private log(level: 'info' | 'debug' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.debugMode && level === 'debug') {
      return
    }

    const timestamp = new Date().toISOString()
    const prefix = `[WeWorkSDK][${level.toUpperCase()}][${timestamp}]`

    if (data) {
      console.log(`${prefix} ${message}`, data)
    } else {
      console.log(`${prefix} ${message}`)
    }
  }

  /**
   * 设置调试模式
   */
  setDebugMode(debug: boolean): void {
    this.debugMode = debug
    this.log('info', `调试模式${debug ? '开启' : '关闭'}`)
  }

  /**
   * 获取当前配置
   */
  getConfig(): WeWorkConfig | null {
    return this.config
  }

  /**
   * 重置SDK状态
   */
  reset(): void {
    this.isReady = false
    this.config = null
    this.readyPromise = null
    this.log('info', '企业微信SDK状态已重置')
  }
}

// 导出类和默认实例
export { WeWorkSDK }
export default WeWorkSDK