import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BaiduOcrService } from './baidu-ocr.service';
import { BaiduOcrController } from './baidu-ocr.controller';
import { AiApiKey } from '../ai-config/entities/ai-api-key.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiApiKey]),
    HttpModule,
  ],
  controllers: [BaiduOcrController],
  providers: [BaiduOcrService],
  exports: [BaiduOcrService],
})
export class BaiduOcrModule {}