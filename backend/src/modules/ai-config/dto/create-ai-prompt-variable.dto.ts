import { IsString, IsBoolean, IsInt, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiPromptVariableDto {
  @ApiProperty({ description: '提示词配置ID' })
  @IsInt()
  promptConfigId: number;

  @ApiProperty({ description: '场景标识' })
  @IsString()
  @MaxLength(50)
  scenarioKey: string;

  @ApiProperty({ description: '变量标识' })
  @IsString()
  @MaxLength(50)
  variableKey: string;

  @ApiProperty({ description: '变量名称' })
  @IsString()
  @MaxLength(100)
  variableName: string;

  @ApiProperty({ description: '变量说明', required: false })
  @IsOptional()
  @IsString()
  variableDescription?: string;

  @ApiProperty({ description: '数据类型', default: 'text' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dataType?: string;

  @ApiProperty({ description: '是否必填', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '默认值', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  defaultValue?: string;

  @ApiProperty({ description: '示例值', required: false })
  @IsOptional()
  @IsString()
  exampleValue?: string;

  @ApiProperty({ description: '验证规则', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  validationRule?: string;

  @ApiProperty({ description: '显示顺序', default: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiProperty({ description: '变量分类', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}
