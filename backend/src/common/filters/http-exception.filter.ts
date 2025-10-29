import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      message =
        typeof exceptionResponse === 'object'
          ? exceptionResponse.message || exception.message
          : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
      // Log详细错误到控制台
      console.error('[ERROR] Unhandled exception:', {
        message: exception.message,
        stack: exception.stack,
        url: request.url,
        method: request.method,
      });
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
      timestamp: Date.now(),
      path: request.url,
      ...(process.env.NODE_ENV !== 'production' && stack ? { stack } : {}),
    });
  }
}
