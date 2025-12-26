import { Module, Global } from '@nestjs/common';
import { AppLogger } from './logger.service';

/**
 * 日志模块
 * 全局模块，所有模块都可以使用
 */
@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
