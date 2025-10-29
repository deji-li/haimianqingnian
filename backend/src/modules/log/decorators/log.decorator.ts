import { SetMetadata } from '@nestjs/common';

export const LOG_METADATA_KEY = 'log_operation';

export interface LogMetadata {
  module: string;
  action: string;
}

/**
 * 操作日志装饰器
 * @param module 操作模块
 * @param action 操作动作
 *
 * @example
 * @Log('用户管理', '创建用户')
 * @Post()
 * create(@Body() dto: CreateUserDto) {
 *   return this.userService.create(dto);
 * }
 */
export const Log = (module: string, action: string) =>
  SetMetadata(LOG_METADATA_KEY, { module, action } as LogMetadata);
