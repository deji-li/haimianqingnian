import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateKeyResultDto {
  @ApiProperty({ description: '关键结果描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '目标值', required: false })
  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @ApiProperty({ description: '当前值', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @ApiProperty({ description: '单位', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: '权重', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}
