import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class CreateAiPromptConfigDto {
  @ApiProperty({ description: '场景唯一标识', example: 'customer_info_extract' })
  @IsNotEmpty({ message: '场景标识不能为空' })
  @IsString()
  scenarioKey: string;

  @ApiProperty({ description: '场景名称', example: '客户信息提取' })
  @IsNotEmpty({ message: '场景名称不能为空' })
  @IsString()
  scenarioName: string;

  @ApiProperty({ description: '场景分类', example: '客户管理' })
  @IsNotEmpty({ message: '场景分类不能为空' })
  @IsString()
  scenarioCategory: string;

  @ApiProperty({ description: 'AI供应商', enum: ['deepseek', 'doubao'] })
  @IsNotEmpty({ message: 'AI供应商不能为空' })
  @IsEnum(['deepseek', 'doubao'])
  modelProvider: string;

  @ApiPropertyOptional({ description: '具体模型名称', example: 'deepseek-chat' })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiProperty({ description: '提示词内容' })
  @IsNotEmpty({ message: '提示词内容不能为空' })
  @IsString()
  promptContent: string;

  @ApiPropertyOptional({ description: '系统提示词' })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional({ description: '温度参数', example: 0.3 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: '最大tokens', example: 2000 })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiPropertyOptional({ description: '支持的变量列表', type: [String] })
  @IsOptional()
  @IsArray()
  variables?: string[];

  @ApiPropertyOptional({ description: '变量说明' })
  @IsOptional()
  @IsString()
  variableDescription?: string;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
