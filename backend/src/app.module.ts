import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OrderModule } from './modules/order/order.module';
import { FinanceModule } from './modules/finance/finance.module';
import { OkrModule } from './modules/okr/okr.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // 环境配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // 数据库配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
        timezone: '+08:00',
        charset: 'utf8mb4',
      }),
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // 业务模块
    AuthModule,
    UserModule,
    CustomerModule,
    OrderModule,
    FinanceModule,
    OkrModule,
    DashboardModule,
  ],
})
export class AppModule {}
