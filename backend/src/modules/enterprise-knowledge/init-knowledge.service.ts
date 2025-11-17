import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  EnterpriseKnowledgeBase,
  KnowledgePendingReview,
  EnterpriseBasicInfo,
  IndustryQuestionLibrary,
} from './entities/index';
import {
  CreateBasicInfoDto,
  CreateFaqDto,
  MiningChatDto,
  GenerateKnowledgeDto,
  ProductKnowledgeDto,
} from './dto/init-knowledge.dto';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';

@Injectable()
export class InitKnowledgeService {
  private readonly logger = new Logger(InitKnowledgeService.name);

  constructor(
    @InjectRepository(EnterpriseKnowledgeBase)
    private readonly knowledgeRepository: Repository<EnterpriseKnowledgeBase>,
    @InjectRepository(KnowledgePendingReview)
    private readonly pendingReviewRepository: Repository<KnowledgePendingReview>,
    @InjectRepository(EnterpriseBasicInfo)
    private readonly basicInfoRepository: Repository<EnterpriseBasicInfo>,
    @InjectRepository(IndustryQuestionLibrary)
    private readonly industryQuestionRepository: Repository<IndustryQuestionLibrary>,
    @InjectRepository(AiChatRecord)
    private readonly chatRecordRepository: Repository<AiChatRecord>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 步骤1: 提交企业基础信息（支持3种输入方式）
   */
  async initStep1BasicInfo(dto: CreateBasicInfoDto, userId: number) {
    this.logger.log(`步骤1: 提交企业基础信息 - 输入方式: ${dto.inputMethod}`);

    let basicInfoData: any = {};

    switch (dto.inputMethod) {
      case 'manual':
        // 手动输入
        basicInfoData = {
          companyName: dto.companyName,
          industry: dto.industry,
          companyDescription: dto.companyDescription,
          mainBusiness: dto.mainBusiness,
          advantages: dto.advantages,
          productServices: dto.productServices,
          targetCustomers: dto.targetCustomers,
          contactInfo: dto.contactInfo,
        };
        break;

      case 'file_upload':
        // 文件上传（提取文本内容）
        if (!dto.fileUrl) {
          throw new BadRequestException('文件URL不能为空');
        }
        basicInfoData = await this.extractBasicInfoFromFile(dto.fileUrl);
        basicInfoData.companyName = dto.companyName;
        basicInfoData.industry = dto.industry;
        break;

      case 'ai_generate':
        // AI生成
        if (!dto.aiPrompt) {
          throw new BadRequestException('AI提示词不能为空');
        }
        basicInfoData = await this.generateBasicInfoWithAI(dto.companyName, dto.industry, dto.aiPrompt);
        break;

      default:
        throw new BadRequestException('不支持的输入方式');
    }

    // 保存到数据库
    const existing = await this.basicInfoRepository.findOne({ where: { companyName: dto.companyName } });

    let savedInfo;
    if (existing) {
      Object.assign(existing, basicInfoData);
      savedInfo = await this.basicInfoRepository.save(existing);
    } else {
      const newInfo = this.basicInfoRepository.create(basicInfoData);
      savedInfo = await this.basicInfoRepository.save(newInfo);
    }

    return {
      success: true,
      message: '步骤1完成：企业基础信息已保存',
      data: savedInfo,
      nextStep: 2,
    };
  }

  /**
   * 从文件中提取基础信息（简化版，实际需要接入文件解析服务）
   */
  private async extractBasicInfoFromFile(fileUrl: string) {
    // TODO: 实际应该调用文件解析服务（PDF/Word/TXT）
    // 这里先返回模拟数据
    this.logger.warn('文件解析功能待实现，返回模拟数据');
    return {
      companyDescription: '从文件中提取的企业描述',
      mainBusiness: '从文件中提取的主营业务',
    };
  }

  /**
   * 使用AI生成企业基础信息
   */
  private async generateBasicInfoWithAI(companyName: string, industry: string, aiPrompt: string) {
    try {
      this.logger.log(`AI生成企业信息: ${companyName} - ${industry}`);

      const result = await this.aiConfigCallerService.callAI(
        'knowledge_company_info_generate',
        {
          companyName,
          industry,
          userPrompt: aiPrompt,
        },
      );

      return {
        companyName,
        industry,
        companyDescription: result.companyDescription || '',
        mainBusiness: result.mainBusiness || '',
        advantages: result.advantages || '',
        productServices: result.productServices || '',
        targetCustomers: result.targetCustomers || '',
        contactInfo: result.contactInfo || '',
      };
    } catch (error) {
      this.logger.error(`AI生成企业信息失败: ${error.message}`, error.stack);
      throw new BadRequestException('AI生成失败，请使用手动输入或文件上传');
    }
  }

  /**
   * 步骤2: 提交FAQ列表
   */
  async initStep2Faq(dto: CreateFaqDto, userId: number) {
    if (dto.skip) {
      this.logger.log('步骤2: 用户选择跳过FAQ录入');
      return {
        success: true,
        message: '步骤2已跳过',
        nextStep: 3,
      };
    }

    this.logger.log(`步骤2: 录入FAQ列表 - 数量: ${dto.faqList.length}`);

    const knowledgeEntities = dto.faqList.map((faq) =>
      this.knowledgeRepository.create({
        title: faq.question,
        content: faq.answer,
        sceneCategory: faq.category || '常见问题',
        priority: faq.priority || 50,
        sourceType: 'manual',
        creatorId: userId,
        status: 'active',
      }),
    );

    const saved = await this.knowledgeRepository.save(knowledgeEntities);

    return {
      success: true,
      message: `步骤2完成：已录入${saved.length}条FAQ`,
      count: saved.length,
      nextStep: 3,
    };
  }

  /**
   * 步骤3: AI挖掘微信聊天记录
   */
  async initStep3Mining(dto: MiningChatDto, userId: number) {
    if (dto.skip) {
      this.logger.log('步骤3: 用户选择跳过AI挖掘');
      return {
        success: true,
        message: '步骤3已跳过',
        nextStep: 4,
      };
    }

    this.logger.log('步骤3: 开始AI挖掘微信聊天记录');

    // 1. 查询聊天记录
    const chatRecords = await this.fetchChatRecords(dto);

    if (chatRecords.length === 0) {
      return {
        success: true,
        message: '没有找到符合条件的聊天记录',
        minedCount: 0,
        nextStep: 4,
      };
    }

    this.logger.log(`找到${chatRecords.length}条聊天记录，开始AI提取`);

    // 2. AI提取Q&A
    let extractedCount = 0;
    let approvedCount = 0;
    let reviewCount = 0;

    for (const record of chatRecords) {
      try {
        const qaList = await this.extractQAFromChat(record);

        // 3. 对每个Q&A进行质量评分
        for (const qa of qaList) {
          const score = await this.scoreKnowledgeQuality(qa.question, qa.answer);

          if (score >= 80) {
            // 高分直接加入知识库
            await this.knowledgeRepository.save(
              this.knowledgeRepository.create({
                title: qa.question,
                content: qa.answer,
                sceneCategory: qa.category || '未分类',
                productCategory: qa.productCategory,
                customerType: qa.customerType,
                questionType: qa.questionType,
                sourceType: 'ai_mining', // For EnterpriseKnowledgeBase, valid enum value
                sourceId: record.id, // For EnterpriseKnowledgeBase entity (not sourceChatRecordId)
                creatorId: userId,
                status: 'active',
                priority: 60,
              }),
            );
            approvedCount++;
          } else if (score >= 60) {
            // 中等分进入待审核
            await this.pendingReviewRepository.save(
              this.pendingReviewRepository.create({
                question: qa.question,
                answer: qa.answer,
                aiScore: score,
                confidenceScore: qa.confidence || 70,
                sceneCategory: qa.category,
                productCategory: qa.productCategory,
                customerType: qa.customerType,
                questionType: qa.questionType,
                sourceType: 'chat_mining', // Changed from 'ai_mining' to match enum value
                sourceChatRecordId: record.id, // Using sourceChatRecordId instead of sourceId
                miningBatchId: `init_${Date.now()}`,
                reviewStatus: 'pending',
                miningReason: qa.reason || 'AI挖掘自动提取',
              }),
            );
            reviewCount++;
          }
          // <60分的直接丢弃
          extractedCount++;
        }
      } catch (error) {
        this.logger.error(`提取聊天记录${record.id}失败: ${error.message}`);
      }
    }

    return {
      success: true,
      message: `步骤3完成：挖掘${chatRecords.length}条聊天，提取${extractedCount}个Q&A`,
      stats: {
        chatRecordsScanned: chatRecords.length,
        qaExtracted: extractedCount,
        autoApproved: approvedCount,
        pendingReview: reviewCount,
        discarded: extractedCount - approvedCount - reviewCount,
      },
      nextStep: 4,
    };
  }

  /**
   * 查询聊天记录
   */
  private async fetchChatRecords(dto: MiningChatDto) {
    const queryBuilder = this.chatRecordRepository.createQueryBuilder('chat');

    // 时间范围
    if (dto.startDate && dto.endDate) {
      queryBuilder.andWhere('chat.createTime BETWEEN :start AND :end', {
        start: new Date(dto.startDate),
        end: new Date(dto.endDate),
      });
    }

    // 指定客户
    if (dto.customerIds && dto.customerIds.length > 0) {
      queryBuilder.andWhere('chat.customerId IN (:...customerIds)', {
        customerIds: dto.customerIds,
      });
    }

    // 只查询用户消息（不包括AI回复）
    queryBuilder.andWhere('chat.role = :role', { role: 'user' });

    queryBuilder.orderBy('chat.createTime', 'DESC').take(100); // 限制数量避免过载

    return await queryBuilder.getMany();
  }

  /**
   * 从聊天记录中提取Q&A（调用AI配置）
   */
  private async extractQAFromChat(chatRecord: AiChatRecord) {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_qa_extraction',
        {
          chatContent: chatRecord.ocrText, // Using ocrText instead of content
          customerContext: JSON.stringify(chatRecord.aiAnalysisResult || {}), // Using aiAnalysisResult instead of context
        },
      );

      // AI返回格式: { qaList: [{question, answer, category, confidence, reason}] }
      if (result && result.qaList && Array.isArray(result.qaList)) {
        // 对每个Q&A进行分类
        const classified = await Promise.all(
          result.qaList.map(async (qa: any) => {
            const classification = await this.classifyKnowledge(qa.question, qa.answer);
            return { ...qa, ...classification };
          }),
        );
        return classified;
      }

      return [];
    } catch (error) {
      this.logger.warn(`AI提取Q&A失败: ${error.message}`);
      return [];
    }
  }

  /**
   * AI分类知识（调用AI配置）
   */
  private async classifyKnowledge(question: string, answer: string) {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_classification',
        {
          question,
          answer,
        },
      );

      return {
        category: result.sceneCategory || '未分类',
        productCategory: result.productCategory || '通用',
        customerType: result.customerType || '全部客户',
        questionType: result.questionType || '咨询',
      };
    } catch (error) {
      this.logger.warn(`AI分类失败: ${error.message}`);
      return {
        category: '未分类',
        productCategory: '通用',
        customerType: '全部客户',
        questionType: '咨询',
      };
    }
  }

  /**
   * AI质量评分（调用AI配置）
   */
  private async scoreKnowledgeQuality(question: string, answer: string): Promise<number> {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_quality_scoring',
        {
          question,
          answer,
        },
      );

      return result.score || 50;
    } catch (error) {
      this.logger.warn(`AI质量评分失败: ${error.message}`);
      return 50; // 默认中等分
    }
  }

  /**
   * 步骤4: 生成与整合知识库
   */
  async initStep4Generate(dto: GenerateKnowledgeDto, userId: number) {
    this.logger.log('步骤4: 生成与整合知识库');

    const results: any = {
      success: true,
      message: '知识库初始化完成',
      stats: {},
    };

    // 1. AI分类优化（如果启用）
    if (dto.enableAiClassification) {
      const unclassified = await this.knowledgeRepository.find({
        where: { sceneCategory: '未分类' },
      });

      let reclassified = 0;
      for (const knowledge of unclassified) {
        const classification = await this.classifyKnowledge(knowledge.title, knowledge.content);
        await this.knowledgeRepository.update(knowledge.id, {
          sceneCategory: classification.category,
          productCategory: classification.productCategory,
          customerType: classification.customerType,
          questionType: classification.questionType,
        });
        reclassified++;
      }

      results.stats.reclassified = reclassified;
    }

    // 2. 生成行业问题（如果启用）
    if (dto.enableIndustryQuestions) {
      const basicInfo = await this.basicInfoRepository.findOne({
        order: { id: 'DESC' },
      });

      if (basicInfo) {
        const industryQuestions = await this.generateIndustryQuestions(
          basicInfo.industry,
          dto.industryQuestionCount || 10,
        );

        results.stats.industryQuestionsGenerated = industryQuestions.length;
      }
    }

    // 3. 统计知识库数据
    const totalKnowledge = await this.knowledgeRepository.count({ where: { status: 'active' } });
    const pendingReview = await this.pendingReviewRepository.count({ where: { reviewStatus: 'pending' } });

    results.stats.totalKnowledge = totalKnowledge;
    results.stats.pendingReview = pendingReview;

    return results;
  }

  /**
   * 生成行业问题（调用AI配置）
   */
  private async generateIndustryQuestions(industry: string, count: number) {
    try {
      const result = await this.aiConfigCallerService.callAI(
        'knowledge_industry_questions',
        {
          industry,
          count,
        },
      );

      if (result && result.questions && Array.isArray(result.questions)) {
        // 保存到行业问题库
        const entities = result.questions.map((q: any) =>
          this.industryQuestionRepository.create({
            industryName: industry, // Using industryName instead of industry
            question: q.question,
            answerTemplate: q.suggestedAnswer, // Using answerTemplate instead of answer
            sceneCategory: q.category, // Using sceneCategory instead of category
            // importance: q.importance || 'medium', // REMOVED: Field doesn't exist
            usageCount: 0,
            sourceType: 'ai_generate', // Added required field with enum value
          }),
        );

        const saved = await this.industryQuestionRepository.save(entities);
        return saved;
      }

      return [];
    } catch (error) {
      this.logger.error(`生成行业问题失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 深度配置: 添加产品知识
   */
  async addProductKnowledge(dto: ProductKnowledgeDto, userId: number) {
    this.logger.log(`添加产品知识: ${dto.productName}`);

    // 1. 保存产品主体信息
    const productKnowledge = this.knowledgeRepository.create({
      title: `产品介绍-${dto.productName}`,
      content: `产品名称：${dto.productName}\n产品分类：${dto.productCategory}\n产品描述：${dto.description}\n产品特点：${dto.features || '暂无'}\n适用场景：${dto.usageScenarios || '暂无'}\n价格信息：${dto.pricing || '请咨询'}`,
      sceneCategory: '产品介绍',
      productCategory: dto.productCategory,
      questionType: '产品咨询',
      sourceType: 'manual',
      creatorId: userId,
      status: 'active',
      priority: 80,
    });

    await this.knowledgeRepository.save(productKnowledge);

    // 2. 保存产品FAQ
    if (dto.faqs && dto.faqs.length > 0) {
      const faqEntities = dto.faqs.map((faq) =>
        this.knowledgeRepository.create({
          title: faq.question,
          content: faq.answer,
          sceneCategory: '产品FAQ',
          productCategory: dto.productCategory,
          questionType: '产品咨询',
          sourceType: 'manual',
          creatorId: userId,
          status: 'active',
          priority: faq.priority || 70,
        }),
      );

      await this.knowledgeRepository.save(faqEntities);
    }

    return {
      success: true,
      message: `产品知识已添加: ${dto.productName}`,
      faqCount: dto.faqs?.length || 0,
    };
  }

  /**
   * 获取初始化状态
   */
  async getInitStatus(userId: number) {
    // 查询企业基础信息（查询最新的一条）
    const basicInfo = await this.basicInfoRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    // 查询知识库数据
    const knowledgeCount = await this.knowledgeRepository.count({ where: { status: 'active' } });
    const pendingReviewCount = await this.pendingReviewRepository.count({
      where: { reviewStatus: 'pending' },
    });

    // 简单判断步骤完成情况
    const step1Completed = !!basicInfo;
    const step2Completed = knowledgeCount > 0;
    const step3Completed = knowledgeCount > 0 || pendingReviewCount > 0;
    const step4Completed = knowledgeCount > 10; // 假设完成步骤4后知识库会有一定数量

    let currentStep = 0;
    if (!step1Completed) currentStep = 1;
    else if (!step2Completed) currentStep = 2;
    else if (!step3Completed) currentStep = 3;
    else if (!step4Completed) currentStep = 4;
    else currentStep = 4; // 全部完成

    return {
      currentStep,
      step1Completed,
      step2Completed,
      step3Completed,
      step4Completed,
      basicInfo: basicInfo || null,
      knowledgeCount,
      pendingReviewCount,
    };
  }
}
