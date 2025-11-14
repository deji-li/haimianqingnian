import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncConfigDto {
  @ApiProperty({ description: 'API密钥' })
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'API地址' })
  @IsString()
  apiUrl: string;

  @ApiProperty({ description: '默认销售ID' })
  @IsNumber()
  defaultSalesId: number;

  @ApiProperty({ description: '启用自动同步' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: '同步间隔(分钟)' })
  @IsNumber()
  interval: number;

  @ApiProperty({ description: '每日批量更新时间', example: '02:00' })
  @IsString()
  dailyUpdateTime: string;

  @ApiProperty({ description: '增量同步天数' })
  @IsNumber()
  syncRangeDays: number;

  @ApiProperty({ description: '每批次同步数量' })
  @IsNumber()
  batchSize: number;

  @ApiProperty({ description: '更新已存在订单' })
  @IsBoolean()
  updateExisting: boolean;

  @ApiProperty({ description: '同步客户信息' })
  @IsBoolean()
  syncCustomerInfo: boolean;

  @ApiProperty({ description: '自动创建校区' })
  @IsBoolean()
  autoCreateCampus: boolean;
}

export class UpdateSyncConfigDto {
  @ApiProperty({ description: '配置键' })
  @IsString()
  configKey: string;

  @ApiProperty({ description: '配置值' })
  @IsString()
  configValue: string;
}
