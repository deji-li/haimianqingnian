const fs = require('fs');
const content = `import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
const Jimp = require('jimp');
import { AiConfigService } from '../../../modules/ai-config/ai-config.service';
import { AiApiKeyService } from '../../../modules/ai-config/ai-api-key.service';

@Injectable()
export class BaiduOcrService {
  private readonly logger = new Logger(BaiduOcrService.name);
  private readonly imageDownloadTimeout: number;
  private cachedConfig: { apiKey: string; secretKey: string; accessToken: string; tokenExpireTime: number; lastUpdate: number; } | null = null;
  private readonly cacheTimeout = 60000;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AiConfigService)) private readonly aiConfigService: AiConfigService,
    @Inject(forwardRef(() => AiApiKeyService)) private readonly aiApiKeyService: AiApiKeyService,
  ) { this.imageDownloadTimeout = this.configService.get<number>('IMAGE_DOWNLOAD_TIMEOUT', 30000); }

  private async getApiConfig(): Promise<{ apiKey: string; secretKey: string }> {
    if (this.cachedConfig && Date.now() - this.cachedConfig.lastUpdate < this.cacheTimeout) {
      return { apiKey: this.cachedConfig.apiKey, secretKey: this.cachedConfig.secretKey };
    }
    try {
      const dbConfig = await this.aiApiKeyService.findByProvider('baidu');
      if (dbConfig && dbConfig.apiKey && dbConfig.secretKey) {
        this.logger.log('Using Baidu OCR config from database');
        const accessToken = await this.getAccessToken(dbConfig.apiKey, dbConfig.secretKey);
        this.cachedConfig = { apiKey: dbConfig.apiKey, secretKey: dbConfig.secretKey, accessToken, tokenExpireTime: Date.now() + 30 * 24 * 60 * 60 * 1000, lastUpdate: Date.now() };
        return { apiKey: dbConfig.apiKey, secretKey: dbConfig.secretKey };
      }
    } catch (error) { this.logger.warn('Failed to read Baidu OCR config from database: ' + error.message); }
    const apiKey = this.configService.get<string>('BAIDU_OCR_API_KEY', '');
    const secretKey = this.configService.get<string>('BAIDU_OCR_SECRET_KEY', '');
    if (!apiKey || apiKey.includes('your_')) { throw new Error('Baidu OCR API key not configured'); }
    this.logger.log('Using Baidu OCR config from environment');
    const accessToken = await this.getAccessToken(apiKey, secretKey);
    this.cachedConfig = { apiKey, secretKey, accessToken, tokenExpireTime: Date.now() + 30 * 24 * 60 * 60 * 1000, lastUpdate: Date.now() };
    return { apiKey, secretKey };
  }

  private async getAccessToken(apiKey: string, secretKey: string): Promise<string> {
    try {
      if (this.cachedConfig && this.cachedConfig.accessToken && Date.now() < this.cachedConfig.tokenExpireTime) { return this.cachedConfig.accessToken; }
      this.logger.log('Getting Baidu OCR Access Token');
      const response = await axios.post('https://aip.baidubce.com/oauth/2.0/token', null, { params: { grant_type: 'client_credentials', client_id: apiKey, client_secret: secretKey } });
      const accessToken = response.data.access_token;
      this.logger.log('Baidu OCR Access Token obtained');
      return accessToken;
    } catch (error) { this.logger.error('Failed to get Baidu OCR Access Token: ' + error.message); throw new Error('Failed to get Baidu OCR Access Token: ' + error.message); }
  }

  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      this.logger.log('Starting Baidu OCR: ' + imagePath);
      await this.getApiConfig();
      if (!this.cachedConfig || !this.cachedConfig.accessToken) { throw new Error('Baidu OCR Access Token not obtained'); }
      const imageBase64 = await this.imageToBase64(imagePath);
      const response = await axios.post(
        'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token=' + this.cachedConfig.accessToken,
        'image=' + encodeURIComponent(imageBase64) + '&recognize_granularity=small',
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: this.configService.get<number>('AI_TIMEOUT', 30000) }
      );
      if (response.data.error_code) { throw new Error('Baidu OCR failed: ' + response.data.error_msg); }
      const words = response.data.words_result || [];
      if (words.length > 0) { this.logger.log('Baidu OCR response sample: ' + JSON.stringify(words.slice(0, 3))); }
      const extractedText = this.formatWeChatDialogue(words);
      this.logger.log('Baidu OCR success, text length: ' + extractedText.length);
      return extractedText;
    } catch (error) {
      if (error.response) { this.logger.error('Baidu OCR failed: ' + error.message + ', status: ' + error.response.status); throw new Error('Baidu OCR failed: ' + error.message + ', details: ' + JSON.stringify(error.response.data)); }
      else { this.logger.error('Baidu OCR failed: ' + error.message, error.stack); throw new Error('Baidu OCR failed: ' + error.message); }
    }
  }

  async extractTextFromImages(imagePaths: string[]): Promise<string> {
    try {
      this.logger.log('Starting batch Baidu OCR, image count: ' + imagePaths.length);
      const results: string[] = [];
      for (const imagePath of imagePaths) { const text = await this.extractTextFromImage(imagePath); results.push(text); await this.sleep(100); }
      const combinedText = results.map((text, index) => '[Screenshot ' + (index + 1) + ']\\n' + text).join('\\n\\n---\\n\\n');
      this.logger.log('Batch Baidu OCR complete, total length: ' + combinedText.length);
      return combinedText;
    } catch (error) { this.logger.error('Batch Baidu OCR failed: ' + error.message, error.stack); throw new Error('Batch Baidu OCR failed: ' + error.message); }
  }

  private async imageToBase64(imagePath: string): Promise<string> {
    try {
      let imageBuffer: Buffer;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        this.logger.log('Downloading image from URL: ' + imagePath);
        const response = await axios.get(imagePath, { responseType: 'arraybuffer', timeout: this.imageDownloadTimeout, maxContentLength: 10 * 1024 * 1024 });
        imageBuffer = Buffer.from(response.data, 'binary');
      } else if (fs.existsSync(imagePath)) { imageBuffer = fs.readFileSync(imagePath); }
      else { throw new Error('Image path does not exist: ' + imagePath); }
      const enhancedBuffer = await this.enhanceImageForOcr(imageBuffer);
      return enhancedBuffer.toString('base64');
    } catch (error) { this.logger.error('Image to base64 failed: ' + imagePath + ', error: ' + error.message); throw new Error('Image read failed: ' + error.message); }
  }

  private sleep(ms: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, ms)); }

  private async enhanceImageForOcr(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const image = await Jimp.read(imageBuffer);
      const width = image.getWidth(); const height = image.getHeight();
      if (width < 1080) { const scale = 1080 / width; image.scale(scale, Jimp.RESIZE_BICUBIC); }
      image.contrast(0.1); image.brightness(0.05);
      image.convolute([[0, -0.5, 0], [-0.5, 3, -0.5], [0, -0.5, 0]]);
      const enhancedBuffer = await image.quality(95).getBufferAsync(Jimp.MIME_JPEG);
      const newWidth = image.getWidth(); const newHeight = image.getHeight();
      this.logger.log('Image preprocessing done: ' + width + 'x' + height + ' -> ' + newWidth + 'x' + newHeight);
      return enhancedBuffer;
    } catch (error) { this.logger.warn('Image preprocessing failed, using original: ' + error.message); return imageBuffer; }
  }

  private formatWeChatDialogue(words: any[]): string {
    if (!words || words.length === 0) return '';
    const leftPositions = words.filter(item => item.location && item.location.left).map(item => item.location.left);
    if (leftPositions.length === 0) { return words.map(item => item.words).join('\\n'); }
    const sortedPositions = [...leftPositions].sort((a, b) => a - b);
    const medianLeft = sortedPositions[Math.floor(sortedPositions.length / 2)];
    const formattedLines: string[] = [];
    let currentSpeaker: 'customer' | 'sales' | null = null;
    let currentNickname: string | null = null;
    for (const item of words) {
      const text = item.words.trim();
      if (!text) continue;
      const left = item.location?.left || 0;
      const isCustomer = left < medianLeft;
      const isPossibleNickname = text.length <= 20 && !text.includes(':');
      if (isPossibleNickname && isCustomer && currentSpeaker !== 'customer') { currentNickname = text; currentSpeaker = 'customer'; formattedLines.push('\\n[Customer' + (currentNickname ? ' - ' + currentNickname : '') + ']:'); }
      else if (isCustomer) { if (currentSpeaker !== 'customer') { currentSpeaker = 'customer'; formattedLines.push('\\n[Customer' + (currentNickname ? ' - ' + currentNickname : '') + ']:'); } formattedLines.push(text); }
      else { if (currentSpeaker !== 'sales') { currentSpeaker = 'sales'; formattedLines.push('\\n[Sales]:'); } formattedLines.push(text); }
    }
    return formattedLines.join('\\n').trim();
  }

  async testConnection(): Promise<boolean> {
    try { await this.getApiConfig(); if (!this.cachedConfig || !this.cachedConfig.accessToken) return false; this.logger.log('Baidu OCR connection test successful'); return true; }
    catch (error) { this.logger.error('Baidu OCR connection test failed: ' + error.message); return false; }
  }
}
`;
fs.writeFileSync('D:/CC/1.1/backend/src/common/services/ai/baidu-ocr.service.ts', content, 'utf8');
console.log('File written successfully');
