import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsBoolean, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class SyncStrategy {
  @ApiProperty({ description: '同步间隔（分钟）', default: 60 })
  @IsOptional()
  syncInterval?: number

  @ApiProperty({ description: '是否启用增量同步', default: true })
  @IsOptional()
  incrementalSync?: boolean

  @ApiProperty({ description: '批量同步大小', default: 100 })
  @IsOptional()
  batchSize?: number
}

export class CreateWeWorkConfigDto {
  @ApiProperty({ description: '企业ID' })
  @IsString()
  corpId: string

  @ApiProperty({ description: '应用Secret' })
  @IsString()
  appSecret: string

  @ApiProperty({ description: '回调Token', required: false })
  @IsOptional()
  @IsString()
  token?: string

  @ApiProperty({ description: '回调AESKey', required: false })
  @IsOptional()
  @IsString()
  aesKey?: string

  @ApiProperty({ description: 'Webhook回调地址', required: false })
  @IsOptional()
  @IsString()
  webhookUrl?: string

  @ApiProperty({ description: '同步策略', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SyncStrategy)
  syncStrategy?: SyncStrategy

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateWeWorkConfigDto {
  @ApiProperty({ description: '企业ID', required: false })
  @IsOptional()
  @IsString()
  corpId?: string

  @ApiProperty({ description: '应用Secret', required: false })
  @IsOptional()
  @IsString()
  appSecret?: string

  @ApiProperty({ description: '回调Token', required: false })
  @IsOptional()
  @IsString()
  token?: string

  @ApiProperty({ description: '回调AESKey', required: false })
  @IsOptional()
  @IsString()
  aesKey?: string

  @ApiProperty({ description: 'Webhook回调地址', required: false })
  @IsOptional()
  @IsString()
  webhookUrl?: string

  @ApiProperty({ description: '同步策略', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SyncStrategy)
  syncStrategy?: SyncStrategy

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}