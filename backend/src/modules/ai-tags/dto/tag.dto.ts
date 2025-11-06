import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
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
  customerId?: number;

  @ApiProperty({ description: '标签分类', required: false })
  @IsOptional()
  tagCategory?: string;

  @ApiProperty({ description: '标签来源', required: false, enum: ['AI自动', '人工添加'] })
  @IsOptional()
  source?: string;

  @ApiProperty({ description: '是否有效', required: false })
  @IsOptional()
  isActive?: number;
}
