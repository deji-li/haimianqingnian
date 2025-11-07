import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryReportListDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ description: '报告类型', required: false })
  @IsOptional()
  @IsString()
  reportType?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export class QuerySleepingCustomersDto {
  @ApiProperty({ description: '沉睡天数', required: false, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number = 30;
}

export class QueryAnalyticsDto {
  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiProperty({ description: '部门ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;
}
