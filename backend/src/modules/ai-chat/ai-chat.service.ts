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
  ) {}

  /**
   * 上传并分析聊天记录
   * 完整流程：上传 → OCR识别 → AI分析 → 自动打标签 → 风险检测
   */
  async uploadAndAnalyze(uploadDto: UploadChatDto, userId: number) {
    try {
      this.logger.log(`销售${userId}上传聊天记录，微信号: ${uploadDto.wechatId}`);

      // 1. 查找客户（通过微信号）
      const customer = await this.customerRepository.findOne({
        where: { wechatId: uploadDto.wechatId },
      });

      if (!customer) {
        throw new NotFoundException(`找不到微信号为${uploadDto.wechatId}的客户，请先创建客户`);
      }

      // 2. 创建聊天记录
      const chatRecord = this.aiChatRecordRepository.create({
        customerId: customer.id,
        userId,
        wechatId: uploadDto.wechatId,
        chatDate: new Date(uploadDto.chatDate),
        images: uploadDto.images,
        ocrStatus: '待处理',
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
   * 异步处理OCR和AI分析
   */
  private async processOcrAndAnalysis(recordId: number, customer: Customer) {
    let record: AiChatRecord;

    try {
      // 1. 更新OCR状态
      await this.aiChatRecordRepository.update(recordId, {
        ocrStatus: '处理中',
      });

      record = await this.aiChatRecordRepository.findOne({
        where: { id: recordId },
      });

      // 2. OCR识别（带缓存）
      this.logger.log(`开始OCR识别，记录ID: ${recordId}`);
      let ocrText = '';

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

      // 4. 保存分析结果
      await this.aiChatRecordRepository.update(recordId, {
        aiAnalysisResult: analysisResult,
        qualityLevel: analysisResult.qualityLevel,
        riskLevel: analysisResult.riskLevel,
        intentionScore: analysisResult.intentionScore,
        estimatedValue: analysisResult.estimatedValue,
        decisionMakerRole: analysisResult.customerProfile?.decisionMakerRole,
        analysisStatus: '已完成',
      });

      // 5. 更新客户意向等级（基于AI评分）
      await this.updateCustomerIntent(customer.id, analysisResult);

      // 6. 自动打标签
      await this.aiTagsService.autoTagFromAnalysis(customer.id, analysisResult, recordId);

      // 7. 风险预警
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
