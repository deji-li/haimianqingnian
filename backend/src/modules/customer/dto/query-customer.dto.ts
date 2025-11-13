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
}
