import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateDictionaryDto {
  @ApiProperty({ description: '字典类型' })
  @IsString()
  dictType: string;

  @ApiProperty({ description: '字典标签' })
  @IsString()
  dictLabel: string;

  @ApiProperty({ description: '字典值' })
  @IsString()
  dictValue: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
