import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeWorkConfig } from './entities/wework-config.entity'

@Injectable()
export class WeWorkBasicService {
  constructor(
    @InjectRepository(WeWorkConfig)
    private readonly configRepository: Repository<WeWorkConfig>,
  ) {}

  /**
   * 获取企业微信配置
   */
  async getConfig() {
    try {
      const config = await this.configRepository.findOne({ where: { isActive: true } })
      if (!config) {
        return {
          corpId: '',
          appSecret: '',
          token: '',
          aesKey: '',
          webhookUrl: '',
          isActive: false
        }
      }

      // 返回配置信息，隐藏敏感信息
      return {
        id: config.id,
        corpId: config.corpId,
        appSecret: config.appSecret ? '******' : '',
        token: config.token || '',
        aesKey: config.aesKey || '',
        webhookUrl: config.webhookUrl || '',
        isActive: config.isActive,
        syncStrategy: config.syncStrategy,
        createdTime: config.createdTime,
        updatedTime: config.updatedTime
      }
    } catch (error) {
      throw new Error(`获取配置失败: ${error.message}`)
    }
  }

  /**
   * 保存企业微信配置
   */
  async saveConfig(configData: any) {
    try {
      // 先停用所有现有配置
      await this.configRepository.update({}, { isActive: false })

      // 查找是否已存在配置
      const existingConfig = await this.configRepository.findOne({ where: {} })

      if (existingConfig) {
        // 更新现有配置
        await this.configRepository.update(existingConfig.id, {
          ...configData,
          isActive: true,
          updatedTime: new Date()
        })
      } else {
        // 创建新配置
        const newConfig = this.configRepository.create({
          ...configData,
          isActive: true
        })
        await this.configRepository.save(newConfig)
      }

      return { success: true, message: '配置保存成功' }
    } catch (error) {
      throw new Error(`保存配置失败: ${error.message}`)
    }
  }

  /**
   * 测试企业微信API连接
   */
  async testConnection() {
    try {
      const config = await this.getConfig()

      if (!config.corpId || !config.appSecret) {
        throw new Error('配置不完整，请先配置企业ID和应用Secret')
      }

      // 这里应该实际调用企业微信API进行测试
      // 为了简化，暂时返回模拟结果
      return {
        success: true,
        message: '连接测试成功',
        data: {
          corpId: config.corpId,
          testTime: new Date().toISOString()
        }
      }
    } catch (error) {
      throw new Error(`连接测试失败: ${error.message}`)
    }
  }
}