import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import { AiConfigService } from '../../../modules/ai-config/ai-config.service';
import { AiApiKeyService } from '../../../modules/ai-config/ai-api-key.service';

/**
 * 豆包OCR服务
 * 负责识别微信聊天截图中的文字内容
 */
@Injectable()
export class DoubaoOcrService {
  private readonly logger = new Logger(DoubaoOcrService.name);
  private readonly imageDownloadTimeout: number;

  // 缓存API密钥配置，避免每次都查数据库
  private cachedConfig: {
    apiKey: string;
    apiUrl: string;
    endpointId: string;
    lastUpdate: number;
  } | null = null;
  private readonly cacheTimeout = 60000; // 缓存1分钟

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AiConfigService))
    private readonly aiConfigService: AiConfigService,
    @Inject(forwardRef(() => AiApiKeyService))
    private readonly aiApiKeyService: AiApiKeyService,
  ) {
    this.imageDownloadTimeout = this.configService.get<number>('IMAGE_DOWNLOAD_TIMEOUT', 30000);
  }

  /**
   * 获取豆包API配置（优先从数据库，fallback到.env）
   */
  private async getApiConfig(): Promise<{ apiKey: string; apiUrl: string; endpointId: string }> {
    // 检查缓存是否有效
    if (this.cachedConfig && Date.now() - this.cachedConfig.lastUpdate < this.cacheTimeout) {
      return this.cachedConfig;
    }

    try {
      // 优先从数据库读取
      const dbConfig = await this.aiApiKeyService.findByProvider('doubao');

      if (dbConfig && dbConfig.apiKey && dbConfig.apiUrl) {
        this.logger.log('使用数据库中的豆包API配置');
        this.cachedConfig = {
          apiKey: dbConfig.apiKey,
          apiUrl: dbConfig.apiUrl,
          endpointId: dbConfig.endpointId || '',
          lastUpdate: Date.now(),
        };
        return this.cachedConfig;
      }
    } catch (error) {
      this.logger.warn(`从数据库读取豆包配置失败，fallback到环境变量: ${error.message}`);
    }

    // Fallback到环境变量
    const apiKey = this.configService.get<string>('DOUBAO_API_KEY', '');
    const apiUrl = this.configService.get<string>('DOUBAO_API_URL', '');
    const endpointId = this.configService.get<string>('DOUBAO_ENDPOINT_ID', '');

    if (!apiKey || apiKey.includes('your_')) {
      throw new Error('豆包API密钥未配置，请在系统设置中配置');
    }

    this.logger.log('使用环境变量中的豆包API配置');
    this.cachedConfig = { apiKey, apiUrl, endpointId, lastUpdate: Date.now() };
    return this.cachedConfig;
  }

  /**
   * 识别单张图片的文字
   * @param imagePath 图片路径（本地）或URL
   * @returns 识别出的文字内容
   */
  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      this.logger.log(`开始OCR识别: ${imagePath}`);

      // 获取API密钥配置
      const apiConfig = await this.getApiConfig();

      const scenarioKey = 'chat_ocr_extract';

      // 从数据库获取提示词配置
      const promptConfig = await this.aiConfigService.getPromptConfig(scenarioKey, 'doubao');

      // 系统提示词
      const systemPrompt = promptConfig?.systemPrompt || '你是一个专业的OCR文字识别助手。请提取图片中的所有文字内容，保持原有格式和顺序。';

      // 用户提示词
      let userTextPrompt = '请识别这张微信聊天截图中的所有文字内容，包括发送者、时间和消息内容。';
      if (promptConfig?.promptContent) {
        userTextPrompt = promptConfig.promptContent;
      }

      // 读取图片并转为base64
      const imageBase64 = await this.imageToBase64(imagePath);

      // 创建HTTP客户端（使用最新的API密钥）
      const httpClient = axios.create({
        timeout: this.configService.get<number>('AI_TIMEOUT', 30000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
          'x-ark-beta-vision': 'true',  // 视觉模型必需
        },
      });

      // 调用豆包视觉模型API（使用 Endpoint ID）
      const response = await httpClient.post(apiConfig.apiUrl, {
        model: promptConfig?.modelName || apiConfig.endpointId,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userTextPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: promptConfig?.temperature ?? 0.1,
        max_tokens: promptConfig?.maxTokens ?? 2000
      });

      const extractedText = response.data.choices[0].message.content;
      this.logger.log(`OCR识别成功，文字长度: ${extractedText.length}`);

      return extractedText;

    } catch (error) {
      // 记录详细的错误信息
      if (error.response) {
        this.logger.error(`OCR识别失败: ${error.message}, 状态码: ${error.response.status}, 响应数据: ${JSON.stringify(error.response.data)}`);
        throw new Error(`OCR识别失败: ${error.message}, 详情: ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`OCR识别失败: ${error.message}`, error.stack);
        throw new Error(`OCR识别失败: ${error.message}`);
      }
    }
  }

  /**
   * 批量识别多张图片
   * @param imagePaths 图片路径数组
   * @returns 合并后的文字内容
   */
  async extractTextFromImages(imagePaths: string[]): Promise<string> {
    try {
      this.logger.log(`开始批量OCR识别，图片数量: ${imagePaths.length}`);

      const results: string[] = [];

      // 串行处理，避免并发过高
      for (const imagePath of imagePaths) {
        const text = await this.extractTextFromImage(imagePath);
        results.push(text);

        // 每次请求间隔200ms，避免触发频率限制
        await this.sleep(200);
      }

      // 合并所有文字，按图片顺序
      const combinedText = results
        .map((text, index) => `【截图${index + 1}】\n${text}`)
        .join('\n\n---\n\n');

      this.logger.log(`批量OCR识别完成，总文字长度: ${combinedText.length}`);

      return combinedText;

    } catch (error) {
      this.logger.error(`批量OCR识别失败: ${error.message}`, error.stack);
      throw new Error(`批量OCR识别失败: ${error.message}`);
    }
  }

  /**
   * 将图片转为base64编码
   * @param imagePath 图片路径或URL
   * @returns base64字符串
   */
  private async imageToBase64(imagePath: string): Promise<string> {
    try {
      // 如果是URL，先下载
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        this.logger.log(`从URL下载图片: ${imagePath}`);
        const response = await axios.get(imagePath, {
          responseType: 'arraybuffer',
          timeout: this.imageDownloadTimeout,
          maxContentLength: 10 * 1024 * 1024, // 10MB
        });
        return Buffer.from(response.data, 'binary').toString('base64');
      }

      // 本地文件直接读取
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString('base64');
      }

      throw new Error(`图片路径不存在: ${imagePath}`);

    } catch (error) {
      this.logger.error(`图片转base64失败: ${imagePath}, 错误: ${error.message}`);
      throw new Error(`图片读取失败: ${error.message}`);
    }
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 测试豆包OCR连接
   */
  async testConnection(): Promise<boolean> {
    try {
      // 获取API密钥配置
      const apiConfig = await this.getApiConfig();

      // 创建HTTP客户端
      const httpClient = axios.create({
        timeout: this.configService.get<number>('AI_TIMEOUT', 30000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
        },
      });

      // 简单测试请求
      const response = await httpClient.post(apiConfig.apiUrl, {
        model: apiConfig.endpointId,
        messages: [
          { role: 'system', content: '你是一个OCR助手' },
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 10
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`豆包OCR连接测试失败: ${error.message}`);
      return false;
    }
  }
}
