import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cron } from '@nestjs/schedule'
import { WeWorkApiService, WeWorkContact } from '../api/wework-api.service'
import { WeWorkConfig } from '../entities/wework-config.entity'
import { WeWorkContact as WeWorkContactEntity } from '../entities/wework-contact.entity'
import { WeWorkSyncLog } from '../entities/wework-sync-log.entity'
import { Customer } from '../../customer/entities/customer.entity'
import { CustomerService } from '../../customer/customer.service'

export interface SyncContactsParams {
  corpId?: string
  departmentId?: number
  userId?: string
  force?: boolean
}

export interface SyncChatParams {
  externalUserId?: string
  customerId?: number
  startDate?: Date
  endDate?: Date
  messageCount?: number
}

export interface SyncResult {
  success: boolean
  message: string
  total: number
  synced: number
  failed: number
  errors?: string[]
}

@Injectable()
export class WeWorkSyncService {
  private readonly logger = new Logger(WeWorkSyncService.name)

  constructor(
    private readonly weWorkApiService: WeWorkApiService,
    private readonly customerService: CustomerService,
    @InjectRepository(WeWorkConfig)
    private readonly weWorkConfigRepository: Repository<WeWorkConfig>,
    @InjectRepository(WeWorkContactEntity)
    private readonly weWorkContactRepository: Repository<WeWorkContactEntity>,
    @InjectRepository(WeWorkSyncLog)
    private readonly weWorkSyncLogRepository: Repository<WeWorkSyncLog>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * 同步外部联系人到CRM客户
   */
  async syncContactsToCRM(params: SyncContactsParams = {}): Promise<SyncResult> {
    const startTime = new Date()
    const result: SyncResult = {
      success: false,
      message: '',
      total: 0,
      synced: 0,
      failed: 0,
      errors: []
    }

    try {
      // 获取企业微信配置
      const config = await this.getActiveConfig()
      if (!config) {
        throw new Error('企业微信配置不存在或未启用')
      }

      this.weWorkApiService.setConfig(config)

      // 获取外部联系人列表
      const externalContacts = await this.weWorkApiService.getExternalContacts({
        userId: params.userId
      })

      result.total = externalContacts.length

      this.logger.log(`开始同步 ${externalContacts.length} 个外部联系人`)

      // 批量处理联系人
      for (const contact of externalContacts) {
        try {
          await this.syncSingleContact(contact, config)
          result.synced++
        } catch (error) {
          result.failed++
          result.errors!.push(`联系人 ${contact.external_userid} 同步失败: ${error.message}`)
          this.logger.error(`联系人同步失败:`, error)
        }
      }

      result.success = result.failed === 0
      result.message = `同步完成: 成功 ${result.synced}, 失败 ${result.failed}`

    } catch (error) {
      result.success = false
      result.message = error.message
      result.errors!.push(error.message)
      this.logger.error('联系人同步失败:', error)
    }

    // 记录同步日志
    await this.logSyncOperation('contact_sync', result, startTime)

    return result
  }

  /**
   * 同步单个联系人
   */
  private async syncSingleContact(weWorkContact: WeWorkContact, config: WeWorkConfig): Promise<void> {
    // 查找是否已存在该联系人
    let existingContact = await this.weWorkContactRepository.findOne({
      where: { externalUserId: weWorkContact.external_userid }
    })

    // 查找关联的CRM客户
    let customer = await this.findCustomerByWeWorkId(weWorkContact.external_userid)

    // 如果CRM客户不存在，尝试创建或匹配
    if (!customer && weWorkContact.name) {
      customer = await this.findOrCreateCustomer(weWorkContact)
    }

    if (existingContact) {
      // 更新现有联系人
      await this.updateWeWorkContact(existingContact, weWorkContact, customer?.id)
    } else {
      // 创建新联系人记录
      await this.createWeWorkContact(weWorkContact, customer?.id)
    }

    // 如果有CRM客户，更新企业微信字段
    if (customer) {
      await this.updateCustomerWeWorkFields(customer.id, weWorkContact)
    }
  }

  /**
   * 查找或创建CRM客户
   */
  private async findOrCreateCustomer(weWorkContact: WeWorkContact): Promise<Customer> {
    // 先尝试通过手机号匹配
    if (weWorkContact.mobile) {
      const customerByMobile = await this.customerRepository.findOne({
        where: { phone: weWorkContact.mobile }
      })
      if (customerByMobile) {
        return customerByMobile
      }
    }

    // 尝试通过姓名匹配
    if (weWorkContact.name) {
      const customerByName = await this.customerRepository.findOne({
        where: { realName: weWorkContact.name }
      })
      if (customerByName) {
        return customerByName
      }
    }

    // 创建新客户
    const newCustomer = this.customerRepository.create({
      realName: weWorkContact.name || `企微客户_${weWorkContact.external_userid}`,
      phone: weWorkContact.mobile,
      remark: weWorkContact.remark,
      source: 'wework',
      weworkExternalUserId: weWorkContact.external_userid,
      weworkFollowUserid: weWorkContact.follow_userid,
      weworkTags: weWorkContact.tags || [],
      weworkSyncTime: new Date(),
    })

    return await this.customerRepository.save(newCustomer)
  }

  /**
   * 更新客户企业微信字段
   */
  private async updateCustomerWeWorkFields(customerId: number, weWorkContact: WeWorkContact): Promise<void> {
    await this.customerRepository.update(customerId, {
      weworkExternalUserId: weWorkContact.external_userid,
      weworkFollowUserid: weWorkContact.follow_userid,
      weworkTags: weWorkContact.tags || [],
      weworkSyncTime: new Date(),
    })
  }

  /**
   * 创建企业微信联系人记录
   */
  private async createWeWorkContact(weWorkContact: WeWorkContact, customerId?: number): Promise<void> {
    const contactEntity = this.weWorkContactRepository.create({
      externalUserId: weWorkContact.external_userid,
      name: weWorkContact.name,
      avatar: weWorkContact.avatar,
      type: weWorkContact.type,
      gender: weWorkContact.gender,
      position: weWorkContact.position,
      corpName: weWorkContact.corp_name,
      followUserId: weWorkContact.follow_userid,
      remark: weWorkContact.remark,
      addTime: weWorkContact.add_time ? new Date(weWorkContact.add_time * 1000) : undefined,
      tags: weWorkContact.tags || [],
      customerId: customerId,
      syncTime: new Date(),
      syncStatus: 'synced'
    })

    await this.weWorkContactRepository.save(contactEntity)
  }

  /**
   * 更新企业微信联系人记录
   */
  private async updateWeWorkContact(
    existingContact: WeWorkContactEntity,
    weWorkContact: WeWorkContact,
    customerId?: number
  ): Promise<void> {
    await this.weWorkContactRepository.update(existingContact.id, {
      name: weWorkContact.name,
      avatar: weWorkContact.avatar,
      gender: weWorkContact.gender,
      position: weWorkContact.position,
      corpName: weWorkContact.corp_name,
      remark: weWorkContact.remark,
      tags: weWorkContact.tags || [],
      customerId: customerId,
      syncTime: new Date(),
      syncStatus: 'synced'
    })
  }

  /**
   * 根据企业微信ID查找CRM客户
   */
  private async findCustomerByWeWorkId(externalUserId: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { weworkExternalUserId: externalUserId }
    })
  }

  /**
   * 增量同步
   */
  async incrementalSync(): Promise<SyncResult> {
    const lastSyncTime = await this.getLastSyncTime('contact_sync')
    const params: SyncContactsParams = {
      force: false
    }

    // 如果有上次同步时间，可以优化同步策略
    if (lastSyncTime) {
      this.logger.log(`执行增量同步，上次同步时间: ${lastSyncTime}`)
    }

    return await this.syncContactsToCRM(params)
  }

  /**
   * 获取活跃配置
   */
  private async getActiveConfig(): Promise<WeWorkConfig | null> {
    return await this.weWorkConfigRepository.findOne({
      where: { isActive: true }
    })
  }

  /**
   * 获取上次同步时间
   */
  private async getLastSyncTime(syncType: string): Promise<Date | null> {
    const lastLog = await this.weWorkSyncLogRepository.findOne({
      where: { syncType },
      order: { syncTime: 'DESC' }
    })
    return lastLog?.syncTime || null
  }

  /**
   * 记录同步操作日志
   */
  private async logSyncOperation(
    syncType: string,
    result: SyncResult,
    startTime: Date
  ): Promise<void> {
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    const logEntity = this.weWorkSyncLogRepository.create({
      syncType,
      syncTime: startTime,
      endTime,
      duration,
      totalCount: result.total,
      successCount: result.synced,
      failureCount: result.failed,
      status: result.success ? 'success' : 'failed',
      errorMessage: result.errors?.join('; ') || (result.success ? '' : result.message),
      details: {
        message: result.message,
        errors: result.errors
      }
    })

    await this.weWorkSyncLogRepository.save(logEntity)
  }

  /**
   * 定时同步任务 - 每小时执行一次
   */
  @Cron('0 0 * * * *') // 每小时的0分0秒执行
  async scheduledSync(): Promise<void> {
    try {
      this.logger.log('开始定时同步任务')
      const result = await this.incrementalSync()

      if (result.success) {
        this.logger.log(`定时同步完成: ${result.message}`)
      } else {
        this.logger.error(`定时同步失败: ${result.message}`)
      }
    } catch (error) {
      this.logger.error('定时同步任务执行失败:', error)
    }
  }

  /**
   * 手动触发同步
   */
  async manualSync(params: SyncContactsParams = {}): Promise<SyncResult> {
    return await this.syncContactsToCRM({ ...params, force: true })
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<any> {
    const lastLog = await this.weWorkSyncLogRepository.findOne({
      where: { syncType: 'contact_sync' },
      order: { syncTime: 'DESC' }
    })

    const totalContacts = await this.weWorkContactRepository.count()
    const syncedContacts = await this.weWorkContactRepository.count({
      where: { syncStatus: 'synced' }
    })

    return {
      lastSyncTime: lastLog?.syncTime,
      lastSyncResult: lastLog ? {
        success: lastLog.status === 'success',
        message: lastLog.errorMessage || '同步成功',
        total: lastLog.totalCount,
        synced: lastLog.successCount,
        failed: lastLog.failureCount
      } : null,
      totalContacts,
      syncedContacts,
      failedContacts: totalContacts - syncedContacts
    }
  }
}