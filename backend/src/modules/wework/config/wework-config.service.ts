import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeWorkConfig } from '../entities/wework-config.entity'
import { WeWorkApiService } from '../api/wework-api.service'
import { CreateWeWorkConfigDto, UpdateWeWorkConfigDto } from '../dto/wework-config.dto'

@Injectable()
export class WeWorkConfigService {
  private readonly logger = new Logger(WeWorkConfigService.name)

  constructor(
    @InjectRepository(WeWorkConfig)
    private readonly configRepository: Repository<WeWorkConfig>,
    private readonly apiService: WeWorkApiService,
  ) {}

  /**
   * 获取企业微信配置
   */
  async getConfig(): Promise<WeWorkConfig | null> {
    const config = await this.configRepository.findOne({
      where: { isActive: true },
      order: { createdTime: 'DESC' },
    })

    if (config) {
      // 设置API服务的配置
      this.apiService.setConfig(config)
    }

    return config
  }

  /**
   * 保存企业微信配置
   */
  async saveConfig(configData: CreateWeWorkConfigDto | UpdateWeWorkConfigDto): Promise<WeWorkConfig> {
    try {
      let config: WeWorkConfig

      // 检查是否已存在配置
      const existingConfig = await this.configRepository.findOne({
        where: { isActive: true },
      })

      if (existingConfig) {
        // 更新现有配置
        await this.configRepository.update(existingConfig.id, {
          corpId: configData.corpId,
          appSecret: configData.appSecret,
          token: configData.token,
          aesKey: configData.aesKey,
          webhookUrl: configData.webhookUrl,
          isActive: configData.isActive,
        })
        config = await this.configRepository.findOne({ where: { id: existingConfig.id } })
      } else {
        // 创建新配置
        config = this.configRepository.create({
          corpId: configData.corpId,
          appSecret: configData.appSecret,
          token: configData.token,
          aesKey: configData.aesKey,
          webhookUrl: configData.webhookUrl,
          isActive: configData.isActive,
        })
        config = await this.configRepository.save(config)
      }

      // 设置API服务的配置
      this.apiService.setConfig(config)

      this.logger.log('企业微信配置保存成功')
      return config
    } catch (error) {
      this.logger.error('保存企业微信配置失败:', error)
      throw new Error(`保存企业微信配置失败: ${error.message}`)
    }
  }

  /**
   * 测试企业微信API连接
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const config = await this.getConfig()
      if (!config) {
        return {
          success: false,
          message: '未找到企业微信配置，请先配置',
        }
      }

      // 测试获取access_token
      const validation = await this.apiService.validateApiConnection()

      if (validation.success) {
        // 尝试获取外部联系人列表（限制数量）
        try {
          const contacts = await this.apiService.getExternalContacts()
          return {
            success: true,
            message: '企业微信API连接成功，可以正常获取数据',
            details: {
              contactCount: contacts.length,
              tokenStatus: 'valid',
            },
          }
        } catch (contactError) {
          return {
            success: true,
            message: '企业微信API连接成功，但获取联系人数据失败',
            details: {
              tokenStatus: 'valid',
              contactError: contactError.message,
            },
          }
        }
      }

      return validation
    } catch (error) {
      this.logger.error('测试企业微信连接失败:', error)
      return {
        success: false,
        message: `测试连接失败: ${error.message}`,
      }
    }
  }

  /**
   * 更新API访问令牌
   */
  async updateAccessToken(token: string, expireTime: Date): Promise<void> {
    try {
      const config = await this.getConfig()
      if (!config) {
        throw new Error('未找到企业微信配置')
      }

      await this.configRepository.update(config.id, {
        apiAccessToken: token,
        tokenExpireTime: expireTime,
      })

      this.logger.log('API访问令牌更新成功')
    } catch (error) {
      this.logger.error('更新API访问令牌失败:', error)
      throw new Error(`更新API访问令牌失败: ${error.message}`)
    }
  }

  /**
   * 获取当前访问令牌状态
   */
  async getTokenStatus(): Promise<{ valid: boolean; expiresSoon: boolean; expireTime?: Date }> {
    try {
      const config = await this.getConfig()
      if (!config || !config.tokenExpireTime) {
        return { valid: false, expiresSoon: false }
      }

      const now = new Date()
      const expireTime = new Date(config.tokenExpireTime)
      const expiresSoon = expireTime.getTime() - now.getTime() < 5 * 60 * 1000 // 5分钟内过期

      return {
        valid: expireTime > now,
        expiresSoon,
        expireTime,
      }
    } catch (error) {
      this.logger.error('获取令牌状态失败:', error)
      return { valid: false, expiresSoon: false }
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(id: number): Promise<void> {
    try {
      await this.configRepository.update(id, { isActive: false })
      this.logger.log(`企业微信配置${id}已删除`)
    } catch (error) {
      this.logger.error(`删除企业微信配置${id}失败:`, error)
      throw new Error(`删除配置失败: ${error.message}`)
    }
  }

  /**
   * 激活/停用配置
   */
  async toggleConfig(id: number, isActive: boolean): Promise<void> {
    try {
      await this.configRepository.update(id, { isActive })
      this.logger.log(`企业微信配置${id}状态已更新为: ${isActive ? '激活' : '停用'}`)
    } catch (error) {
      this.logger.error(`更新企业微信配置${id}状态失败:`, error)
      throw new Error(`更新配置状态失败: ${error.message}`)
    }
  }
}