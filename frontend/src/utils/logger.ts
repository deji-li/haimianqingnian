/**
 * 前端日志工具
 * 统一的日志记录，替代console.log
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private enableTimestamp: boolean = true;
  private prefix: string = '';

  /**
   * 设置日志级别
   */
  setLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.level = LogLevel[level.toUpperCase() as unknown as LogLevel;
  }

  /**
   * 设置前缀
   */
  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * 是否启用时间戳
   */
  setTimestamp(enabled: boolean) {
    this.enableTimestamp = enabled;
  }

  /**
   * 获取时间戳
   */
  private getTimestamp(): string {
    if (!this.enableTimestamp) return '';
    const now = new Date();
    return `[${now.toISOString()}]`;
  }

  /**
   * 获取前缀
   */
  private getPrefix(): string {
    return this.prefix ? `[${this.prefix}]` : '';
  }

  /**
   * 格式化日志输出
   */
  private log(level: string, message: string, ...args: any[]) {
    const timestamp = this.getTimestamp();
    const prefix = this.getPrefix();
    const formattedMessage = `${timestamp}${prefix} [${level}] ${message}`;

    switch (level) {
      case 'ERROR':
        console.error(formattedMessage, ...args);
        break;
      case 'WARN':
        console.warn(formattedMessage, ...args);
        break;
      case 'DEBUG':
        console.debug(formattedMessage, ...args);
        break;
      default:
        console.log(formattedMessage, ...args);
    }
  }

  /**
   * Debug级别日志
   */
  debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, ...args);
    }
  }

  /**
   * Info级别日志
   */
  info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, ...args);
    }
  }

  /**
   * Warn级别日志
   */
  warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, ...args);
    }
  }

  /**
   * Error级别日志
   */
  error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      this.log('ERROR', message, ...args);
    }
  }

  /**
   * 快捷方法：记录API请求
   */
  apiRequest(method: string, url: string, data?: any) {
    this.info(`API ${method} ${url}`, data);
  }

  /**
   * 快捷方法：记录API响应
   */
  apiResponse(method: string, url: string, data?: any) {
    this.info(`API ${method} ${url} - Success`, data);
  }

  /**
   * 快捷方法：记录API错误
   */
  apiError(method: string, url: string, error: any) {
    this.error(`API ${method} ${url} - Error`, error);
  }

  /**
   * 快捷方法：记录性能
   */
  performance(operation: string, duration: number) {
    this.info(`Performance: ${operation} took ${duration}ms`);
  }
}

// 创建默认logger实例
const logger = new Logger();

// 根据环境设置日志级别
if (import.meta.env.MODE === 'production') {
  logger.setLevel('info');
} else {
  logger.setLevel('debug');
}

export default logger;

/**
 * 为特定模块创建logger
 */
export function createLogger(prefix: string): Logger {
  const moduleLogger = new Logger();
  moduleLogger.setPrefix(prefix);
  return moduleLogger;
}
