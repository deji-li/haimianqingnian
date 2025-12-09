import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiApiKey } from '@/modules/ai-config/entities/ai-api-key.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomerBaiduOcrService {
  private readonly logger = new Logger(CustomerBaiduOcrService.name);
  private accessToken: string = '';
  private tokenExpireTime: number = 0;

  constructor(
    @InjectRepository(AiApiKey)
    private readonly aiApiKeyRepository: Repository<AiApiKey>,
  ) {}

  /**
   * 获取百度访问令牌
   */
  private async getAccessToken(): Promise<string> {
    // 检查token是否有效
    if (this.accessToken && this.tokenExpireTime > Date.now()) {
      return this.accessToken;
    }

    // 获取百度OCR配置
    const config = await this.getApiConfig();
    if (!config) {
      throw new Error('百度OCR配置未找到或未启用');
    }

    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.secretKey}`;

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`获取百度访问令牌失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`获取百度访问令牌失败: ${data.error_description || data.error}`);
      }

      this.accessToken = data.access_token;
      // 提前5分钟过期
      this.tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;

      this.logger.log('百度访问令牌获取成功');
      return this.accessToken;
    } catch (error) {
      this.logger.error('获取百度访问令牌失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取百度OCR API配置
   */
  private async getApiConfig(): Promise<{ apiKey: string; secretKey: string; appId: string } | null> {
    try {
      const config = await this.aiApiKeyRepository.findOne({
        where: {
          provider: 'baidu_ocr',
          isActive: true,
        },
      });

      if (!config) {
        this.logger.warn('未找到启用的百度OCR配置');
        return null;
      }

      return {
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        appId: config.appId,
      };
    } catch (error) {
      this.logger.error('获取百度OCR配置失败:', error.message);
      return null;
    }
  }

  /**
   * 图片文件转Base64
   */
  private async imageToBase64(imagePath: string): Promise<string> {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      this.logger.error(`读取图片失败: ${imagePath}`, error.message);
      throw new Error(`读取图片失败: ${imagePath}`);
    }
  }

  /**
   * 百度高精度OCR识别（带位置信息）
   */
  private async recognizeTextWithPosition(imagePath: string): Promise<{
    text: string;
    wordsResult: any[];
    positionInfo: Array<{
      text: string;
      position: { left: number; top: number; width: number; height: number };
      confidence?: number;
    }>;
  }> {
    const accessToken = await this.getAccessToken();
    const base64Image = await this.imageToBase64(imagePath);

    // 使用高精度OCR，开启位置信息
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`;

    const requestData = {
      image: base64Image,
      detect_direction: 'true',
      language_type: 'CHN_ENG',
      detect_risk: 'false',
      vertexes_location: 'true', // 开启位置信息
      probability: 'true', // 开启置信度
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(requestData as any).toString(),
      });

      if (!response.ok) {
        throw new Error(`百度OCR请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error_code) {
        throw new Error(`百度OCR识别失败: ${result.error_msg} (${result.error_code})`);
      }

      // 提取文本内容和位置信息
      const fullText = result.words_result?.map((item: any) => item.words).join('\n') || '';

      const positionInfo = result.words_result?.map((item: any) => ({
        text: item.words,
        position: {
          left: item.location?.left || 0,
          top: item.location?.top || 0,
          width: item.location?.width || 0,
          height: item.location?.height || 0,
        },
        confidence: item.probability?.average || 0,
      })) || [];

      return {
        text: fullText,
        wordsResult: result.words_result || [],
        positionInfo,
      };
    } catch (error) {
      this.logger.error('百度OCR识别失败:', error.message);
      throw error;
    }
  }

  /**
   * 从单个图片提取文本（与原豆包OCR接口保持一致）
   */
  async extractTextFromImage(imagePath: string): Promise<string> {
    this.logger.log(`开始使用百度高精度OCR识别图片: ${imagePath}`);

    try {
      const result = await this.recognizeTextWithPosition(imagePath);

      // 记录识别结果
      this.logger.log(`百度OCR识别完成，识别到 ${result.positionInfo.length} 个文本区域，总文本长度: ${result.text.length}`);

      // 如果有位置信息，记录一些统计信息
      if (result.positionInfo.length > 0) {
        const avgConfidence = result.positionInfo.reduce((sum, item) => sum + (item.confidence || 0), 0) / result.positionInfo.length;
        this.logger.log(`平均置信度: ${(avgConfidence * 100).toFixed(2)}%`);
      }

      return result.text;
    } catch (error) {
      this.logger.error(`图片OCR识别失败: ${imagePath}`, error.message);
      throw error;
    }
  }

  /**
   * 从多个图片提取文本（与原豆包OCR接口保持一致）
   */
  async extractTextFromImages(imagePaths: string[]): Promise<string> {
    this.logger.log(`开始使用百度高精度OCR识别 ${imagePaths.length} 张图片`);

    try {
      const allTexts: string[] = [];

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        this.logger.log(`正在处理第 ${i + 1}/${imagePaths.length} 张图片: ${imagePath}`);

        try {
          const text = await this.extractTextFromImage(imagePath);
          if (text.trim()) {
            allTexts.push(`[图片${i + 1}]`);
            allTexts.push(text);
          }
        } catch (error) {
          this.logger.error(`第 ${i + 1} 张图片识别失败: ${imagePath}`, error.message);
          // 继续处理其他图片，不中断整个流程
          allTexts.push(`[图片${i + 1}]`);
          allTexts.push('(图片识别失败)');
        }
      }

      const finalText = allTexts.join('\n\n');
      this.logger.log(`所有图片识别完成，总文本长度: ${finalText.length}`);

      return finalText;
    } catch (error) {
      this.logger.error('批量图片OCR识别失败:', error.message);
      throw error;
    }
  }

  /**
   * 验证百度OCR配置
   */
  async validateConfig(): Promise<{ valid: boolean; message: string }> {
    try {
      const config = await this.getApiConfig();

      if (!config) {
        return {
          valid: false,
          message: '百度OCR配置未找到或未启用',
        };
      }

      if (!config.apiKey || !config.secretKey) {
        return {
          valid: false,
          message: '百度OCR配置不完整，缺少API Key或Secret Key',
        };
      }

      // 尝试获取访问令牌以验证配置
      await this.getAccessToken();

      return {
        valid: true,
        message: '百度OCR配置验证成功',
      };
    } catch (error) {
      return {
        valid: false,
        message: `百度OCR配置验证失败: ${error.message}`,
      };
    }
  }
}