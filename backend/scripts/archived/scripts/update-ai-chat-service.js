const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/modules/ai-chat/ai-chat.service.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. 添加imports
const importSection = `import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiChatRecord } from './entities/ai-chat-record.entity';
import { UploadChatDto, QueryChatRecordsDto } from './dto/upload-chat.dto';
import { DoubaoOcrService } from '../../common/services/ai/doubao-ocr.service';
import { BaiduOcrService } from '../../common/services/ai/baidu-ocr.service';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiCacheService } from '../../common/services/ai/ai-cache.service';
import { Customer } from '../customer/entities/customer.entity';
import { AiTagsService } from '../ai-tags/ai-tags.service';
import { AiToolsService } from '../ai-tools/ai-tools.service';
import { AiMarketingService } from '../ai-marketing/ai-marketing.service';
import { BusinessConfigService } from '../business-config/business-config.service';`;

content = content.replace(
  /import \{ Injectable[^}]+\} from '@nestjs\/common';[\s\S]*?import \{ AiMarketingService \} from '\.\.\/ai-marketing\/ai-marketing\.service';/,
  importSection
);

// 2. 修改constructor
const constructorSection = `  constructor(
    @InjectRepository(AiChatRecord)
    private readonly aiChatRecordRepository: Repository<AiChatRecord>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly doubaoOcrService: DoubaoOcrService,
    private readonly baiduOcrService: BaiduOcrService,
    private readonly deepseekAnalysisService: DeepseekAnalysisService,
    private readonly aiCacheService: AiCacheService,
    private readonly aiTagsService: AiTagsService,
    private readonly aiToolsService: AiToolsService,
    private readonly aiMarketingService: AiMarketingService,
    private readonly businessConfigService: BusinessConfigService,
  ) {}`;

content = content.replace(
  /constructor\([\s\S]*?\) \{\}/,
  constructorSection
);

// 3. 在uploadAndAnalyze方法后添加getOcrService方法
const getOcrServiceMethod = `
  /**
   * 根据配置获取OCR服务（豆包或百度）
   */
  private async getOcrService() {
    try {
      // 从业务配置中读取OCR提供商选择
      const ocrProvider = await this.businessConfigService.getConfig('ocr_provider');
      
      // 默认使用豆包OCR
      if (!ocrProvider || ocrProvider === 'doubao') {
        this.logger.log('使用豆包OCR服务');
        return this.doubaoOcrService;
      }
      
      if (ocrProvider === 'baidu') {
        this.logger.log('使用百度OCR服务');
        return this.baiduOcrService;
      }
      
      // 如果配置了未知的提供商，默认使用豆包
      this.logger.warn(\`未知的OCR提供商: \${ocrProvider}，使用豆包OCR\`);
      return this.doubaoOcrService;
    } catch (error) {
      this.logger.error(\`获取OCR服务配置失败: \${error.message}，使用豆包OCR\`);
      return this.doubaoOcrService;
    }
  }
`;

content = content.replace(
  /(async uploadAndAnalyze\([\s\S]*?\n  \})/,
  `$1\n${getOcrServiceMethod}`
);

// 4. 修改OCR调用（第147行附近）
content = content.replace(
  /\/\/ 调用OCR服务\s+ocrText = await this\.doubaoOcrService\.extractTextFromImages\(record\.images\);/,
  `// 调用OCR服务（根据配置动态选择）
          const ocrService = await this.getOcrService();
          ocrText = await ocrService.extractTextFromImages(record.images);`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ ai-chat.service.ts 已更新，支持OCR提供商选择');
