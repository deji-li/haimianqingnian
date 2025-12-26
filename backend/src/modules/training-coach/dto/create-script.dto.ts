import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScriptDto {
  @ApiProperty({ description: '剧本标题', example: '首次接触培训' })
  @IsString()
  title: string;

  @ApiProperty({ description: '场景类型', example: '首次接触' })
  @IsString()
  scenario: string;

  @ApiProperty({ description: '难度等级', enum: ['简单', '普通', '困难'], example: '普通' })
  @IsEnum(['简单', '普通', '困难'])
  difficulty: string;

  @ApiProperty({ description: '来源类型', enum: ['AI生成', '手动创建', '聊天记录'], example: '手动创建' })
  @IsEnum(['AI生成', '手动创建', '聊天记录'])
  source_type: string;

  @ApiPropertyOptional({ description: '源聊天记录ID', example: 123 })
  @IsOptional()
  @IsNumber()
  source_chat_id?: number;

  @ApiProperty({ description: '客户背景', example: '客户对企业产品初步感兴趣，但犹豫不决' })
  @IsString()
  customer_background: string;

  @ApiProperty({ description: '培训目标', example: '建立初步信任，了解客户真实需求' })
  @IsString()
  training_goal: string;

  @ApiPropertyOptional({ description: '关键异议列表', example: ['价格太贵', '效果不确定'] })
  @IsOptional()
  @IsArray()
  key_objections?: string[];

  @ApiPropertyOptional({ description: '标准话术', example: ['开场白：热情介绍公司和产品'] })
  @IsOptional()
  @IsArray()
  standard_scripts?: string[];

  @ApiPropertyOptional({ description: '对话流程', example: { round_1: { customer: '你们这个是什么？' } } })
  @IsOptional()
  @IsObject()
  dialogue_flow?: Record<string, any>;

  @ApiPropertyOptional({ description: '最大轮次', example: 6 })
  @IsOptional()
  @IsNumber()
  max_rounds?: number;

  @ApiPropertyOptional({ description: '异议数量', example: 3 })
  @IsOptional()
  @IsNumber()
  objection_count?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['草稿', '已发布', '已下架'], example: '已发布' })
  @IsOptional()
  @IsEnum(['草稿', '已发布', '已下架'])
  status?: string;
}