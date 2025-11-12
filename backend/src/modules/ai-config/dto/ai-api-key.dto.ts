import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiApiKeyDto {
  @ApiProperty({ description: 'AI供应商', enum: ['deepseek', 'doubao'] })
  @IsNotEmpty()
  @IsEnum(['deepseek', 'doubao'])
  provider: string;

  @ApiProperty({ description: 'API密钥' })
  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'API地址' })
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @ApiProperty({ description: '端点ID（豆包专用）', required: false })
  @IsOptional()
  @IsString()
  endpointId?: string;

  @ApiProperty({ description: '默认模型名称', required: false })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiProperty({ description: '备注说明', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAiApiKeyDto {
  @ApiProperty({ description: 'API密钥', required: false })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({ description: 'API地址', required: false })
  @IsOptional()
  @IsString()
  apiUrl?: string;

  @ApiProperty({ description: '端点ID（豆包专用）', required: false })
  @IsOptional()
  @IsString()
  endpointId?: string;

  @ApiProperty({ description: '默认模型名称', required: false })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiProperty({ description: '备注说明', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
