import { IsString, IsEnum, IsNumber, IsOptional, IsObject } from 'class-validator';
import {
  SchemeType,
  SchemeRule,
  SchemeConditions,
} from '../entities/commission-scheme.entity';

export class CreateSchemeDto {
  @IsString()
  name: string;

  @IsEnum(['fixed', 'percentage', 'tiered', 'custom'])
  type: SchemeType;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  rules: SchemeRule;

  @IsObject()
  @IsOptional()
  conditions?: SchemeConditions;
}
