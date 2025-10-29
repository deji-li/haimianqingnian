import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OperationLog } from './entities/operation-log.entity';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { LogInterceptor } from './interceptors/log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  controllers: [LogController],
  providers: [
    LogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
  ],
  exports: [LogService],
})
export class LogModule {}
