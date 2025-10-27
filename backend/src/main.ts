import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix(process.env.APP_PREFIX || 'api');

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
  app.enableCors({
    origin: true,
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
  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api\n`);
}

bootstrap();
