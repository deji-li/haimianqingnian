import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('=== JWT AUTH GUARD DEBUG ===');
    console.log('Request URL:', request.url);
    console.log('Authorization header:', request.headers.authorization);
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);
    console.log('============================');

    if (err || !user) {
      console.error('JWT Auth failed, throwing UnauthorizedException');
      throw err || new UnauthorizedException('未授权，请先登录');
    }
    return user;
  }
}
