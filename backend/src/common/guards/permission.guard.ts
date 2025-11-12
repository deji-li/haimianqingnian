import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../../modules/system/entities/role-permission.entity';
import { Permission } from '../../modules/system/entities/permission.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取需要的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('=== PERMISSION GUARD DEBUG ===');
    console.log('Required permissions:', requiredPermissions);

    // 如果没有设置权限要求，则放行
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('No permissions required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User from request:', user);
    console.log('User roleCode:', user?.roleCode);
    console.log('User roleId:', user?.roleId);

    // 如果没有用户信息，拒绝访问
    if (!user) {
      console.error('No user found in request, throwing ForbiddenException');
      throw new ForbiddenException('未授权访问');
    }

    // 超级管理员拥有所有权限（优先检查，避免后面roleId检查失败）
    if (user.roleCode === 'admin' || user.roleCode === 'super_admin') {
      console.log('User is admin, allowing access');
      return true;
    }

    console.log('User is not admin, checking specific permissions...');

    // 检查roleId（非admin用户需要）
    if (!user.roleId) {
      throw new ForbiddenException('未授权访问');
    }

    // 查询用户角色的权限
    const rolePermissions = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .leftJoin(Permission, 'p', 'rp.permission_id = p.id')
      .where('rp.role_id = :roleId', { roleId: user.roleId })
      .andWhere('p.status = 1')
      .select('p.code', 'code')
      .getRawMany();

    const userPermissions = rolePermissions.map((rp) => rp.code);

    // 检查用户是否拥有所有需要的权限
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('权限不足，无法访问此功能');
    }

    return true;
  }
}
