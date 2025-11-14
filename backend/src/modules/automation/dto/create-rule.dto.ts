import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsOptional, IsInt, Min } from 'class-validator';
import { RuleType, TriggerType, RuleStatus } from '../entities/automation-rule.entity';

export class CreateAutomationRuleDto {
  @ApiProperty({ description: '规则名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '规则类型', enum: RuleType })
  @IsEnum(RuleType)
  ruleType: RuleType;

  @ApiProperty({ description: '触发类型', enum: TriggerType })
  @IsEnum(TriggerType)
  triggerType: TriggerType;

  @ApiPropertyOptional({ description: '触发条件（JSON格式）' })
  @IsOptional()
  @IsObject()
  triggerConditions?: Record<string, any>;

  @ApiProperty({ description: '执行动作（JSON格式）' })
  @IsObject()
  actions: Record<string, any>;

  @ApiPropertyOptional({ description: '优先级', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ description: '规则描述' })
  @IsOptional()
  @IsString()
  description?: string;
}
