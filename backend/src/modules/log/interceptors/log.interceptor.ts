import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { LogService } from '../log.service';
import { LOG_METADATA_KEY, LogMetadata } from '../decorators/log.decorator';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(
    private readonly logService: LogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取 @Log 装饰器的元数据
    const logMetadata = this.reflector.get<LogMetadata>(
      LOG_METADATA_KEY,
      context.getHandler(),
    );

    // 如果没有 @Log 装饰器，直接放行
    if (!logMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 准备日志数据
    const logData = {
      userId: user?.id,
      username: user?.username,
      module: logMetadata.module,
      action: logMetadata.action,
      detail: JSON.stringify({
        path: request.path,
        method: request.method,
        params: request.params,
        query: request.query,
        body: this.sanitizeBody(request.body),
      }),
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'] || '',
      status: 1, // 成功
    };

    return next.handle().pipe(
      tap(() => {
        // 操作成功，记录日志
        this.logService.create(logData).catch(err => {
          console.error('记录操作日志失败:', err);
        });
      }),
      catchError(error => {
        // 操作失败，记录错误日志
        this.logService
          .create({
            ...logData,
            status: 0, // 失败
            errorMsg: error.message || '操作失败',
          })
          .catch(err => {
            console.error('记录错误日志失败:', err);
          });

        return throwError(() => error);
      }),
    );
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      ''
    );
  }

  /**
   * 清理敏感数据（如密码）
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'oldPassword', 'newPassword', 'confirmPassword'];

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}
