import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAiPromptConfigDto {
  @ApiPropertyOptional({ description: '场景分类' })
  @IsOptional()
  @IsString()
  scenarioCategory?: string;

  @ApiPropertyOptional({ description: 'AI供应商', enum: ['deepseek', 'doubao'] })
  @IsOptional()
  @IsEnum(['deepseek', 'doubao'])
  modelProvider?: string;

  @ApiPropertyOptional({ description: '场景标识' })
  @IsOptional()
  @IsString()
  scenarioKey?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 20, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 20;
}
