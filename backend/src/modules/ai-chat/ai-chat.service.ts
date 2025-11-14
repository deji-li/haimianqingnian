import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiChatRecord } from './entities/ai-chat-record.entity';
import { UploadChatDto, QueryChatRecordsDto } from './dto/upload-chat.dto';
import { DoubaoOcrService } from '../../common/services/ai/doubao-ocr.service';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiCacheService } from '../../common/services/ai/ai-cache.service';
import { Customer } from '../customer/entities/customer.entity';
import { AiTagsService } from '../ai-tags/ai-tags.service';
import { AiToolsService } from '../ai-tools/ai-tools.service';
import { AiMarketingService } from '../ai-marketing/ai-marketing.service';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    @InjectRepository(AiChatRecord)
    private readonly aiChatRecordRepository: Repository<AiChatRecord>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly doubaoOcrService: DoubaoOcrService,
    private readonly deepseekAnalysisService: DeepseekAnalysisService,
    private readonly aiCacheService: AiCacheService,
    private readonly aiTagsService: AiTagsService,
    private readonly aiToolsService: AiToolsService,
    private readonly aiMarketingService: AiMarketingService,
  ) {}

  /**
   * 上传并分析聊天记录
   * 完整流程：上传 → OCR识别/文本提取 → AI分析 → 自动打标签 → 风险检测
   * 支持三种上传方式：screenshot(截图OCR)、text(直接文本)、file(文件解析)
   */
  async uploadAndAnalyze(uploadDto: UploadChatDto, userId: number) {
    try {
      this.logger.log(
        `销售${userId}上传聊天记录，微信号: ${uploadDto.wechatId}, 类型: ${uploadDto.uploadType || 'screenshot'}`,
      );

      // 1. 查找客户（通过微信号）
      const customer = await this.customerRepository.findOne({
        where: { wechatId: uploadDto.wechatId },
      });

      if (!customer) {
        throw new NotFoundException(`找不到微信号为${uploadDto.wechatId}的客户，请先创建客户`);
      }

      // 2. 创建聊天记录
      const uploadType = uploadDto.uploadType || 'screenshot';
      const chatRecord = this.aiChatRecordRepository.create({
        customerId: customer.id,
        userId,
        wechatId: uploadDto.wechatId,
        chatDate: new Date(uploadDto.chatDate),
        uploadType,
        images: uploadDto.images || [],
        rawText: uploadDto.rawText || null,
        filePath: uploadDto.filePath || null,
        ocrStatus: uploadType === 'screenshot' ? '待处理' : '无需OCR',
        analysisStatus: '待分析',
      });

      const savedRecord = await this.aiChatRecordRepository.save(chatRecord);

      // 3. 异步执行OCR和分析（不阻塞响应）
      this.processOcrAndAnalysis(savedRecord.id, customer).catch((error) => {
        this.logger.error(`异步处理失败: ${error.message}`, error.stack);
      });

      return {
        id: savedRecord.id,
        message: '上传成功，AI正在分析中...',
        customerId: customer.id,
        customerName: customer.wechatNickname,
      };
    } catch (error) {
      this.logger.error(`上传聊天记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 异步处理OCR/文本提取和AI分析
   */
  private async processOcrAndAnalysis(recordId: number, customer: Customer) {
    let record: AiChatRecord;

    try {
      record = await this.aiChatRecordRepository.findOne({
        where: { id: recordId },
      });

      // 1. 根据上传类型获取文本内容
      let ocrText = '';
      const uploadType = record.uploadType || 'screenshot';

      if (uploadType === 'text') {
        // 直接文本上传，无需OCR
        this.logger.log(`使用直接文本，记录ID: ${recordId}`);
        ocrText = record.rawText || '';

        await this.aiChatRecordRepository.update(recordId, {
          ocrText,
          ocrStatus: '无需OCR',
          analysisStatus: '分析中',
        });
      } else if (uploadType === 'file') {
        // 文件上传，解析文件内容
        this.logger.log(`解析文件内容，记录ID: ${recordId}, 路径: ${record.filePath}`);

        await this.aiChatRecordRepository.update(recordId, {
          ocrStatus: '解析中',
        });

        try {
          ocrText = await this.parseFileContent(record.filePath);

          await this.aiChatRecordRepository.update(recordId, {
            ocrText,
            ocrStatus: '已完成',
            analysisStatus: '分析中',
          });
        } catch (error) {
          this.logger.error(`文件解析失败: ${error.message}`);
          throw new Error(`文件解析失败: ${error.message}`);
        }
      } else {
        // 截图上传，需要OCR识别
        this.logger.log(`开始OCR识别，记录ID: ${recordId}`);

        await this.aiChatRecordRepository.update(recordId, {
          ocrStatus: '处理中',
        });

        // 检查缓存
        const cacheKey = record.images.join('|');
        const cachedOcr = await this.aiCacheService.getOcrCache(cacheKey);

        if (cachedOcr) {
          ocrText = cachedOcr;
          this.logger.log('使用OCR缓存结果');
        } else {
          // 调用OCR服务
          ocrText = await this.doubaoOcrService.extractTextFromImages(record.images);

          // 保存到缓存
          await this.aiCacheService.setOcrCache(cacheKey, ocrText, 7200); // 缓存2小时
        }

        // 更新OCR结果
        await this.aiChatRecordRepository.update(recordId, {
          ocrText,
          ocrStatus: '已完成',
          analysisStatus: '分析中',
        });
      }

      // 3. AI分析（带缓存）
      this.logger.log(`开始AI分析，记录ID: ${recordId}`);
      let analysisResult;

      const cachedAnalysis = await this.aiCacheService.getAnalysisCache(ocrText);

      if (cachedAnalysis) {
        analysisResult = cachedAnalysis;
        this.logger.log('使用AI分析缓存结果');
      } else {
        // 调用DeepSeek分析
        analysisResult = await this.deepseekAnalysisService.analyzeChat(ocrText, {
          wechatNickname: customer.wechatNickname,
          phone: customer.phone,
          customerIntent: customer.customerIntent,
        });

        // 保存到缓存
        await this.aiCacheService.setAnalysisCache(ocrText, analysisResult, 3600); // 缓存1小时
      }

      // 4. 提取痛点和兴趣点（新增）
      let painPointsResult = null;
      let interestPointsResult = null;
      let extractedPainPoints: string[] = [];
      let extractedInterestPoints: string[] = [];

      try {
        // 4.1 提取痛点
        painPointsResult = await this.aiMarketingService.analyzePainPoints(
          ocrText,
          {
            wechatNickname: customer.wechatNickname,
            customerIntent: customer.customerIntent,
            studentGrade: customer.studentGrade,
          },
        );

        if (painPointsResult?.result?.pain_points) {
          extractedPainPoints = painPointsResult.result.pain_points.map(
            (p: any) => p.point || p,
          );
        }

        // 4.2 提取兴趣点
        interestPointsResult = await this.aiMarketingService.mineInterestPoints(ocrText);

        if (interestPointsResult?.result?.explicit_interests) {
          extractedInterestPoints = [
            ...interestPointsResult.result.explicit_interests,
            ...(interestPointsResult.result.implicit_interests || []),
          ];
        }

        this.logger.log(
          `提取痛点 ${extractedPainPoints.length} 个，兴趣点 ${extractedInterestPoints.length} 个`,
        );
      } catch (error) {
        this.logger.warn(`提取痛点/兴趣点失败: ${error.message}`);
        // 不影响主流程，继续执行
      }

      // 5. 保存分析结果
      await this.aiChatRecordRepository.update(recordId, {
        aiAnalysisResult: analysisResult,
        qualityLevel: analysisResult.qualityLevel,
        riskLevel: analysisResult.riskLevel,
        intentionScore: analysisResult.intentionScore,
        estimatedValue: analysisResult.estimatedValue,
        decisionMakerRole: analysisResult.customerProfile?.decisionMakerRole,
        painPoints: extractedPainPoints.length > 0 ? extractedPainPoints : null,
        interestPoints: extractedInterestPoints.length > 0 ? extractedInterestPoints : null,
        needsSummary: interestPointsResult?.result?.core_interests?.join('、') || null,
        analysisStatus: '已完成',
      });

      // 6. 更新客户意向等级（基于AI评分）
      await this.updateCustomerIntent(customer.id, analysisResult);

      // 7. 聚合痛点和兴趣点到客户档案（新增）
      await this.aggregateCustomerInsights(customer.id);

      // 8. 自动打标签
      await this.aiTagsService.autoTagFromAnalysis(customer.id, analysisResult, recordId);

      // 9. 风险预警
      await this.aiToolsService.createRiskAlert(customer.id, analysisResult, recordId);

      this.logger.log(`AI分析完成，记录ID: ${recordId}`);
    } catch (error) {
      this.logger.error(`处理OCR和AI分析失败: ${error.message}`, error.stack);

      // 更新失败状态
      await this.aiChatRecordRepository.update(recordId, {
        ocrStatus: record?.ocrStatus === '处理中' ? '失败' : (record?.ocrStatus || '失败'),
        analysisStatus: '失败',
        errorMessage: error.message,
      });
    }
  }

  /**
   * 根据AI分析结果更新客户画像和意向等级
   */
  private async updateCustomerIntent(customerId: number, analysisResult: any) {
    try {
      const { intentionScore, qualityLevel, customerProfile, estimatedValue } = analysisResult;

      // 1. 计算客户意向等级
      let newIntent = '中';
      if (qualityLevel === 'A' || intentionScore >= 80) {
        newIntent = '高';
      } else if (qualityLevel === 'D' || intentionScore < 40) {
        newIntent = '低';
      }

      // 2. 准备更新数据
      const updateData: any = {
        customerIntent: newIntent as any,
        qualityLevel,
        estimatedValue,
        lastAiAnalysisTime: new Date(),
      };

      // 3. 同步客户画像信息（如果AI分析出来了）
      if (customerProfile) {
        if (customerProfile.studentGrade) {
          updateData.studentGrade = customerProfile.studentGrade;
        }
        if (customerProfile.studentAge) {
          updateData.studentAge = customerProfile.studentAge;
        }
        if (customerProfile.familyEconomicLevel) {
          updateData.familyEconomicLevel = customerProfile.familyEconomicLevel;
        }
        if (customerProfile.decisionMakerRole) {
          updateData.decisionMakerRole = customerProfile.decisionMakerRole;
        }
        if (customerProfile.parentRole) {
          updateData.parentRole = customerProfile.parentRole;
        }
        if (customerProfile.location) {
          updateData.location = customerProfile.location;
        }
      }

      // 4. 保存详细的AI分析信息到JSON字段（需求、痛点、兴趣等）
      updateData.aiProfile = {
        needs: analysisResult.customerNeeds || [],
        painPoints: analysisResult.customerPainPoints || [],
        interests: analysisResult.customerInterests || [],
        objections: analysisResult.customerObjections || [],
        competitors: analysisResult.competitorMentioned || [],
        mindset: analysisResult.customerMindset,
        emotionalTone: analysisResult.emotionalTone,
        trustLevel: analysisResult.trustLevel,
        dealOpportunity: analysisResult.dealOpportunity,
        urgency: analysisResult.urgency,
        estimatedCycle: analysisResult.estimatedCycle,
      };

      // 5. 更新到数据库
      await this.customerRepository.update(customerId, updateData);

      this.logger.log(
        `客户画像已同步: ID=${customerId}, 意向=${newIntent}, 等级=${qualityLevel}, ` +
        `年级=${updateData.studentGrade || '未知'}, 预估=${estimatedValue || 0}元`,
      );
    } catch (error) {
      this.logger.error(`更新客户画像失败: ${error.message}`);
    }
  }

  /**
   * 聚合客户的痛点和兴趣点到客户档案
   */
  private async aggregateCustomerInsights(customerId: number) {
    try {
      // 1. 获取该客户所有已完成分析的聊天记录
      const records = await this.aiChatRecordRepository.find({
        where: {
          customerId,
          analysisStatus: '已完成',
        },
        order: { chatDate: 'DESC' },
      });

      if (records.length === 0) {
        this.logger.log(`客户${customerId}暂无已完成的分析记录，跳过聚合`);
        return;
      }

      // 2. 聚合所有痛点和兴趣点
      const allPainPoints: string[] = [];
      const allInterestPoints: string[] = [];
      const painPointFrequency = new Map<string, number>();
      const interestPointFrequency = new Map<string, number>();

      for (const record of records) {
        // 聚合痛点
        if (record.painPoints && Array.isArray(record.painPoints)) {
          for (const point of record.painPoints) {
            allPainPoints.push(point);
            painPointFrequency.set(point, (painPointFrequency.get(point) || 0) + 1);
          }
        }

        // 聚合兴趣点
        if (record.interestPoints && Array.isArray(record.interestPoints)) {
          for (const point of record.interestPoints) {
            allInterestPoints.push(point);
            interestPointFrequency.set(point, (interestPointFrequency.get(point) || 0) + 1);
          }
        }
      }

      // 3. 去重并按出现频率排序
      const uniquePainPoints = [...new Set(allPainPoints)]
        .map((point) => ({
          point,
          frequency: painPointFrequency.get(point) || 1,
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .map((item) => item.point);

      const uniqueInterestPoints = [...new Set(allInterestPoints)]
        .map((point) => ({
          point,
          frequency: interestPointFrequency.get(point) || 1,
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .map((item) => item.point);

      // 4. 提取关键词（从痛点和兴趣点中提取核心词汇）
      const needKeywords = this.extractKeywords(uniquePainPoints, uniqueInterestPoints);

      // 5. 更新客户档案
      await this.customerRepository.update(customerId, {
        painPoints: uniquePainPoints.length > 0 ? uniquePainPoints : null,
        interestPoints: uniqueInterestPoints.length > 0 ? uniqueInterestPoints : null,
        needKeywords: needKeywords.length > 0 ? needKeywords : null,
      });

      this.logger.log(
        `客户洞察已聚合: ID=${customerId}, 痛点=${uniquePainPoints.length}个, ` +
        `兴趣点=${uniqueInterestPoints.length}个, 关键词=${needKeywords.length}个`,
      );
    } catch (error) {
      this.logger.error(`聚合客户洞察失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 从痛点和兴趣点中提取关键词
   */
  private extractKeywords(painPoints: string[], interestPoints: string[]): string[] {
    const keywords = new Set<string>();

    // 定义教育行业相关的关键词模式
    const keywordPatterns = [
      // 学习相关
      /学习|成绩|分数|考试|作业|课程|辅导|补习/g,
      // 能力相关
      /注意力|专注|理解|记忆|思维|能力|水平/g,
      // 科目相关
      /数学|语文|英语|物理|化学|生物|历史|地理/g,
      // 问题相关
      /困难|问题|不足|薄弱|差|弱/g,
      // 目标相关
      /提升|提高|改善|进步|突破|冲刺/g,
      // 质量相关
      /效果|质量|师资|方法|体系|服务/g,
    ];

    const allTexts = [...painPoints, ...interestPoints];

    for (const text of allTexts) {
      // 使用正则提取关键词
      for (const pattern of keywordPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach((match) => keywords.add(match));
        }
      }

      // 提取常见的教育关键短语（2-4个字）
      const phrases = text.match(/[\u4e00-\u9fa5]{2,4}/g);
      if (phrases) {
        // 过滤掉过于通用的词汇
        const stopWords = ['这个', '那个', '什么', '怎么', '如何', '可以', '需要', '希望'];
        phrases.forEach((phrase) => {
          if (!stopWords.includes(phrase) && phrase.length >= 2) {
            keywords.add(phrase);
          }
        });
      }
    }

    // 返回前20个最相关的关键词
    return Array.from(keywords).slice(0, 20);
  }

  /**
   * 查询聊天记录列表
   */
  async findAll(query: QueryChatRecordsDto, userId: number, userRole: string) {
    try {
      const {
        page = 1,
        limit = 20,
        customerId,
        qualityLevel,
        riskLevel,
        startDate,
        endDate,
      } = query;

      const queryBuilder = this.aiChatRecordRepository
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.customer', 'customer');

      // 权限过滤：普通销售只能看自己的
      if (userRole === 'sales') {
        queryBuilder.andWhere('record.userId = :userId', { userId });
      }

      // 条件筛选
      if (customerId) {
        queryBuilder.andWhere('record.customerId = :customerId', { customerId });
      }

      if (qualityLevel) {
        queryBuilder.andWhere('record.qualityLevel = :qualityLevel', { qualityLevel });
      }

      if (riskLevel) {
        queryBuilder.andWhere('record.riskLevel = :riskLevel', { riskLevel });
      }

      if (startDate) {
        queryBuilder.andWhere('record.chatDate >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('record.chatDate <= :endDate', { endDate });
      }

      // 分页
      const [list, total] = await queryBuilder
        .orderBy('record.createTime', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        list,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`查询聊天记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取单条聊天记录详情
   */
  async findOne(id: number) {
    const record = await this.aiChatRecordRepository.findOne({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`聊天记录不存在`);
    }

    return record;
  }

  /**
   * 删除聊天记录
   */
  async remove(id: number) {
    const result = await this.aiChatRecordRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`聊天记录不存在`);
    }

    return { message: '删除成功' };
  }

  /**
   * 解析文件内容（支持txt、html、csv等格式）
   */
  private async parseFileContent(filePath: string): Promise<string> {
    if (!filePath) {
      throw new Error('文件路径为空');
    }

    const fs = require('fs').promises;
    const path = require('path');

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    // 获取文件扩展名
    const ext = path.extname(filePath).toLowerCase();

    try {
      switch (ext) {
        case '.txt':
          // 直接读取文本文件
          return await fs.readFile(filePath, 'utf-8');

        case '.html':
        case '.htm':
          // 读取HTML文件并提取文本（简单的标签移除）
          const htmlContent = await fs.readFile(filePath, 'utf-8');
          // 移除HTML标签，保留文本内容
          const textContent = htmlContent
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 移除script标签
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 移除style标签
            .replace(/<[^>]+>/g, '') // 移除所有HTML标签
            .replace(/&nbsp;/g, ' ') // 替换空格实体
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ') // 合并多个空格
            .trim();
          return textContent;

        case '.csv':
          // 读取CSV文件并格式化为文本
          const csvContent = await fs.readFile(filePath, 'utf-8');
          // 简单的CSV解析，按行分割并格式化
          const lines = csvContent.split('\n').filter(line => line.trim());
          return lines.map((line, index) => {
            if (index === 0) {
              return `表头: ${line}`;
            }
            return `第${index}行: ${line}`;
          }).join('\n');

        case '.json':
          // 读取JSON文件并格式化
          const jsonContent = await fs.readFile(filePath, 'utf-8');
          const jsonData = JSON.parse(jsonContent);
          return JSON.stringify(jsonData, null, 2);

        default:
          // 尝试作为文本文件读取
          this.logger.warn(`未知文件类型: ${ext}，尝试作为文本读取`);
          return await fs.readFile(filePath, 'utf-8');
      }
    } catch (error) {
      this.logger.error(`文件解析错误: ${error.message}`);
      throw new Error(`文件解析失败 (${ext}): ${error.message}`);
    }
  }

  /**
   * 获取统计数据
   */
  async getStatistics(userId: number, userRole: string) {
    try {
      const queryBuilder = this.aiChatRecordRepository.createQueryBuilder('record');

      // 权限过滤
      if (userRole === 'sales') {
        queryBuilder.where('record.userId = :userId', { userId });
      }

      const [
        totalRecords,
        completedRecords,
        qualityA,
        qualityB,
        qualityC,
        qualityD,
        highRisk,
      ] = await Promise.all([
        queryBuilder.getCount(),
        queryBuilder.clone().where('record.analysisStatus = :status', { status: '已完成' }).getCount(),
        queryBuilder.clone().where('record.qualityLevel = :level', { level: 'A' }).getCount(),
        queryBuilder.clone().where('record.qualityLevel = :level', { level: 'B' }).getCount(),
        queryBuilder.clone().where('record.qualityLevel = :level', { level: 'C' }).getCount(),
        queryBuilder.clone().where('record.qualityLevel = :level', { level: 'D' }).getCount(),
        queryBuilder.clone().where('record.riskLevel IN (:...levels)', { levels: ['高', '中'] }).getCount(),
      ]);

      return {
        totalRecords,
        completedRecords,
        processingRecords: totalRecords - completedRecords,
        qualityDistribution: {
          A: qualityA,
          B: qualityB,
          C: qualityC,
          D: qualityD,
        },
        highRiskCount: highRisk,
      };
    } catch (error) {
      this.logger.error(`获取统计数据失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
