import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// 执行营销场景DTO
export class ExecuteScenarioDto {
  @ApiProperty({ description: '场景标识', example: 'pain_point_analysis' })
  @IsNotEmpty()
  @IsString()
  scenarioKey: string;

  @ApiProperty({ description: '变量值映射', example: { chat_content: '...', customer_profile: '...' } })
  @IsNotEmpty()
  @IsObject()
  variables: Record<string, any>;

  @ApiProperty({ description: '客户ID（可选，用于记录）', required: false })
  @IsOptional()
  customerId?: number;
}

// 场景查询DTO
export class QueryScenarioDto {
  @ApiProperty({ description: '场景分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  isActive?: boolean;
}

// 批量执行场景DTO
export class BatchExecuteScenarioDto {
  @ApiProperty({ description: '场景标识列表', type: [String] })
  @IsNotEmpty()
  scenarioKeys: string[];

  @ApiProperty({ description: '共享变量', example: { chat_content: '...' } })
  @IsNotEmpty()
  @IsObject()
  sharedVariables: Record<string, any>;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  customerId?: number;
}
