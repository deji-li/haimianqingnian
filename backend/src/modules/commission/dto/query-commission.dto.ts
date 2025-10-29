import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCommissionDto {
  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @ApiProperty({ description: '员工ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: '提成状态', required: false })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'cancelled'])
  status?: string;

  @ApiProperty({ description: '结算月份', required: false })
  @IsOptional()
  @IsString()
  settlementMonth?: string;
}
