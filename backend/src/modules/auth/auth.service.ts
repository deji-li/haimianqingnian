import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { Permission } from '../system/entities/permission.entity';
import { RolePermission } from '../system/entities/role-permission.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查询用户（包含角色信息）
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('roles', 'role', 'user.role_id = role.id')
      .where('user.username = :username', { username })
      .select([
        'user.id',
        'user.username',
        'user.password',
        'user.realName',
        'user.phone',
        'user.email',
        'user.roleId',
        'user.departmentId',
        'user.campusId',
        'user.avatar',
        'user.status',
        'role.code as roleCode',
        'role.name as roleName',
      ])
      .getRawOne();

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.user_status === 0) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 更新最后登录时间
    await this.userRepository.update(user.user_id, {
      lastLoginTime: new Date(),
    });

    // 生成 JWT Token
    const payload = {
      sub: user.user_id,
      username: user.user_username,
    };

    const token = this.jwtService.sign(payload);

    // 获取用户权限
    const permissions = await this.getUserPermissions(user.user_roleId, user.roleCode);

    return {
      access_token: token,
      user: {
        id: user.user_id,
        username: user.user_username,
        realName: user.user_realName,
        phone: user.user_phone,
        email: user.user_email,
        roleId: user.user_roleId,
        roleCode: user.roleCode,
        roleName: user.roleName,
        departmentId: user.user_departmentId,
        campusId: user.user_campusId,
        avatar: user.user_avatar,
        permissions,
      },
    };
  }

  /**
   * 获取用户权限列表
   */
  private async getUserPermissions(roleId: number, roleCode: string): Promise<string[]> {
    // 超级管理员拥有所有权限
    if (roleCode === 'admin' || roleCode === 'super_admin') {
      const allPermissions = await this.permissionRepository.find({
        where: { status: 1 },
        select: ['code'],
      });
      return allPermissions.map(p => p.code);
    }

    // 查询角色的权限
    const rolePermissions = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .leftJoin(Permission, 'p', 'rp.permission_id = p.id')
      .where('rp.role_id = :roleId', { roleId })
      .andWhere('p.status = 1')
      .select('p.code', 'code')
      .getRawMany();

    return rolePermissions.map(rp => rp.code);
  }

  async getUserInfo(userId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('roles', 'role', 'user.role_id = role.id')
      .leftJoin('department', 'dept', 'user.department_id = dept.id')
      .leftJoin('campus', 'campus', 'user.campus_id = campus.id')
      .where('user.id = :id', { id: userId })
      .select([
        'user.id AS user_id',
        'user.username AS user_username',
        'user.real_name AS user_real_name',
        'user.phone AS user_phone',
        'user.email AS user_email',
        'user.role_id AS user_role_id',
        'user.department_id AS user_department_id',
        'user.campus_id AS user_campus_id',
        'user.avatar AS user_avatar',
        'role.code AS role_code',
        'role.name AS role_name',
        'dept.department_name AS dept_name',
        'campus.campus_name AS campus_name',
      ])
      .getRawOne();

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 获取用户权限
    const permissions = await this.getUserPermissions(user.user_role_id, user.role_code);

    return {
      id: user.user_id,
      username: user.user_username,
      realName: user.user_real_name,
      phone: user.user_phone,
      email: user.user_email,
      roleId: user.user_role_id,
      roleCode: user.role_code,
      roleName: user.role_name,
      departmentId: user.user_department_id,
      departmentName: user.dept_name,
      campusId: user.user_campus_id,
      campusName: user.campus_name,
      avatar: user.user_avatar,
      permissions,
    };
  }
}
