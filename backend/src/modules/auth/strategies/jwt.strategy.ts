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
      .leftJoin('user.role', 'role')
      .where('user.id = :id', { id: payload.sub })
      .select([
        'user.id',
        'user.username',
        'user.realName',
        'user.phone',
        'user.email',
        'user.roleId',
        'user.departmentId',
        'user.campusId',
        'user.status',
        'role.code',
        'role.name',
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
      roleCode: user.role_code,
      roleName: user.role_name,
      departmentId: user.user_departmentId,
      campusId: user.user_campusId,
    };
  }
}
