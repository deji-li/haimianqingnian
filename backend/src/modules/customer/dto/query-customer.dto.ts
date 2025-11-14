import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCustomerDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '搜索关键词（微信昵称/微信号/手机号）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: '客户意向度',
    enum: ['高', '中', '低'],
  })
  @IsOptional()
  @IsString()
  customerIntent?: string;

  @ApiPropertyOptional({ description: '流量来源' })
  @IsOptional()
  @IsString()
  trafficSource?: string;

  @ApiPropertyOptional({ description: '销售ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salesId?: number;

  @ApiPropertyOptional({ description: '运营人员ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  operatorId?: number;

  @ApiPropertyOptional({ description: '生命周期阶段' })
  @IsOptional()
  @IsString()
  lifecycleStage?: string;

  @ApiPropertyOptional({ description: '客户来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '校区ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  campusId?: number;

  @ApiPropertyOptional({ description: '创建时间开始（YYYY-MM-DD）' })
  @IsOptional()
  @IsString()
  createTimeStart?: string;

  @ApiPropertyOptional({ description: '创建时间结束（YYYY-MM-DD）' })
  @IsOptional()
  @IsString()
  createTimeEnd?: string;

  @ApiPropertyOptional({ description: '下次回访时间开始（YYYY-MM-DD）' })
  @IsOptional()
  @IsString()
  nextFollowTimeStart?: string;

  @ApiPropertyOptional({ description: '下次回访时间结束（YYYY-MM-DD）' })
  @IsOptional()
  @IsString()
  nextFollowTimeEnd?: string;

  @ApiPropertyOptional({ description: '是否有手机号（true/false）' })
  @IsOptional()
  hasPhone?: boolean;

  @ApiPropertyOptional({ description: '是否有真实姓名（true/false）' })
  @IsOptional()
  hasRealName?: boolean;

  @ApiPropertyOptional({ description: '排序字段', example: 'createTime' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: '排序方向', enum: ['ASC', 'DESC'], example: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
