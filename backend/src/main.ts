import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { EmptyStringToUndefinedPipe } from './common/pipes/empty-string-to-undefined.pipe';
import { DataSource } from 'typeorm';
import { seedDatabase } from './database/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 初始化数据库种子数据
  try {
    const dataSource = app.get(DataSource);
    await seedDatabase(dataSource);
  } catch (error) {
    logger.error('Failed to seed database:', error);
  }

  // 全局前缀
  app.setGlobalPrefix(process.env.APP_PREFIX || 'api');

  // 全局管道：空字符串转undefined
  app.useGlobalPipes(new EmptyStringToUndefinedPipe());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 启用 CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost', 'http://localhost:80', 'http://localhost:5173'];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? allowedOrigins
      : true,
    credentials: true,
  });

  // Swagger 文档配置
  if (process.env.SWAGGER_ENABLE === 'true') {
    const config = new DocumentBuilder()
      .setTitle(process.env.SWAGGER_TITLE || '教育培训CRM API')
      .setDescription(
        process.env.SWAGGER_DESCRIPTION || '教育培训CRM系统API文档',
      )
      .setVersion(process.env.SWAGGER_VERSION || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  if (process.env.SWAGGER_ENABLE === 'true') {
    logger.log(`📚 API Documentation: http://localhost:${port}/api`);
  }
}

bootstrap();
