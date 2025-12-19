import { IsEnum, IsOptional, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export enum FunctionType {
  DEAL_ASSIST = 'deal_assist',
  REPLY_ASSIST = 'reply_assist',
  SCRIPT_POLISH = 'script_polish',
  OPENING_LINES = 'opening_lines'
}

export class CreateConversationDto {
  @IsEnum(FunctionType)
  @IsNotEmpty({ message: '功能类型不能为空' })
  functionType: FunctionType;

  @IsOptional()
  @IsNumber({}, { message: '场景ID必须是数字' })
  scenarioId?: number;

  @IsOptional()
  @IsNumber({}, { message: '技巧ID必须是数字' })
  techniqueId?: number;

  @IsOptional()
  @IsNumber({}, { message: '客户ID必须是数字' })
  customerId?: number;

  @IsOptional()
  @IsString({ message: '对话标题必须是字符串' })
  title?: string;
}