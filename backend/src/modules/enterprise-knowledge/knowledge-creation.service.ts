import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnterpriseKnowledgeBase, EnterpriseBasicInfo } from '../entities/index';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';
import { MiningKnowledgeService } from '../mining-knowledge.service';
import { IndustryQuestionService } from '../industry-question.service';

/**
 * 企业知识库创建服务
 * 实现产品需求文档中的4步创建流程：
 * 1. 补充企业基本信息
 * 2. 补充客户常见问题
 * 3. AI挖掘聊天记录
 * 4. 生成企业知识库
 */
export interface CreateEnterpriseKnowledgeDTO {
  // 步骤1：企业基本信息
  enterpriseInfo: {
    inputMethod: 'MANUAL' | 'FILE_UPLOAD' | 'AI_ASSIST';
    companyName?: string;
    industry?: string;
    businessScope?: string;
    products?: string[];
    manualContent?: string; // 手动输入的内容
    uploadedFiles?: Express.Multer.File[]; // 上传的文件
  };

  // 步骤2：客户常见问题
  customerFAQ: {
    hasExistingFAQ: boolean;
    faqData?: Array<{
      question: string;
      answer: string;
      category?: string;
    }>;
  };

  // 步骤3：AI挖掘配置
  miningConfig: {
    miningMethod: 'SMART_SELECT' | 'SPECIFY_EMPLOYEES' | 'MANUAL_UPLOAD';
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    employeeIds?: number[];
    customerIds?: number[];
    uploadedChatFiles?: Express.Multer.File[];
    smartSelectCriteria?: {
      minQualityLevel?: 'A' | 'B' | 'C' | 'D';
      minIntentionScore?: number;
      includeKeywords?: string[];
      excludeKeywords?: string[];
    };
  };
}

export interface KnowledgeGenerationResult {
  success: boolean;
  message: string;
  enterpriseId?: number;
  knowledgeBase?: {
    totalKnowledge: number;
    basicInfoCount: number;
    customerFAQCount: number;
    minedKnowledgeCount: number;
    industryRecommendedCount: number;
  };
  steps?: {
    step1: { status: string; result?: any };
    step2: { status: string; result?: any };
    step3: { status: string; result?: any };
    step4: { status: string; result?: any };
  };
}

@Injectable()
export class KnowledgeCreationService {
  private readonly logger = new Logger(KnowledgeCreationService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(EnterpriseBasicInfo)
    private readonly enterpriseInfoRepository: Repository<EnterpriseBasicInfo>,
    private readonly aiConfigCallerService: AiConfigCallerService,
    private readonly miningKnowledgeService: MiningKnowledgeService,
    private readonly industryQuestionService: IndustryQuestionService,
  ) {}

  /**
   * 创建企业知识库（完整流程）
   */
  async createEnterpriseKnowledge(
    createData: CreateEnterpriseKnowledgeDTO,
    userId: number,
  ): Promise<KnowledgeGenerationResult> {
    this.logger.log(`开始创建企业知识库 - 用户: ${userId}`);

    const result: KnowledgeGenerationResult = {
      success: false,
      message: '',
      steps: {
        step1: { status: 'pending' },
        step2: { status: 'pending' },
        step3: { status: 'pending' },
        step4: { status: 'pending' },
      },
    };

    let enterpriseInfo: EnterpriseBasicInfo;
    let basicInfoKnowledge: EnterpriseKnowledgeBase[] = [];
    let customerFAQKnowledge: EnterpriseKnowledgeBase[] = [];
    let minedKnowledge: EnterpriseKnowledgeBase[] = [];
    let industryRecommended: EnterpriseKnowledgeBase[] = [];

    try {
      // 步骤1：补充企业基本信息
      this.logger.log('执行步骤1：补充企业基本信息');
      result.steps!.step1.status = 'processing';

      enterpriseInfo = await this.processEnterpriseBasicInfo(createData.enterpriseInfo, userId);
      basicInfoKnowledge = await this.generateBasicInfoKnowledge(enterpriseInfo, userId);

      result.steps!.step1.status = 'completed';
      result.steps!.step1.result = { infoId: enterpriseInfo.id, knowledgeCount: basicInfoKnowledge.length };

      // 步骤2：补充客户常见问题
      this.logger.log('执行步骤2：补充客户常见问题');
      result.steps!.step2.status = 'processing';

      if (createData.customerFAQ.hasExistingFAQ && createData.customerFAQ.faqData) {
        customerFAQKnowledge = await this.processCustomerFAQ(createData.customerFAQ.faqData, userId);
      }

      result.steps!.step2.status = 'completed';
      result.steps!.step2.result = { knowledgeCount: customerFAQKnowledge.length };

      // 步骤3：AI挖掘聊天记录
      this.logger.log('执行步骤3：AI挖掘聊天记录');
      result.steps!.step3.status = 'processing';

      const miningResult = await this.processChatMining(createData.miningConfig, userId);
      minedKnowledge = miningResult.knowledge || [];

      result.steps!.step3.status = 'completed';
      result.steps!.step3.result = miningResult.stats;

      // 步骤4：生成企业知识库
      this.logger.log('执行步骤4：生成企业知识库');
      result.steps!.step4.status = 'processing';

      // 获取行业推荐知识
      industryRecommended = await this.getIndustryRecommendations(enterpriseInfo.industry, userId);

      result.steps!.step4.status = 'completed';
      result.steps!.step4.result = { recommendedCount: industryRecommended.length };

      // 汇总结果
      const totalKnowledge = basicInfoKnowledge.length + customerFAQKnowledge.length +
                             minedKnowledge.length + industryRecommended.length;

      result.success = true;
      result.message = '企业知识库创建成功';
      result.enterpriseId = enterpriseInfo.id;
      result.knowledgeBase = {
        totalKnowledge,
        basicInfoCount: basicInfoKnowledge.length,
        customerFAQCount: customerFAQKnowledge.length,
        minedKnowledgeCount: minedKnowledge.length,
        industryRecommendedCount: industryRecommended.length,
      };

      this.logger.log(`企业知识库创建完成 - 总知识条目: ${totalKnowledge}`);

    } catch (error) {
      this.logger.error(`创建企业知识库失败: ${error.message}`, error.stack);
      result.success = false;
      result.message = `创建失败: ${error.message}`;

      // 标记失败步骤
      Object.keys(result.steps!).forEach(stepKey => {
        const step = result.steps![stepKey as keyof typeof result.steps];
        if (step.status === 'processing') {
          step.status = 'failed';
        }
      });
    }

    return result;
  }

  /**
   * 处理企业基本信息
   */
  private async processEnterpriseBasicInfo(
    enterpriseData: CreateEnterpriseKnowledgeDTO['enterpriseInfo'],
    userId: number,
  ): Promise<EnterpriseBasicInfo> {
    let processedContent: string;

    switch (enterpriseData.inputMethod) {
      case 'MANUAL':
        processedContent = enterpriseData.manualContent || '';
        break;

      case 'FILE_UPLOAD':
        // TODO: 实现文件解析功能
        processedContent = await this.parseUploadedFiles(enterpriseData.uploadedFiles || []);
        break;

      case 'AI_ASSIST':
        processedContent = await this.generateEnterpriseInfoWithAI(
          enterpriseData.companyName!,
          enterpriseData.industry!,
        );
        break;

      default:
        throw new Error('不支持的企业信息输入方式');
    }

    // 保存企业基本信息
    const enterpriseInfo = this.enterpriseInfoRepository.create({
      companyName: enterpriseData.companyName,
      industry: enterpriseData.industry,
      businessScope: enterpriseData.businessScope,
      products: enterpriseData.products,
      basicInfo: processedContent,
      creatorId: userId,
    });

    return await this.enterpriseInfoRepository.save(enterpriseInfo);
  }

  /**
   * 基于企业信息生成基础知识
   */
  private async generateBasicInfoKnowledge(
    enterpriseInfo: EnterpriseBasicInfo,
    userId: number,
  ): Promise<EnterpriseKnowledgeBase[]> {
    const knowledgeList: EnterpriseKnowledgeBase[] = [];

    try {
      // 使用AI从企业信息中提取Q&A
      const result = await this.aiConfigCallerService.callAI(
        'enterprise_info_qa_extraction',
        {
          enterpriseInfo: enterpriseInfo.basicInfo,
          companyName: enterpriseInfo.companyName,
          industry: enterpriseInfo.industry,
          products: JSON.stringify(enterpriseInfo.products || []),
        },
      );

      if (result && result.qaList && Array.isArray(result.qaList)) {
        for (const qa of result.qaList) {
          const knowledge = this.knowledgeRepository.create({
            title: qa.question,
            content: qa.answer,
            sceneCategory: qa.sceneCategory || '企业介绍',
            productCategory: qa.productCategory || '通用',
            customerType: qa.customerType || '全部客户',
            questionType: qa.questionType || '企业信息',
            sourceType: 'manual',
            sourceId: enterpriseInfo.id,
            creatorId: userId,
            status: 'active',
            priority: 80, // 企业信息优先级较高
            relevanceScore: qa.confidence || 80,
            qualityScore: qa.quality || 80,
          });

          knowledgeList.push(knowledge);
        }
      }

      // 保存到数据库
      await this.knowledgeRepository.save(knowledgeList);

    } catch (error) {
      this.logger.warn(`AI提取企业信息Q&A失败: ${error.message}`);
    }

    return knowledgeList;
  }

  /**
   * 处理客户常见问题
   */
  private async processCustomerFAQ(
    faqData: Array<{ question: string; answer: string; category?: string }>,
    userId: number,
  ): Promise<EnterpriseKnowledgeBase[]> {
    const knowledgeList: EnterpriseKnowledgeBase[] = [];

    for (const faq of faqData) {
      // 使用AI分类和优化FAQ
      try {
        const enhancement = await this.aiConfigCallerService.callAI(
          'faq_enhancement',
          {
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
          },
        );

        const knowledge = this.knowledgeRepository.create({
          title: enhancement.question || faq.question,
          content: enhancement.answer || faq.answer,
          sceneCategory: enhancement.sceneCategory || faq.category || '常见问题',
          productCategory: enhancement.productCategory || '通用',
          customerType: enhancement.customerType || '全部客户',
          questionType: enhancement.questionType || '咨询',
          sourceType: 'manual',
          creatorId: userId,
          status: 'active',
          priority: 70,
          relevanceScore: enhancement.relevanceScore || 75,
          qualityScore: enhancement.qualityScore || 75,
        });

        knowledgeList.push(knowledge);

      } catch (error) {
        this.logger.warn(`FAQ增强失败，使用原始数据: ${error.message}`);

        // 如果AI增强失败，使用原始数据
        const knowledge = this.knowledgeRepository.create({
          title: faq.question,
          content: faq.answer,
          sceneCategory: faq.category || '常见问题',
          productCategory: '通用',
          customerType: '全部客户',
          questionType: '咨询',
          sourceType: 'manual',
          creatorId: userId,
          status: 'active',
          priority: 70,
          relevanceScore: 70,
          qualityScore: 70,
        });

        knowledgeList.push(knowledge);
      }
    }

    // 保存到数据库
    await this.knowledgeRepository.save(knowledgeList);

    return knowledgeList;
  }

  /**
   * 处理聊天记录挖掘
   */
  private async processChatMining(
    miningConfig: CreateEnterpriseKnowledgeDTO['miningConfig'],
    userId: number,
  ): Promise<{ knowledge: EnterpriseKnowledgeBase[]; stats: any }> {
    try {
      if (miningConfig.miningMethod === 'MANUAL_UPLOAD') {
        // TODO: 实现手动上传聊天记录的处理
        return { knowledge: [], stats: { message: '手动上传功能开发中' } };
      }

      // 构建挖掘参数
      const miningParams = {
        startDate: miningConfig.dateRange?.startDate,
        endDate: miningConfig.dateRange?.endDate,
        customerIds: miningConfig.customerIds,
        maxCount: 200,
        minRounds: 3,
      };

      // 调用挖掘服务
      const miningResult = await this.miningKnowledgeService.manualTriggerMining(miningParams, userId);

      // 获取自动批准的知识
      const autoApprovedKnowledge = await this.knowledgeRepository.find({
        where: {
          sourceType: 'ai_mining',
          creatorId: userId,
          status: 'active',
        },
      });

      return {
        knowledge: autoApprovedKnowledge,
        stats: miningResult.stats,
      };

    } catch (error) {
      this.logger.error(`聊天记录挖掘失败: ${error.message}`);
      return { knowledge: [], stats: { error: error.message } };
    }
  }

  /**
   * 获取行业推荐知识
   */
  private async getIndustryRecommendations(
    industry: string,
    userId: number,
  ): Promise<EnterpriseKnowledgeBase[]> {
    try {
      // 获取行业问题库
      const industryQuestions = await this.industryQuestionService.getQuestionsByIndustry(industry);

      const recommendedKnowledge: EnterpriseKnowledgeBase[] = [];

      for (const question of industryQuestions) {
        const knowledge = this.knowledgeRepository.create({
          title: question.question,
          content: question.answerTemplate || '请根据企业具体情况调整答案',
          sceneCategory: question.sceneCategory || '行业知识',
          productCategory: industry,
          customerType: '全部客户',
          questionType: question.questionType || '行业咨询',
          sourceType: 'industry_recommend',
          creatorId: userId,
          status: 'active',
          priority: 50,
          relevanceScore: 70,
          qualityScore: 70,
        });

        recommendedKnowledge.push(knowledge);
      }

      // 保存到数据库
      await this.knowledgeRepository.save(recommendedKnowledge);

      return recommendedKnowledge;

    } catch (error) {
      this.logger.warn(`获取行业推荐失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 解析上传的文件
   */
  private async parseUploadedFiles(files: Express.Multer.File[]): Promise<string> {
    // TODO: 实现文件解析功能（支持PDF、Word、Excel等）
    return '文件解析功能开发中';
  }

  /**
   * 使用AI生成企业信息
   */
  private async generateEnterpriseInfoWithAI(companyName: string, industry: string): Promise<string> {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'enterprise_info_generation',
        {
          companyName,
          industry,
        },
      );

      return result.content || result.description || '';

    } catch (error) {
      this.logger.error(`AI生成企业信息失败: ${error.message}`);
      throw new Error('AI生成企业信息失败，请尝试手动输入');
    }
  }
}