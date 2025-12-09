import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { WeWorkService } from './wework.service'
import { WeWorkConfigService } from './config/wework-config.service'
import { WeWorkWebhookService } from './api/webhook.service'
import { WeWorkMessageProcessor } from './chat/message-processor.service'
import { WeWorkAITriggerEngine } from './ai/trigger-engine.service'
import { WeWorkSyncService } from './sync/wework-sync.service'
import { WeWorkSchedulerService } from './sync/scheduler.service'

@ApiTags('企业微信管理')
@ApiBearerAuth()
@Controller('wework')
export class WeWorkController {
  constructor(
    private readonly weworkService: WeWorkService,
    private readonly configService: WeWorkConfigService,
    private readonly webhookService: WeWorkWebhookService,
    private readonly messageProcessor: WeWorkMessageProcessor,
    private readonly triggerEngine: WeWorkAITriggerEngine,
    private readonly syncService: WeWorkSyncService,
    private readonly schedulerService: WeWorkSchedulerService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: '获取企业微信配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getConfig() {
    return this.configService.getConfig()
  }

  @Post('config')
  @ApiOperation({ summary: '保存企业微信配置' })
  @ApiResponse({ status: 200, description: '保存成功' })
  async saveConfig(@Body() configData: any) {
    return this.configService.saveConfig(configData)
  }

  @Post('test-connection')
  @ApiOperation({ summary: '测试企业微信API连接' })
  @ApiResponse({ status: 200, description: '测试成功' })
  async testConnection() {
    return this.configService.testConnection()
  }

  @Get('contacts')
  @ApiOperation({ summary: '获取外部联系人列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getContacts(@Query() query: any) {
    return this.weworkService.getContacts(query)
  }

  @Get('contacts/statistics')
  @ApiOperation({ summary: '获取同步统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSyncStatistics() {
    return this.weworkService.getSyncStatistics()
  }

  @Post('sync/contacts')
  @ApiOperation({ summary: '同步联系人到CRM' })
  @ApiResponse({ status: 200, description: '同步成功' })
  async syncContacts(@Body() syncData: any) {
    return this.weworkService.syncContacts(syncData)
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: '获取联系人详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getContactDetail(@Param('id') id: number) {
    return this.weworkService.getContactDetail(id)
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: '更新联系人信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateContact(
    @Param('id') id: number,
    @Body() updateData: any,
  ) {
    return this.weworkService.updateContact(id, updateData)
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: '删除联系人' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteContact(@Param('id') id: number) {
    return this.weworkService.deleteContact(id)
  }

  @Post('contacts/sync-batch')
  @ApiOperation({ summary: '批量同步联系人' })
  @ApiResponse({ status: 200, description: '批量同步成功' })
  async batchSyncContacts(@Body() data: { externalUserIds: string[] }) {
    return this.weworkService.syncMultipleContacts(data.externalUserIds)
  }

  @Delete('contacts/batch')
  @ApiOperation({ summary: '批量删除联系人' })
  @ApiResponse({ status: 200, description: '批量删除成功' })
  async batchDeleteContacts(@Body() data: { ids: number[] }) {
    return this.weworkService.batchDeleteContacts(data.ids)
  }

  @Post('contacts/:id/associate-customer')
  @ApiOperation({ summary: '关联联系人到CRM客户' })
  @ApiResponse({ status: 200, description: '关联成功' })
  async associateWithCustomer(
    @Param('id') id: number,
    @Body() data: { customerId: number },
  ) {
    return this.weworkService.associateWithCustomer(id, data.customerId)
  }

  @Delete('contacts/:id/disassociate-customer')
  @ApiOperation({ summary: '取消关联CRM客户' })
  @ApiResponse({ status: 200, description: '取消关联成功' })
  async disassociateFromCustomer(@Param('id') id: number) {
    return this.weworkService.disassociateFromCustomer(id)
  }

  @Get('sync/status')
  @ApiOperation({ summary: '获取同步状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSyncStatus() {
    return this.weworkService.checkSyncStatus()
  }

  @Get('sync/logs')
  @ApiOperation({ summary: '获取同步日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSyncLogs(@Query() query: any) {
    return this.weworkService.getSyncLogs(query)
  }

  @Post('sync/single-contact')
  @ApiOperation({ summary: '同步单个联系人' })
  @ApiResponse({ status: 200, description: '同步成功' })
  async syncSingleContact(@Body() data: { externalUserId: string }) {
    const success = await this.weworkService.syncSingleContact(data.externalUserId)
    return { success }
  }

  // ========== Phase 3: 会话内容存档集成 ==========

  @Post('webhook/:corpId')
  @ApiOperation({ summary: '处理企业微信Webhook事件' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async handleWebhook(
    @Param('corpId') corpId: string,
    @Body() event: any,
  ) {
    return this.webhookService.handleWebhookEvent(event, corpId)
  }

  @Post('webhook/:corpId/heartbeat')
  @ApiOperation({ summary: '处理心跳检测' })
  @ApiResponse({ status: 200, description: '心跳正常' })
  async handleHeartbeat(@Param('corpId') corpId: string) {
    return this.webhookService.handleHeartbeat(corpId)
  }

  @Get('webhook/:corpId/status')
  @ApiOperation({ summary: '获取Webhook状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWebhookStatus(@Param('corpId') corpId: string) {
    return this.webhookService.getWebhookStatus(corpId)
  }

  @Get('chat-records')
  @ApiOperation({ summary: '获取聊天记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getChatRecords(@Query() query: {
    page?: number
    pageSize?: number
    externalUserId?: string
    msgtype?: string
    startDate?: string
    endDate?: string
  }) {
    // 这里需要实现获取聊天记录的服务方法
    return { message: '聊天记录查询功能待实现', query }
  }

  @Get('chat-records/:id')
  @ApiOperation({ summary: '获取聊天记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getChatRecordDetail(@Param('id') id: string) {
    return { message: '聊天记录详情功能待实现', id }
  }

  @Post('chat-records/process')
  @ApiOperation({ summary: '批量处理聊天记录' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async batchProcessChatRecords(@Body() data: {
    messageIds: string[]
    options?: any
  }) {
    return { message: '批量处理功能待实现', data }
  }

  @Post('ai/trigger/:messageId')
  @ApiOperation({ summary: '手动触发AI分析' })
  @ApiResponse({ status: 200, description: '分析成功' })
  async triggerAIAnalysis(@Param('messageId') messageId: string) {
    return { message: 'AI分析触发功能待实现', messageId }
  }

  @Get('ai/trigger-rules')
  @ApiOperation({ summary: '获取AI触发规则列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTriggerRules(@Query() query: any) {
    return { message: '触发规则查询功能待实现', query }
  }

  @Post('ai/trigger-rules')
  @ApiOperation({ summary: '创建AI触发规则' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createTriggerRule(@Body() ruleData: any) {
    return { message: '触发规则创建功能待实现', ruleData }
  }

  @Put('ai/trigger-rules/:id')
  @ApiOperation({ summary: '更新AI触发规则' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateTriggerRule(@Param('id') id: number, @Body() ruleData: any) {
    return { message: '触发规则更新功能待实现', id, ruleData }
  }

  // ========== 同步管理API ==========
  @Get('sync/status')
  @ApiOperation({ summary: '获取同步状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSyncStatus() {
    return this.syncService.getSyncStatus()
  }

  @Post('sync/trigger')
  @ApiOperation({ summary: '手动触发同步' })
  @ApiResponse({ status: 200, description: '同步触发成功' })
  async triggerSync(@Body() syncData: {
    type?: 'contact' | 'chat' | 'all'
    incremental?: boolean
    force?: boolean
  }) {
    return this.syncService.manualSync(syncData)
  }

  @Get('sync/logs')
  @ApiOperation({ summary: '获取同步日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSyncLogs(@Query() query: {
    page?: number
    limit?: number
    type?: string
    startDate?: string
    endDate?: string
  }) {
    return this.syncService.getSyncLogs(query)
  }

  @Get('sync/scheduler/status')
  @ApiOperation({ summary: '获取调度器状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSchedulerStatus() {
    return this.schedulerService.getSchedulerStatus()
  }

  @Post('sync/scheduler/trigger')
  @ApiOperation({ summary: '手动触发调度任务' })
  @ApiResponse({ status: 200, description: '触发成功' })
  async triggerSchedulerTask(@Body() data: {
    syncType?: 'high_frequency' | 'standard' | 'deep'
  }) {
    return this.schedulerService.triggerManualSync(data.syncType)
  }
  // ========== 同步管理API结束 ==========

  @Delete('ai/trigger-rules/:id')
  @ApiOperation({ summary: '删除AI触发规则' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteTriggerRule(@Param('id') id: number) {
    return { message: '触发规则删除功能待实现', id }
  }

  @Get('archive-configs')
  @ApiOperation({ summary: '获取存档配置列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getArchiveConfigs(@Query() query: any) {
    return { message: '存档配置查询功能待实现', query }
  }

  @Post('archive-configs')
  @ApiOperation({ summary: '创建存档配置' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createArchiveConfig(@Body() configData: any) {
    return { message: '存档配置创建功能待实现', configData }
  }

  @Put('archive-configs/:id')
  @ApiOperation({ summary: '更新存档配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateArchiveConfig(@Param('id') id: number, @Body() configData: any) {
    return { message: '存档配置更新功能待实现', id, configData }
  }

  @Delete('archive-configs/:id')
  @ApiOperation({ summary: '删除存档配置' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteArchiveConfig(@Param('id') id: number) {
    return { message: '存档配置删除功能待实现', id }
  }

  @Get('analytics/chat-stats')
  @ApiOperation({ summary: '获取聊天统计分析' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getChatAnalytics(@Query() query: {
    startDate?: string
    endDate?: string
    customerId?: number
  }) {
    return { message: '聊天统计分析功能待实现', query }
  }

  @Get('analytics/ai-stats')
  @ApiOperation({ summary: '获取AI分析统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAIAnalytics(@Query() query: {
    startDate?: string
    endDate?: string
    ruleType?: string
  }) {
    return { message: 'AI分析统计功能待实现', query }
  }
}