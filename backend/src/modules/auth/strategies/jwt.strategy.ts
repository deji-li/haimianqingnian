import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('roles', 'role', 'user.role_id = role.id')
      .where('user.id = :id', { id: payload.sub })
      .select([
        'user.id AS user_id',
        'user.username AS user_username',
        'user.real_name AS user_realName',
        'user.phone AS user_phone',
        'user.email AS user_email',
        'user.role_id AS user_roleId',
        'user.department_id AS user_departmentId',
        'user.campus_id AS user_campusId',
        'user.status AS user_status',
        'role.code AS roleCode',
        'role.name AS roleName',
      ])
      .getRawOne();

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.user_status === 0) {
      throw new UnauthorizedException('用户已被禁用');
    }

    return {
      id: user.user_id,
      username: user.user_username,
      realName: user.user_realName,
      roleId: user.user_roleId,
      roleCode: user.roleCode,
      roleName: user.roleName,
      departmentId: user.user_departmentId,
      campusId: user.user_campusId,
    };
  }
}
