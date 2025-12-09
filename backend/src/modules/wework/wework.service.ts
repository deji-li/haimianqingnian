import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeWorkContact } from './entities/wework-contact.entity'
import { WeWorkSyncLog } from './entities/wework-sync-log.entity'
import { WeWorkApiService } from './api/wework-api.service'

@Injectable()
export class WeWorkService {
  private readonly logger = new Logger(WeWorkService.name)

  constructor(
    @InjectRepository(WeWorkContact)
    private readonly contactRepository: Repository<WeWorkContact>,
    @InjectRepository(WeWorkSyncLog)
    private readonly syncLogRepository: Repository<WeWorkSyncLog>,
    private readonly apiService: WeWorkApiService,
  ) {}

  /**
   * 获取外部联系人列表
   */
  async getContacts(query: any) {
    const { page = 1, pageSize = 20, keyword } = query
    const skip = (page - 1) * pageSize

    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.isDeleted = :isDeleted', { isDeleted: false })

    if (keyword) {
      queryBuilder.andWhere(
        '(contact.name LIKE :keyword OR contact.corpName LIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
    }

    const [contacts, total] = await queryBuilder
      .orderBy('contact.createdTime', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()

    return {
      list: contacts,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    }
  }

  /**
   * 同步联系人到CRM
   */
  async syncContacts(syncData: any) {
    const { syncType = 'full', customerId } = syncData

    // 创建同步日志
    const syncLog = this.syncLogRepository.create({
      syncType: 'contact',
      syncDirection: 'wework_to_crm',
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      syncStatus: 'running',
      startTime: new Date(),
      triggerType: 'manual',
    })

    await this.syncLogRepository.save(syncLog)

    try {
      // 从企业微信获取联系人数据
      const weWorkContacts = await this.apiService.getExternalContacts()

      syncLog.totalCount = weWorkContacts.length
      await this.syncLogRepository.save(syncLog)

      // 处理每个联系人
      for (const contactData of weWorkContacts) {
        try {
          await this.processContactSync(contactData)
          syncLog.successCount++
        } catch (error) {
          syncLog.failedCount++
          console.error(`同步联系人失败:`, error)
        }
      }

      // 更新同步日志
      syncLog.syncStatus = 'completed'
      syncLog.endTime = new Date()
      syncLog.durationSeconds = Math.floor(
        (syncLog.endTime.getTime() - syncLog.startTime.getTime()) / 1000
      )

      await this.syncLogRepository.save(syncLog)

      return {
        success: true,
        message: '同步完成',
        result: {
          totalCount: syncLog.totalCount,
          successCount: syncLog.successCount,
          failedCount: syncLog.failedCount,
        },
      }
    } catch (error) {
      syncLog.syncStatus = 'failed'
      syncLog.errorMessage = error.message
      syncLog.endTime = new Date()
      await this.syncLogRepository.save(syncLog)

      throw error
    }
  }

  /**
   * 处理单个联系人同步
   */
  private async processContactSync(contactData: any): Promise<void> {
    try {
      const existingContact = await this.contactRepository.findOne({
        where: { externalUserId: contactData.external_userid },
      })

      const syncData = {
        name: contactData.name,
        avatar: contactData.avatar,
        gender: contactData.gender,
        position: contactData.position,
        corpName: contactData.corp_name,
        followUserId: contactData.follow_userid,
        remark: contactData.remark,
        addTime: contactData.add_time ? new Date(contactData.add_time * 1000) : null,
        tags: contactData.tags || [],
        syncTime: new Date(),
        syncStatus: 'synced' as const,
      }

      if (existingContact) {
        // 更新现有联系人
        await this.contactRepository.update(existingContact.id, syncData)
        this.logger.log(`更新联系人: ${syncData.name || existingContact.externalUserId}`)
      } else {
        // 创建新联系人
        const newContact = this.contactRepository.create({
          externalUserId: contactData.external_userid,
          ...syncData,
        })
        await this.contactRepository.save(newContact)
        this.logger.log(`创建联系人: ${syncData.name || contactData.external_userid}`)
      }
    } catch (error) {
      this.logger.error(`处理联系人同步失败 ${contactData.external_userid}:`, error)
      throw error
    }
  }

  /**
   * 获取同步状态统计
   */
  async getSyncStatistics(): Promise<{
    total: number
    pending: number
    synced: number
    failed: number
  }> {
    try {
      const [total, pending, synced, failed] = await Promise.all([
        this.contactRepository.count({ where: { isDeleted: false } }),
        this.contactRepository.count({ where: { syncStatus: 'pending', isDeleted: false } }),
        this.contactRepository.count({ where: { syncStatus: 'synced', isDeleted: false } }),
        this.contactRepository.count({ where: { syncStatus: 'failed', isDeleted: false } }),
      ])

      return { total, pending, synced, failed }
    } catch (error) {
      this.logger.error('获取同步统计失败:', error)
      return { total: 0, pending: 0, synced: 0, failed: 0 }
    }
  }

  /**
   * 检查同步状态
   */
  async checkSyncStatus(): Promise<{
    lastSyncTime?: Date
    status: 'idle' | 'running' | 'completed' | 'failed'
    message: string
  }> {
    try {
      // 检查是否有正在运行的同步任务
      const runningSync = await this.syncLogRepository.findOne({
        where: { syncStatus: 'running' },
        order: { startTime: 'DESC' },
      })

      if (runningSync) {
        return {
          status: 'running',
          message: `同步任务正在运行，已处理 ${runningSync.successCount}/${runningSync.totalCount} 条记录`,
          lastSyncTime: runningSync.startTime,
        }
      }

      // 获取最近一次完成的同步日志
      const lastCompletedSync = await this.syncLogRepository.findOne({
        where: { syncStatus: 'completed' },
        order: { endTime: 'DESC' },
      })

      if (lastCompletedSync) {
        const duration = lastCompletedSync.durationSeconds || 0
        return {
          status: 'completed',
          message: `上次同步完成，成功 ${lastCompletedSync.successCount} 条，失败 ${lastCompletedSync.failedCount} 条，耗时 ${duration} 秒`,
          lastSyncTime: lastCompletedSync.endTime,
        }
      }

      // 检查是否有失败的同步
      const lastFailedSync = await this.syncLogRepository.findOne({
        where: { syncStatus: 'failed' },
        order: { endTime: 'DESC' },
      })

      if (lastFailedSync) {
        return {
          status: 'failed',
          message: `上次同步失败：${lastFailedSync.errorMessage}`,
          lastSyncTime: lastFailedSync.endTime,
        }
      }

      return {
        status: 'idle',
        message: '暂无同步记录',
      }
    } catch (error) {
      this.logger.error('检查同步状态失败:', error)
      return {
        status: 'idle',
        message: '检查同步状态失败',
      }
    }
  }

  /**
   * 手动触发单个联系人同步
   */
  async syncSingleContact(externalUserId: string): Promise<boolean> {
    try {
      const contactDetail = await this.apiService.getExternalContactDetail(externalUserId)
      if (!contactDetail) {
        throw new Error(`未找到外部联系人: ${externalUserId}`)
      }

      await this.processContactSync(contactDetail)
      return true
    } catch (error) {
      this.logger.error(`同步单个联系人失败 ${externalUserId}:`, error)
      return false
    }
  }

  /**
   * 批量同步联系人
   */
  async syncMultipleContacts(externalUserIds: string[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const externalUserId of externalUserIds) {
      try {
        const success = await this.syncSingleContact(externalUserId)
        if (success) {
          results.success++
        } else {
          results.failed++
        }
      } catch (error) {
        results.failed++
        results.errors.push(`${externalUserId}: ${error.message}`)
      }
    }

    return results
  }

  /**
   * 获取联系人详情
   */
  async getContactDetail(id: number): Promise<WeWorkContact | null> {
    try {
      return await this.contactRepository.findOne({
        where: { id, isDeleted: false },
      })
    } catch (error) {
      this.logger.error(`获取联系人详情失败 ${id}:`, error)
      return null
    }
  }

  /**
   * 更新联系人信息
   */
  async updateContact(id: number, updateData: Partial<WeWorkContact>): Promise<boolean> {
    try {
      await this.contactRepository.update(id, updateData)
      this.logger.log(`更新联系人信息成功: ${id}`)
      return true
    } catch (error) {
      this.logger.error(`更新联系人信息失败 ${id}:`, error)
      return false
    }
  }

  /**
   * 删除联系人（软删除）
   */
  async deleteContact(id: number): Promise<boolean> {
    try {
      await this.contactRepository.update(id, { isDeleted: true })
      this.logger.log(`删除联系人成功: ${id}`)
      return true
    } catch (error) {
      this.logger.error(`删除联系人失败 ${id}:`, error)
      return false
    }
  }

  /**
   * 批量删除联系人
   */
  async batchDeleteContacts(ids: number[]): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 }

    for (const id of ids) {
      try {
        const success = await this.deleteContact(id)
        if (success) {
          results.success++
        } else {
          results.failed++
        }
      } catch (error) {
        results.failed++
        this.logger.error(`批量删除联系人失败 ${id}:`, error)
      }
    }

    return results
  }

  /**
   * 关联联系人到CRM客户
   */
  async associateWithCustomer(contactId: number, customerId: number): Promise<boolean> {
    try {
      await this.contactRepository.update(contactId, { customerId })
      this.logger.log(`关联联系人到CRM客户成功: contactId=${contactId}, customerId=${customerId}`)
      return true
    } catch (error) {
      this.logger.error(`关联联系人到CRM客户失败: contactId=${contactId}, customerId=${customerId}`, error)
      return false
    }
  }

  /**
   * 取消关联
   */
  async disassociateFromCustomer(contactId: number): Promise<boolean> {
    try {
      await this.contactRepository.update(contactId, { customerId: null })
      this.logger.log(`取消关联CRM客户成功: contactId=${contactId}`)
      return true
    } catch (error) {
      this.logger.error(`取消关联CRM客户失败: contactId=${contactId}`, error)
      return false
    }
  }

  /**
   * 获取同步日志
   */
  async getSyncLogs(query: any) {
    const { page = 1, pageSize = 20, syncType, syncStatus } = query
    const skip = (page - 1) * pageSize

    const queryBuilder = this.syncLogRepository.createQueryBuilder('log')

    if (syncType) {
      queryBuilder.andWhere('log.syncType = :syncType', { syncType })
    }

    if (syncStatus) {
      queryBuilder.andWhere('log.syncStatus = :syncStatus', { syncStatus })
    }

    const [logs, total] = await queryBuilder
      .orderBy('log.createdTime', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()

    return {
      list: logs,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    }
  }
}