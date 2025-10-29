import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 可选枚举装饰器
 * 解决空字符串导致的 IsEnum 验证失败问题
 */
export function IsOptionalEnum(
  enumValues: any[] | object,
  property?: { description?: string; example?: any },
) {
  const enumArray = Array.isArray(enumValues)
    ? enumValues
    : Object.values(enumValues);

  const decorators = [IsOptional()];

  // 添加 ApiPropertyOptional
  if (property) {
    decorators.push(
      ApiPropertyOptional({
        ...property,
        enum: enumArray,
      }),
    );
  }

  // 只在有值且不为空字符串时验证
  decorators.push(
    ValidateIf((o, value) => value !== '' && value !== null && value !== undefined),
    IsEnum(enumArray),
  );

  return applyDecorators(...decorators);
}
