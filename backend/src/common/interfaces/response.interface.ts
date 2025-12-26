/**
 * 统一API响应接口
 */

/**
 * 成功响应
 */
export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 错误响应
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  timestamp: string;
}

/**
 * 响应构建器
 */
export class ResponseBuilder {
  /**
   * 构建成功响应
   */
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 构建分页响应
   */
  static paginated<T>(
    items: T[],
    page: number,
    pageSize: number,
    total: number,
    message?: string,
  ): PaginatedResponse<T> {
    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 构建错误响应
   */
  static error(code: string, message: string, details?: any): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 常用错误代码
 */
export enum ErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN_ERROR = '1000',
  VALIDATION_ERROR = '1001',
  UNAUTHORIZED = '1002',
  FORBIDDEN = '1003',
  NOT_FOUND = '1004',
  CONFLICT = '1005',
  INTERNAL_ERROR = '1006',

  // 业务错误 (2xxx)
  BUSINESS_ERROR = '2000',
  RESOURCE_NOT_FOUND = '2001',
  RESOURCE_ALREADY_EXISTS = '2002',
  INVALID_OPERATION = '2003',

  // 外部服务错误 (3xxx)
  EXTERNAL_SERVICE_ERROR = '3000',
  AI_SERVICE_ERROR = '3001',
  DATABASE_ERROR = '3002',
}
