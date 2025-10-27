import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      },
    };
  }

  async getUserInfo(userId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('roles', 'role', 'user.role_id = role.id')
      .leftJoinAndSelect('departments', 'dept', 'user.department_id = dept.id')
      .leftJoinAndSelect('campuses', 'campus', 'user.campus_id = campus.id')
      .where('user.id = :id', { id: userId })
      .select([
        'user.id',
        'user.username',
        'user.realName',
        'user.phone',
        'user.email',
        'user.roleId',
        'user.departmentId',
        'user.campusId',
        'user.avatar',
        'role.code as roleCode',
        'role.name as roleName',
        'dept.name as departmentName',
        'campus.name as campusName',
      ])
      .getRawOne();

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.user_id,
      username: user.user_username,
      realName: user.user_realName,
      phone: user.user_phone,
      email: user.user_email,
      roleId: user.user_roleId,
      roleCode: user.roleCode,
      roleName: user.roleName,
      departmentId: user.user_departmentId,
      departmentName: user.departmentName,
      campusId: user.user_campusId,
      campusName: user.campusName,
      avatar: user.user_avatar,
    };
  }
}
