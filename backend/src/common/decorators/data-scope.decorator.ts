import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 数据权限装饰器
 * 根据用户角色返回数据权限范围
 */
export const DataScope = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return {};
    }

    // 根据角色返回不同的数据权限
    const dataScope: any = {
      userId: user.id,
      roleId: user.roleId,
      roleCode: user.roleCode,
    };

    // 管理员可以看到所有数据
    if (user.roleCode === 'admin') {
      dataScope.isAdmin = true;
      return dataScope;
    }

    // 销售主管可以看到所有销售的数据
    if (user.roleCode === 'sales_manager') {
      dataScope.isSalesManager = true;
      // 可以添加部门ID等
      if (user.departmentId) {
        dataScope.departmentId = user.departmentId;
      }
      return dataScope;
    }

    // 普通销售只能看到自己的数据
    if (user.roleCode === 'sales') {
      dataScope.salesId = user.id;
      return dataScope;
    }

    // 其他角色
    return dataScope;
  },
);
