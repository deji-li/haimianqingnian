import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import * as crypto from 'crypto';

/**
 * AI缓存服务
 * 用于缓存AI分析结果，避免重复调用API
 */
@Injectable()
export class AiCacheService {
  private readonly logger = new Logger(AiCacheService.name);
  private redisClient: RedisClientType;
  private readonly cachePrefix = 'ai_cache:';
  private readonly cacheTTL: number;

  constructor(private readonly configService: ConfigService) {
    this.cacheTTL = this.configService.get<number>('AI_CACHE_TTL', 3600); // 默认1小时
    this.initRedis();
  }

  /**
   * 初始化Redis连接
   */
  private async initRedis() {
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
      const redisDb = this.configService.get<number>('REDIS_DB', 0);

      this.redisClient = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
        },
        password: redisPassword,
        database: redisDb,
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis连接错误:', err);
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis连接成功');
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Redis初始化失败:', error);
    }
  }

  /**
   * 生成缓存key
   * @param type 缓存类型：ocr/analysis
   * @param content 内容（用于生成hash）
   */
  private generateCacheKey(type: string, content: string): string {
    const hash = crypto
      .createHash('md5')
      .update(content)
      .digest('hex');
    return `${this.cachePrefix}${type}:${hash}`;
  }

  /**
   * 获取OCR缓存
   * @param imagePath 图片路径
   */
  async getOcrCache(imagePath: string): Promise<string | null> {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        this.logger.warn('Redis未连接，跳过缓存');
        return null;
      }

      const key = this.generateCacheKey('ocr', imagePath);
      const cached = await this.redisClient.get(key);

      if (cached) {
        this.logger.log(`OCR缓存命中: ${imagePath}`);
      }

      return cached;
    } catch (error) {
      this.logger.error('获取OCR缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置OCR缓存
   * @param imagePath 图片路径
   * @param ocrText 识别的文字
   * @param ttl 过期时间（秒），默认使用配置的TTL
   */
  async setOcrCache(imagePath: string, ocrText: string, ttl?: number): Promise<void> {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        this.logger.warn('Redis未连接，跳过缓存');
        return;
      }

      const key = this.generateCacheKey('ocr', imagePath);
      await this.redisClient.setEx(key, ttl || this.cacheTTL, ocrText);
      this.logger.log(`OCR缓存已保存: ${imagePath}`);
    } catch (error) {
      this.logger.error('设置OCR缓存失败:', error);
    }
  }

  /**
   * 获取AI分析缓存
   * @param chatText 聊天文本
   */
  async getAnalysisCache(chatText: string): Promise<any | null> {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        this.logger.warn('Redis未连接，跳过缓存');
        return null;
      }

      const key = this.generateCacheKey('analysis', chatText);
      const cached = await this.redisClient.get(key);

      if (cached) {
        this.logger.log('AI分析缓存命中');
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      this.logger.error('获取AI分析缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置AI分析缓存
   * @param chatText 聊天文本
   * @param analysisResult 分析结果
   * @param ttl 过期时间（秒），默认使用配置的TTL
   */
  async setAnalysisCache(chatText: string, analysisResult: any, ttl?: number): Promise<void> {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        this.logger.warn('Redis未连接，跳过缓存');
        return;
      }

      const key = this.generateCacheKey('analysis', chatText);
      await this.redisClient.setEx(
        key,
        ttl || this.cacheTTL,
        JSON.stringify(analysisResult),
      );
      this.logger.log('AI分析缓存已保存');
    } catch (error) {
      this.logger.error('设置AI分析缓存失败:', error);
    }
  }

  /**
   * 获取话术缓存
   * @param scenario 场景标识
   * @param customerProfile 客户画像（用于生成key）
   */
  async getScriptCache(scenario: string, customerProfile: string): Promise<string | null> {
    try {
      const key = this.generateCacheKey('script', `${scenario}_${customerProfile}`);
      const cached = await this.redisClient.get(key);

      if (cached) {
        this.logger.log(`话术缓存命中: ${scenario}`);
      }

      return cached;
    } catch (error) {
      this.logger.error('获取话术缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置话术缓存
   * @param scenario 场景标识
   * @param customerProfile 客户画像
   * @param script 话术内容
   * @param ttl 过期时间（秒）
   */
  async setScriptCache(
    scenario: string,
    customerProfile: string,
    script: string,
    ttl?: number,
  ): Promise<void> {
    try {
      const key = this.generateCacheKey('script', `${scenario}_${customerProfile}`);
      await this.redisClient.setEx(key, ttl || this.cacheTTL, script);
      this.logger.log(`话术缓存已保存: ${scenario}`);
    } catch (error) {
      this.logger.error('设置话术缓存失败:', error);
    }
  }

  /**
   * 删除指定缓存
   * @param type 缓存类型
   * @param content 内容标识
   */
  async deleteCache(type: string, content: string): Promise<void> {
    try {
      const key = this.generateCacheKey(type, content);
      await this.redisClient.del(key);
      this.logger.log(`缓存已删除: ${type} - ${content}`);
    } catch (error) {
      this.logger.error('删除缓存失败:', error);
    }
  }

  /**
   * 清空所有AI缓存
   */
  async clearAllAiCache(): Promise<void> {
    try {
      const keys = await this.redisClient.keys(`${this.cachePrefix}*`);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        this.logger.log(`已清空${keys.length}个AI缓存`);
      }
    } catch (error) {
      this.logger.error('清空AI缓存失败:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    ocrKeys: number;
    analysisKeys: number;
    scriptKeys: number;
  }> {
    try {
      const allKeys = await this.redisClient.keys(`${this.cachePrefix}*`);
      const ocrKeys = await this.redisClient.keys(`${this.cachePrefix}ocr:*`);
      const analysisKeys = await this.redisClient.keys(`${this.cachePrefix}analysis:*`);
      const scriptKeys = await this.redisClient.keys(`${this.cachePrefix}script:*`);

      return {
        totalKeys: allKeys.length,
        ocrKeys: ocrKeys.length,
        analysisKeys: analysisKeys.length,
        scriptKeys: scriptKeys.length,
      };
    } catch (error) {
      this.logger.error('获取缓存统计失败:', error);
      return {
        totalKeys: 0,
        ocrKeys: 0,
        analysisKeys: 0,
        scriptKeys: 0,
      };
    }
  }

  /**
   * 模块销毁时断开Redis连接
   */
  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Redis连接已关闭');
    }
  }
}
