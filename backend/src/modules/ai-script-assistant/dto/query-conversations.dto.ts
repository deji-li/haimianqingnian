import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FunctionType } from './create-conversation.dto';

export class QueryConversationsDto {
  @IsOptional()
  @IsEnum(FunctionType)
  functionType?: FunctionType;

  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  @Type(() => Number)
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Type(() => Number)
  @Min(1, { message: '每页数量最小为1' })
  @Max(100, { message: '每页数量最大为100' })
  limit?: number = 20;

  @IsOptional()
  @IsNumber({}, { message: '客户ID必须是数字' })
  @Type(() => Number)
  customerId?: number;

  @IsOptional()
  @IsNumber({}, { message: '用户ID必须是数字' })
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  isActive?: boolean = true;
}