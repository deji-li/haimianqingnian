import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriggerSyncDto {
  @ApiProperty({ description: '开始时间', required: false, example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false, example: '2024-01-31' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ description: '订单状态筛选', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}
