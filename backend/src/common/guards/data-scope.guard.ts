import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class DataScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    // 根据角色自动注入数据权限查询条件
    request.dataScope = {};

    switch (user.roleCode) {
      case 'sales':
        // 销售只能看自己的数据
        request.dataScope.salesId = user.id;
        break;
      case 'campus_manager':
        // 校区主管看本校区所有数据
        request.dataScope.campusId = user.campusId;
        break;
      case 'sales_manager':
        // 销售主管看本部门数据
        request.dataScope.departmentId = user.departmentId;
        break;
      case 'admin':
        // 管理员无限制
        break;
      default:
        break;
    }

    return true;
  }
}
