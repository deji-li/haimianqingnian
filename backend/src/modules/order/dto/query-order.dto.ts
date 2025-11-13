import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsEnum, ValidateIf, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOrderDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({
    description: '搜索关键词（订单号/客户微信号/手机号）',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '销售ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salesId?: number;

  @ApiPropertyOptional({ description: '校区ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  campusId?: number;

  @ApiPropertyOptional({
    description: '订单状态',
    enum: ['待上课', '上课中', '已完成', '已退款'],
  })
  @IsOptional()
  @ValidateIf((o) => o.orderStatus !== '' && o.orderStatus !== null && o.orderStatus !== undefined)
  @IsEnum(['待上课', '上课中', '已完成', '已退款'], {
    message: 'orderStatus must be one of the following values: 待上课, 上课中, 已完成, 已退款',
  })
  orderStatus?: string;

  @ApiPropertyOptional({ description: '是否新学员', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isNewStudent?: number;

  @ApiPropertyOptional({ description: '开始日期', example: '2025-10-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2025-10-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
