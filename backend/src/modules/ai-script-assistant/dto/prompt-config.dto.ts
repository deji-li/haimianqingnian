import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FunctionType } from './create-conversation.dto';

export class CreatePromptConfigDto {
  @ApiProperty({ description: '功能类型', enum: ['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'] })
  @IsEnum(['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'])
  functionType: FunctionType;

  @ApiProperty({ description: '场景ID', required: false })
  @IsOptional()
  @IsNumber()
  scenarioId?: number;

  @ApiProperty({ description: '技巧ID', required: false })
  @IsOptional()
  @IsNumber()
  techniqueId?: number;

  @ApiProperty({ description: '配置名称' })
  @IsNotEmpty()
  @IsString()
  configName: string;

  @ApiProperty({ description: '系统提示词', required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({ description: '用户提示词模板', required: false })
  @IsOptional()
  @IsString()
  userPromptTemplate?: string;

  @ApiProperty({ description: '温度值', default: 0.7, minimum: 0, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number = 0.7;

  @ApiProperty({ description: '最大Token数', default: 2000, minimum: 100, maximum: 8000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(8000)
  maxTokens?: number = 2000;

  @ApiProperty({ description: '知识库权重', default: 0.7, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  knowledgeWeight?: number = 0.7;

  @ApiProperty({ description: '支持变量列表', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdatePromptConfigDto {
  @ApiProperty({ description: '场景ID', required: false })
  @IsOptional()
  @IsNumber()
  scenarioId?: number;

  @ApiProperty({ description: '技巧ID', required: false })
  @IsOptional()
  @IsNumber()
  techniqueId?: number;

  @ApiProperty({ description: '配置名称', required: false })
  @IsOptional()
  @IsString()
  configName?: string;

  @ApiProperty({ description: '系统提示词', required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({ description: '用户提示词模板', required: false })
  @IsOptional()
  @IsString()
  userPromptTemplate?: string;

  @ApiProperty({ description: '温度值', required: false, minimum: 0, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiProperty({ description: '最大Token数', required: false, minimum: 100, maximum: 8000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(8000)
  maxTokens?: number;

  @ApiProperty({ description: '知识库权重', required: false, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  knowledgeWeight?: number;

  @ApiProperty({ description: '支持变量列表', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryPromptConfigDto {
  @ApiProperty({ description: '功能类型', required: false })
  @IsOptional()
  @IsEnum(['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'])
  functionType?: FunctionType;

  @ApiProperty({ description: '场景ID', required: false })
  @IsOptional()
  @IsNumber()
  scenarioId?: number;

  @ApiProperty({ description: '技巧ID', required: false })
  @IsOptional()
  @IsNumber()
  techniqueId?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// 预设的变量类型
export const SUPPORTED_VARIABLES = {
  CUSTOMER_NAME: { name: 'customerName', label: '客户姓名', type: 'string' },
  PRODUCT_NAME: { name: 'productName', label: '产品名称', type: 'string' },
  COMPANY_NAME: { name: 'companyName', label: '公司名称', type: 'string' },
  INDUSTRY: { name: 'industry', label: '客户行业', type: 'string' },
  POSITION: { name: 'position', label: '客户职位', type: 'string' },
  SCENARIO: { name: 'scenario', label: '场景描述', type: 'string' },
  TECHNIQUE: { name: 'technique', label: '技巧说明', type: 'string' },
  CUSTOMER_INTENT: { name: 'customerIntent', label: '客户意向', type: 'string' },
  PAIN_POINT: { name: 'painPoint', label: '客户痛点', type: 'string' },
  BUDGET: { name: 'budget', label: '预算范围', type: 'string' },
  DECISION_AUTH: { name: 'decisionAuth', label: '决策权限', type: 'string' },
  LIFECYCLE_STAGE: { name: 'lifecycleStage', label: '生命周期阶段', type: 'string' },
  LAST_CONTACT: { name: 'lastContact', label: '最后联系时间', type: 'string' },
  COMMUNICATION_GOAL: { name: 'communicationGoal', label: '沟通目标', type: 'string' },
  APPLICATION_SCENARIO: { name: 'applicationScenario', label: '应用场景', type: 'string' },
  POLISH_GOAL: { name: 'polishGoal', label: '润色目标', type: 'string' },
};