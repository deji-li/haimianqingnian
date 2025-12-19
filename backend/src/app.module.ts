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
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LogModule } from './modules/log/log.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TargetModule } from './modules/target/target.module';
import { TaskModule } from './modules/task/task.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { OperationModule } from './modules/operation/operation.module';
// import { AiChatModule } from './modules/ai-chat/ai-chat.module';
// import { AiTagsModule } from './modules/ai-tags/ai-tags.module';
import { EnterpriseKnowledgeModule } from './modules/enterprise-knowledge/enterprise-knowledge.module';
import { AiToolsModule } from './modules/ai-tools/ai-tools.module';
import { StatsModule } from './modules/stats/stats.module';
import { AiConfigModule } from './modules/ai-config/ai-config.module';
import { BusinessConfigModule } from './modules/business-config/business-config.module';
import { OrderSyncModule } from './modules/order-sync/order-sync.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { AiMarketingModule } from './modules/ai-marketing/ai-marketing.module';
import { AutomationModule } from './modules/automation/automation.module';
import { AiQualityModule } from './modules/ai-quality/ai-quality.module';
// import { BaiduOcrModule } from './modules/ai-tools/baidu-ocr.module';
import { WeWorkBasicModule } from './modules/wework/wework-basic.module';
import { AiScriptAssistantModule } from './modules/ai-script-assistant/ai-script-assistant.module';

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
import { OperationLog } from './modules/log/entities/operation-log.entity';
import { File } from './modules/upload/entities/file.entity';
import { Notification } from './modules/notification/entities/notification.entity';
import { OperationAccount } from './modules/operation/entities/operation-account.entity';
import { OperationDailyRecord } from './modules/operation/entities/operation-daily-record.entity';
import { OperationCommissionRecord } from './modules/operation/entities/operation-commission-record.entity';
import { OperationCustomerConversion } from './modules/operation/entities/operation-customer-conversion.entity';
import { OperationNotification } from './modules/operation/entities/operation-notification.entity';
import { AiChatRecord } from './modules/ai-chat/entities/ai-chat-record.entity';
import { AiCustomerTag } from './modules/ai-tags/entities/ai-customer-tag.entity';
import { AiFieldMappingConfig } from './modules/ai-config/entities/ai-field-mapping-config.entity';
import {
  EnterpriseKnowledgeBase,
  KnowledgeFeedback,
  KnowledgePendingReview,
  EnterpriseBasicInfo,
  IndustryQuestionLibrary,
  KnowledgeUsageLog,
} from './modules/enterprise-knowledge/entities/index';
import { AiScript, AiRiskAlert, AiTrainingRecord, AiReport } from './modules/ai-tools/entities/index';
import { AiPromptConfig } from './modules/ai-config/entities/ai-prompt-config.entity';
import { AiApiKey } from './modules/ai-config/entities/ai-api-key.entity';
import { AiPromptVariable } from './modules/ai-config/entities/ai-prompt-variable.entity';
import { BusinessConfig } from './modules/business-config/entities/business-config.entity';
import { OrderSyncLog } from './modules/order-sync/entities/order-sync-log.entity';
import { Teacher } from './modules/teacher/entities/teacher.entity';
import { TeacherCampus } from './modules/teacher/entities/teacher-campus.entity';
import { AiMarketingScenario } from './modules/ai-marketing/entities/ai-marketing-scenario.entity';
import { AiMarketingContent } from './modules/ai-marketing/entities/ai-marketing-content.entity';
import { AiMarketingHistory } from './modules/ai-marketing/entities/ai-marketing-history.entity';
import { AiMarketingFeedback } from './modules/ai-marketing/entities/ai-marketing-feedback.entity';
import { AiCustomerInsights } from './modules/ai-marketing/entities/ai-customer-insights.entity';
import { AiStaffQualityRecord } from './modules/ai-marketing/entities/ai-staff-quality-record.entity';
import { AiSopRule } from './modules/ai-marketing/entities/ai-sop-rule.entity';
import { AiViolationRule } from './modules/ai-marketing/entities/ai-violation-rule.entity';
import { AutomationRule } from './modules/automation/entities/automation-rule.entity';
import { AutomationLog } from './modules/automation/entities/automation-log.entity';
import {
  AiScriptConversation,
  AiScriptMessage,
  AiScriptScenario,
  AiScriptTechnique,
  AiScriptFeedback,
} from './modules/ai-script-assistant/entities/index';

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
          OperationLog,
          File,
          Notification,
          SalesTarget,
          OperationAccount,
          OperationDailyRecord,
          OperationCommissionRecord,
          OperationCustomerConversion,
          OperationNotification,
          AiChatRecord,
          AiCustomerTag,
          EnterpriseKnowledgeBase,
          KnowledgeFeedback,
          KnowledgePendingReview,
          EnterpriseBasicInfo,
          IndustryQuestionLibrary,
          KnowledgeUsageLog,
          AiScript,
          AiRiskAlert,
          AiTrainingRecord,
          AiReport,
          AiPromptConfig,
          AiApiKey,
          AiPromptVariable,
          AiFieldMappingConfig,
          BusinessConfig,
          OrderSyncLog,
          Teacher,
          TeacherCampus,
          AiMarketingScenario,
          AiMarketingContent,
          AiMarketingHistory,
          AiMarketingFeedback,
          AiCustomerInsights,
          AiStaffQualityRecord,
          AiSopRule,
          AiViolationRule,
          AutomationRule,
          AutomationLog,
          AiScriptConversation,
          AiScriptMessage,
          AiScriptScenario,
          AiScriptTechnique,
          AiScriptFeedback,
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
    DashboardModule,
    LogModule,
    UploadModule,
    NotificationModule,
    TargetModule,
    TaskModule,
    AnalyticsModule,
    OperationModule,
    // AiChatModule,
    // AiTagsModule,
    EnterpriseKnowledgeModule,
    AiToolsModule,
    StatsModule,
    AiConfigModule,
    BusinessConfigModule,
    OrderSyncModule,
    TeacherModule,
    RankingModule,
    AiMarketingModule,
    AutomationModule,
    AiQualityModule,
    // BaiduOcrModule,
    WeWorkBasicModule,
    AiScriptAssistantModule,
  ],
})
export class AppModule {}
