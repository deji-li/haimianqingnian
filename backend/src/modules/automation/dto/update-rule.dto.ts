import { PartialType } from '@nestjs/swagger';
import { CreateAutomationRuleDto } from './create-rule.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RuleStatus } from '../entities/automation-rule.entity';

export class UpdateAutomationRuleDto extends PartialType(CreateAutomationRuleDto) {
  @ApiPropertyOptional({ description: '规则状态', enum: RuleStatus })
  @IsOptional()
  @IsEnum(RuleStatus)
  status?: RuleStatus;
}
