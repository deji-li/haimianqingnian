import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';

/**
 * 权限装饰器
 * @param permissions 需要的权限代码数组
 * @example @RequirePermissions('customer:create', 'customer:update')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
