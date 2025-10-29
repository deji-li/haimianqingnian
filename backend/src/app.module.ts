import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OrderModule } from './modules/order/order.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CommissionModule } from './modules/commission/commission.module';
import { SystemModule } from './modules/system/system.module';
import { OkrModule } from './modules/okr/okr.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LogModule } from './modules/log/log.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TargetModule } from './modules/target/target.module';
import { TaskModule } from './modules/task/task.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// 导入所有实体
import { User } from './modules/user/entities/user.entity';
import { UserCampus } from './modules/user/entities/user-campus.entity';
import { Customer } from './modules/customer/entities/customer.entity';
import { CustomerFollowRecord } from './modules/customer/entities/customer-follow-record.entity';
import { CustomerLifecycle } from './modules/customer/entities/customer-lifecycle.entity';
import { SalesTarget } from './modules/target/entities/sales-target.entity';
import { Order } from './modules/order/entities/order.entity';
import { CommissionScheme } from './modules/commission/entities/commission-scheme.entity';
import { CommissionCalculation } from './modules/commission/entities/commission-calculation.entity';
import { Campus } from './modules/system/entities/campus.entity';
import { Department } from './modules/system/entities/department.entity';
import { Dictionary } from './modules/system/entities/dictionary.entity';
import { Role } from './modules/system/entities/role.entity';
import { Permission } from './modules/system/entities/permission.entity';
import { RolePermission } from './modules/system/entities/role-permission.entity';
import { Okr } from './modules/okr/entities/okr.entity';
import { KeyResult } from './modules/okr/entities/key-result.entity';
import { OperationLog } from './modules/log/entities/operation-log.entity';
import { File } from './modules/upload/entities/file.entity';
import { Notification } from './modules/notification/entities/notification.entity';

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
        entities: [
          User,
          UserCampus,
          Role,
          Permission,
          RolePermission,
          Customer,
          CustomerFollowRecord,
          CustomerLifecycle,
          Order,
          CommissionScheme,
          CommissionCalculation,
          Campus,
          Department,
          Dictionary,
          Okr,
          KeyResult,
          OperationLog,
          File,
          Notification,
          SalesTarget,
        ],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
        timezone: '+08:00',
        charset: 'utf8mb4',
        extra: {
          connectionLimit: 10,
          charset: 'utf8mb4_unicode_ci',
        },
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
    CommissionModule,
    SystemModule,
    OkrModule,
    DashboardModule,
    LogModule,
    UploadModule,
    NotificationModule,
    TargetModule,
    TaskModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
