import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKeyResultDto {
  @ApiProperty({ description: '关键结果描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '目标值' })
  @IsNumber()
  targetValue: number;

  @ApiProperty({ description: '单位', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: '权重', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class CreateOkrDto {
  @ApiProperty({ description: 'OKR标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'OKR描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '负责人ID' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ description: 'OKR类型', enum: ['individual', 'team', 'company'] })
  @IsEnum(['individual', 'team', 'company'])
  type: string;

  @ApiProperty({ description: '开始日期' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: '结束日期' })
  @IsString()
  endDate: string;

  @ApiProperty({ description: '关键结果列表', type: [CreateKeyResultDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKeyResultDto)
  keyResults: CreateKeyResultDto[];
}
