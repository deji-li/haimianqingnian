import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseBuilder } from '../interfaces/response.interface';

/**
 * 统一响应格式拦截器
 * 自动将Controller返回值包装为统一格式
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // 如果返回值已经是统一格式，直接返回
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 如果有分页信息，构建分页响应
        if (data && typeof data === 'object' && 'list' in data) {
          const { list, ...rest } = data;
          return ResponseBuilder.paginated(
            list || [],
            rest.page || 1,
            rest.pageSize || 20,
            rest.total || 0,
            rest.message,
          );
        }

        // 普通响应
        return ResponseBuilder.success(data);
      }),
    );
  }
}

/**
 * 成功响应装饰器
 * 用于标记Controller方法返回成功响应
 */
export function SuccessResponse(message?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // 可以在这里添加额外的逻辑
    descriptor.value.successMessage = message;
  };
}
