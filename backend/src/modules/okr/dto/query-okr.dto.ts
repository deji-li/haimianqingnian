import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOkrDto {
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

  @ApiProperty({ description: '负责人ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownerId?: number;

  @ApiProperty({
    description: 'OKR类型',
    enum: ['individual', 'team', 'company'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['individual', 'team', 'company'])
  type?: string;

  @ApiProperty({
    description: '状态',
    enum: ['draft', 'active', 'completed', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['draft', 'active', 'completed', 'cancelled'])
  status?: string;
}
