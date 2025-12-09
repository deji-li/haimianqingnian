import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SyncContactsDto {
  @ApiPropertyOptional({ description: '企业ID' })
  @IsString()
  @IsOptional()
  corpId?: string

  @ApiPropertyOptional({ description: '部门ID' })
  @IsNumber()
  @IsOptional()
  departmentId?: number

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string

  @ApiPropertyOptional({ description: '是否强制同步' })
  @IsBoolean()
  @IsOptional()
  force?: boolean
}

export class SyncChatRecordsDto {
  @ApiPropertyOptional({ description: '外部联系人ID' })
  @IsString()
  @IsOptional()
  externalUserId?: string

  @ApiPropertyOptional({ description: 'CRM客户ID' })
  @IsNumber()
  @IsOptional()
  customerId?: number

  @ApiPropertyOptional({ description: '开始日期' })
  @IsDateString()
  @IsOptional()
  startDate?: string

  @ApiPropertyOptional({ description: '结束日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string

  @ApiPropertyOptional({ description: '消息数量限制' })
  @IsNumber()
  @IsOptional()
  messageCount?: number
}

export class SyncTriggerDto {
  @ApiPropertyOptional({ description: '同步类型', enum: ['contact', 'chat', 'all'] })
  @IsString()
  @IsOptional()
  type?: 'contact' | 'chat' | 'all'

  @ApiPropertyOptional({ description: '是否增量同步' })
  @IsBoolean()
  @IsOptional()
  incremental?: boolean

  @ApiPropertyOptional({ description: '强制同步' })
  @IsBoolean()
  @IsOptional()
  force?: boolean
}

export class SyncStatusDto {
  @ApiProperty({ description: '是否正在运行' })
  isRunning: boolean

  @ApiPropertyOptional({ description: '上次同步时间' })
  @IsOptional()
  lastSyncTime?: string

  @ApiPropertyOptional({ description: '下次同步时间' })
  @IsOptional()
  nextSyncTime?: string

  @ApiProperty({ description: '总联系人数' })
  totalContacts: number

  @ApiProperty({ description: '已同步联系人数' })
  syncedContacts: number

  @ApiProperty({ description: '失败联系人数' })
  failedContacts: number

  @ApiProperty({ description: '同步进度(0-100)' })
  progress: number

  @ApiProperty({ description: '同步日志' })
  logs: SyncLogDto[]
}

export class SyncLogDto {
  @ApiProperty({ description: '日志ID' })
  id: number

  @ApiProperty({ description: '同步类型', enum: ['contact', 'chat', 'error'] })
  type: 'contact' | 'chat' | 'error'

  @ApiProperty({ description: '日志消息' })
  message: string

  @ApiPropertyOptional({ description: '详细信息' })
  @IsOptional()
  details?: any

  @ApiProperty({ description: '时间戳' })
  timestamp: string

  @ApiProperty({ description: '状态', enum: ['success', 'warning', 'error'] })
  status: 'success' | 'warning' | 'error'
}

export class SyncResultDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean

  @ApiProperty({ description: '消息' })
  message: string

  @ApiProperty({ description: '任务ID' })
  taskId?: string

  @ApiProperty({ description: '总数量' })
  total: number

  @ApiProperty({ description: '成功数量' })
  synced: number

  @ApiProperty({ description: '失败数量' })
  failed: number

  @ApiPropertyOptional({ description: '错误列表' })
  @IsOptional()
  errors?: string[]

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  startTime?: string

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  endTime?: string

  @ApiPropertyOptional({ description: '耗时(毫秒)' })
  @IsOptional()
  duration?: number
}