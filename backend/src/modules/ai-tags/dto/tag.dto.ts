import { IsNotEmpty, IsString, IsNumber, IsOptional, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: '客户ID' })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ description: '标签分类' })
  @IsNotEmpty()
  @IsString()
  tagCategory: string;

  @ApiProperty({ description: '标签名称' })
  @IsNotEmpty()
  @IsString()
  tagName: string;

  @ApiProperty({ description: '标签值', required: false })
  @IsOptional()
  @IsString()
  tagValue?: string;
}

export class QueryTagsDto {
  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ description: '标签分类', required: false })
  @IsOptional()
  @IsString()
  tagCategory?: string;

  @ApiProperty({ description: '标签来源', required: false, enum: ['AI自动', '人工添加'] })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: '是否有效', required: false })
  @IsOptional()
  @IsNumber()
  isActive?: number;

  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Max(100)
  limit?: number;
}
