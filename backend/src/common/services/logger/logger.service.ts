import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 统一日志服务
 * 替代console.log，提供结构化日志记录
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context?: string;
  private logFilePath = path.join(process.cwd(), 'logs', 'app.log');

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * 设置日志上下文
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * 普通日志
   */
  log(message: any, context?: string) {
    this.printMessage(message, 'LOG', context);
  }

  /**
   * 错误日志
   */
  error(message: any, trace?: string, context?: string) {
    this.printMessage(message, 'ERROR', context);
    if (trace) {
      this.printMessage(trace, 'ERROR', context);
    }
  }

  /**
   * 警告日志
   */
  warn(message: any, context?: string) {
    this.printMessage(message, 'WARN', context);
  }

  /**
   * 调试日志 (仅开发环境)
   */
  debug(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage(message, 'DEBUG', context);
    }
  }

  /**
   * 详细���志 (仅开发环境)
   */
  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage(message, 'VERBOSE', context);
    }
  }

  /**
   * 打印日志消息
   */
  private printMessage(message: any, level: string, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';

    const logMessage = {
      timestamp,
      level,
      context: ctx,
      message: typeof message === 'object' ? JSON.stringify(message) : message,
    };

    // 控制台输出 (带颜色)
    this.colorizeLog(logMessage);

    // 写入文件 (生产环境)
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(logMessage);
    }
  }

  /**
   * 控制台彩色输出
   */
  private colorizeLog(logMessage: any) {
    const { timestamp, level, context, message } = logMessage;

    const colors = {
      LOG: '\x1b[32m',     // 绿色
      ERROR: '\x1b[31m',   // 红色
      WARN: '\x1b[33m',    // 黄色
      DEBUG: '\x1b[36m',   // 青色
      VERBOSE: '\x1b[35m', // 紫色
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    console.log(`${color}[${timestamp}] [${level}] [${context}]${reset} ${message}`);
  }

  /**
   * 写入日志文件
   */
  private writeToFile(logMessage: any) {
    try {
      const logsDir = path.dirname(this.logFilePath);

      // 确保日志目录存在
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const logLine = JSON.stringify(logMessage) + '\n';
      fs.appendFileSync(this.logFilePath, logLine);
    } catch (error) {
      console.error('写入日志文件失败:', error);
    }
  }

  /**
   * 快捷方法：记录API请求
   */
  logRequest(method: string, url: string, data?: any) {
    this.log(`${method} ${url}`, 'API');
    if (data) {
      this.debug(`Request: ${JSON.stringify(data)}`);
    }
  }

  /**
   * 快捷方法：记录API响应
   */
  logResponse(method: string, url: string, statusCode: number, data?: any) {
    this.log(`${method} ${url} - ${statusCode}`, 'API');
    if (data) {
      this.debug(`Response: ${JSON.stringify(data)}`);
    }
  }

  /**
   * 快捷方法：记录错误
   */
  logError(error: Error, context?: string) {
    this.error(error.message, error.stack, context);
  }

  /**
   * 快捷方法：记录业务操作
   */
  logOperation(operation: string, details?: any) {
    this.log(operation, 'Operation');
    if (details) {
      this.debug(JSON.stringify(details));
    }
  }
}

/**
 * 日志服务装饰器
 * 用于类中自动注入logger
 */
export function LoggerContext(context: string) {
  return function (target: any, propertyKey: string) {
    // 可以在这里添加额外的逻辑
  };
}
