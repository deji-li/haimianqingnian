/**
 * 企业微信配置管理
 * 支持动态配置和设置管理
 */

interface WeWorkDynamicConfig {
  corpId: string
  agentId: string
  callbackUrl: string
  features: {
    contactSync: boolean
    chatAnalysis: boolean
    messagePush: boolean
    autoLogin: boolean
  }
  settings: {
    autoRedirect: boolean
    debugMode: boolean
    cacheEnabled: boolean
    syncInterval: number
  }
}

export class WeWorkConfigManager {
  private static readonly STORAGE_KEY = 'wework_config'
  private static readonly API_CONFIG_KEY = 'wework_api_config'
  private static config: WeWorkDynamicConfig | null = null

  /**
   * 获取默认配置
   */
  static getDefaultConfig(): WeWorkDynamicConfig {
    return {
      corpId: process.env.VUE_APP_WEWORK_CORP_ID || '',
      agentId: process.env.VUE_APP_WEWORK_AGENT_ID || '',
      callbackUrl: process.env.VUE_APP_WEWORK_CALLBACK_URL || `${window.location.origin}/mobile/wework/auth-callback`,
      features: {
        contactSync: true,
        chatAnalysis: true,
        messagePush: true,
        autoLogin: true
      },
      settings: {
        autoRedirect: process.env.VUE_APP_WEWORK_AUTO_REDIRECT === 'true',
        debugMode: process.env.VUE_APP_WEWORK_DEBUG === 'true',
        cacheEnabled: true,
        syncInterval: 5 * 60 * 1000 // 5分钟
      }
    }
  }

  /**
   * 从存储加载配置
   */
  static loadConfig(): WeWorkDynamicConfig {
    if (this.config) {
      return this.config
    }

    try {
      // 尝试从本地存储加载
      const storedConfig = uni.getStorageSync(this.STORAGE_KEY)
      if (storedConfig) {
        this.config = { ...this.getDefaultConfig(), ...JSON.parse(storedConfig) }
        return this.config
      }
    } catch (error) {
      console.error('加载企业微信配置失败:', error)
    }

    // 使用默认配置
    this.config = this.getDefaultConfig()
    return this.config
  }

  /**
   * 保存配置到存储
   */
  static saveConfig(config: Partial<WeWorkDynamicConfig>): void {
    try {
      const currentConfig = this.loadConfig()
      const newConfig = { ...currentConfig, ...config }

      this.config = newConfig
      uni.setStorageSync(this.STORAGE_KEY, JSON.stringify(newConfig))

      console.log('企业微信配置已保存')
    } catch (error) {
      console.error('保存企业微信配置失败:', error)
    }
  }

  /**
   * 从服务器获取配置
   */
  static async fetchConfig(): Promise<WeWorkDynamicConfig | null> {
    try {
      const response = await uni.request({
        url: '/api/wework/config',
        method: 'GET'
      })

      if (response.statusCode === 200 && response.data.success) {
        const serverConfig = response.data.config

        // 合并服务器配置和本地配置
        const mergedConfig = {
          ...this.getDefaultConfig(),
          ...serverConfig,
          // 保留本地设置
          settings: {
            ...this.getDefaultConfig().settings,
            ...serverConfig.settings
          }
        }

        this.saveConfig(mergedConfig)
        return mergedConfig
      }
    } catch (error) {
      console.error('获取服务器配置失败:', error)
    }

    return null
  }

  /**
   * 同步配置到服务器
   */
  static async syncConfig(config: Partial<WeWorkDynamicConfig>): Promise<boolean> {
    try {
      const response = await uni.request({
        url: '/api/wework/config',
        method: 'POST',
        data: config
      })

      if (response.statusCode === 200 && response.data.success) {
        // 保存本地配置
        this.saveConfig(config)
        return true
      }
    } catch (error) {
      console.error('同步配置失败:', error)
    }

    return false
  }

  /**
   * 获取企业微信认证配置
   */
  static getAuthConfig(): { corpId: string; agentId: string; callbackUrl: string } {
    const config = this.loadConfig()

    if (!config.corpId || !config.agentId) {
      throw new Error('企业微信配置不完整，请在设置中配置企业ID和应用ID')
    }

    return {
      corpId: config.corpId,
      agentId: config.agentId,
      callbackUrl: config.callbackUrl
    }
  }

  /**
   * 检查功能是否启用
   */
  static isFeatureEnabled(feature: keyof WeWorkDynamicConfig['features']): boolean {
    const config = this.loadConfig()
    return config.features[feature] || false
  }

  /**
   * 获取设置值
   */
  static getSetting<K extends keyof WeWorkDynamicConfig['settings']>(
    key: K
  ): WeWorkDynamicConfig['settings'][K] {
    const config = this.loadConfig()
    return config.settings[key]
  }

  /**
   * 更新设置
   */
  static updateSettings(settings: Partial<WeWorkDynamicConfig['settings']>): void {
    const config = this.loadConfig()
    const newSettings = { ...config.settings, ...settings }

    this.saveConfig({
      settings: newSettings
    })
  }

  /**
   * 检查配置完整性
   */
  static validateConfig(): { isValid: boolean; errors: string[] } {
    const config = this.loadConfig()
    const errors: string[] = []

    if (!config.corpId) {
      errors.push('企业ID未配置')
    }

    if (!config.agentId) {
      errors.push('应用ID未配置')
    }

    if (!config.callbackUrl) {
      errors.push('回调URL未配置')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 重置配置
   */
  static resetConfig(): void {
    try {
      uni.removeStorageSync(this.STORAGE_KEY)
      uni.removeStorageSync(this.API_CONFIG_KEY)
      this.config = null
      console.log('企业微信配置已重置')
    } catch (error) {
      console.error('重置配置失败:', error)
    }
  }

  /**
   * 获取配置状态信息
   */
  static getConfigStatus(): {
    hasLocalConfig: boolean
    hasServerConfig: boolean
    lastSyncTime: string | null
    isValid: boolean
  } {
    try {
      const hasLocalConfig = !!uni.getStorageSync(this.STORAGE_KEY)
      const hasServerConfig = !!uni.getStorageSync(this.API_CONFIG_KEY)
      const lastSyncTime = uni.getStorageSync('wework_last_sync_time') || null
      const validation = this.validateConfig()

      return {
        hasLocalConfig,
        hasServerConfig,
        lastSyncTime,
        isValid: validation.isValid
      }
    } catch (error) {
      return {
        hasLocalConfig: false,
        hasServerConfig: false,
        lastSyncTime: null,
        isValid: false
      }
    }
  }

  /**
   * 设置最后同步时间
   */
  static setLastSyncTime(): void {
    try {
      uni.setStorageSync('wework_last_sync_time', new Date().toISOString())
    } catch (error) {
      console.error('设置同步时间失败:', error)
    }
  }
}

export default WeWorkConfigManager