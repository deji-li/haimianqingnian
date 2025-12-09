import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiApiKey } from '../ai-config/entities/ai-api-key.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface BaiduOcrOptions {
  detectDirection?: boolean; // 是否检测图像朝向
  languageType?: string; // 识别语言类型，默认为'CHN_ENG'中英文混合
  detectRisk?: string; // 是否开启风险类型检测
  vertexesLocation?: boolean; // 是否返回文字外接多边形顶点位置
  probability?: boolean; // 是否返回识别结果中每一行的置信度
}

export interface BaiduOcrResult {
  logId: number;
  wordsResultCount: number;
  wordsResult: {
    words: string;
    location?: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
    probability?: {
      average: number;
      variance: number;
      min: number;
    };
  }[];
  error?: {
    code: string;
    message: string;
  };
}

@Injectable()
export class BaiduOcrService {
  private readonly logger = new Logger(BaiduOcrService.name);
  private accessToken: string;
  private tokenExpiry: number = 0;

  constructor(
    @InjectRepository(AiApiKey)
    private readonly aiApiKeyRepository: Repository<AiApiKey>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 获取百度API访问令牌
   */
  private async getAccessToken(): Promise<string> {
    // 检查当前令牌是否仍然有效
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const config = await this.aiApiKeyRepository.findOne({
      where: { provider: 'baidu_ocr', isActive: true },
    });

    if (!config) {
      throw new HttpException(
        '百度OCR配置未找到或未启用',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!config.apiKey || !config.secretKey) {
      throw new HttpException(
        '百度OCR API Key或Secret Key未配置',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const url = 'https://aip.baidubce.com/oauth/2.0/token';
      const params = {
        grant_type: 'client_credentials',
        client_id: config.apiKey,
        client_secret: config.secretKey,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, null, { params }),
      );

      this.accessToken = response.data.access_token;
      // 设置过期时间，提前5分钟刷新
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      this.logger.log('百度API访问令牌获取成功');
      return this.accessToken;
    } catch (error) {
      this.logger.error('获取百度API访问令牌失败:', error.response?.data || error.message);
      throw new HttpException(
        '获取百度API访问令牌失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 将图片文件转换为Base64
   */
  private async imageToBase64(filePath: string): Promise<string> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }

      // 读取文件并转换为Base64
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString('base64');

      return base64Image;
    } catch (error) {
      this.logger.error('图片文件转换Base64失败:', error.message);
      throw new HttpException(
        '图片文件处理失败',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 百度通用文字识别（高精度版）
   */
  async recognizeText(
    imagePath: string,
    options: BaiduOcrOptions = {},
  ): Promise<BaiduOcrResult> {
    try {
      const accessToken = await this.getAccessToken();

      // 转换图片为Base64
      const base64Image = await this.imageToBase64(imagePath);

      // 构建请求URL
      const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`;

      // 构建请求参数
      const requestData = {
        image: base64Image,
        detect_direction: options.detectDirection || false,
        language_type: options.languageType || 'CHN_ENG',
        detect_risk: options.detectRisk || 'false',
        vertexes_location: options.vertexesLocation || false,
        probability: options.probability || false,
      };

      this.logger.log(`开始OCR识别: ${path.basename(imagePath)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, requestData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }),
      );

      const result: BaiduOcrResult = {
        logId: response.data.log_id,
        wordsResultCount: response.data.words_result_num || 0,
        wordsResult: response.data.words_result || [],
      };

      this.logger.log(
        `OCR识别完成，识别到 ${result.wordsResultCount} 个文字区域`,
      );

      return result;
    } catch (error) {
      this.logger.error('OCR识别失败:', error.response?.data || error.message);

      if (error.response?.data) {
        const errorData = error.response.data;
        return {
          logId: 0,
          wordsResultCount: 0,
          wordsResult: [],
          error: {
            code: errorData.error_code?.toString() || 'UNKNOWN',
            message: errorData.error_msg || error.message,
          },
        };
      }

      throw new HttpException(
        'OCR识别服务异常',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 百度通用文字识别（标准版）
   */
  async recognizeTextBasic(
    imagePath: string,
    options: BaiduOcrOptions = {},
  ): Promise<BaiduOcrResult> {
    try {
      const accessToken = await this.getAccessToken();

      // 转换图片为Base64
      const base64Image = await this.imageToBase64(imagePath);

      // 构建请求URL - 使用标准版API
      const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`;

      // 构建请求参数
      const requestData = {
        image: base64Image,
        detect_direction: options.detectDirection || false,
        language_type: options.languageType || 'CHN_ENG',
        detect_risk: options.detectRisk || 'false',
        vertexes_location: options.vertexesLocation || false,
        probability: options.probability || false,
      };

      this.logger.log(`开始OCR识别（标准版）: ${path.basename(imagePath)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, requestData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }),
      );

      const result: BaiduOcrResult = {
        logId: response.data.log_id,
        wordsResultCount: response.data.words_result_num || 0,
        wordsResult: response.data.words_result || [],
      };

      this.logger.log(
        `OCR识别完成（标准版），识别到 ${result.wordsResultCount} 个文字区域`,
      );

      return result;
    } catch (error) {
      this.logger.error('OCR识别失败（标准版）:', error.response?.data || error.message);

      if (error.response?.data) {
        const errorData = error.response.data;
        return {
          logId: 0,
          wordsResultCount: 0,
          wordsResult: [],
          error: {
            code: errorData.error_code?.toString() || 'UNKNOWN',
            message: errorData.error_msg || error.message,
          },
        };
      }

      throw new HttpException(
        'OCR识别服务异常',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 提取识别结果的纯文本
   */
  extractText(result: BaiduOcrResult): string {
    if (result.error) {
      throw new Error(`OCR识别错误: ${result.error.message} (${result.error.code})`);
    }

    return result.wordsResult
      .map(item => item.words)
      .join('\n')
      .trim();
  }

  /**
   * 验证百度OCR配置
   */
  async validateConfig(): Promise<{ valid: boolean; message: string }> {
    try {
      const config = await this.aiApiKeyRepository.findOne({
        where: { provider: 'baidu_ocr', isActive: true },
      });

      if (!config) {
        return { valid: false, message: '百度OCR配置未找到或未启用' };
      }

      if (!config.apiKey || !config.secretKey) {
        return { valid: false, message: 'API Key或Secret Key未配置' };
      }

      if (!config.appId) {
        return { valid: false, message: 'App ID未配置' };
      }

      // 尝试获取访问令牌来验证配置
      await this.getAccessToken();

      return { valid: true, message: '百度OCR配置验证成功' };
    } catch (error) {
      return {
        valid: false,
        message: `配置验证失败: ${error.message}`
      };
    }
  }
}