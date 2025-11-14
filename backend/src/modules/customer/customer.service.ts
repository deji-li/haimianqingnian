import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerFollowRecord } from './entities/customer-follow-record.entity';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BatchUpdateCustomerDto } from './dto/batch-update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateFollowRecordDto } from './dto/create-follow-record.dto';
import {
  SmartCreateCustomerDto,
  SmartCreateCustomerResponseDto,
} from './dto/smart-create-customer.dto';
import { DoubaoOcrService } from '../../common/services/ai/doubao-ocr.service';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiTagsService } from '../ai-tags/ai-tags.service';
import { BusinessConfigService } from '../business-config/business-config.service';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFollowRecord)
    private followRecordRepository: Repository<CustomerFollowRecord>,
    @InjectRepository(AiChatRecord)
    private aiChatRecordRepository: Repository<AiChatRecord>,
    private readonly doubaoOcrService: DoubaoOcrService,
    private readonly deepseekAnalysisService: DeepseekAnalysisService,
    private readonly aiTagsService: AiTagsService,
    private readonly businessConfigService: BusinessConfigService,
  ) {}

  // 创建客户
  async create(createCustomerDto: CreateCustomerDto) {
    // 检查微信号是否已存在
    const existingCustomer = await this.customerRepository.findOne({
      where: { wechatId: createCustomerDto.wechatId },
    });

    if (existingCustomer) {
      throw new ConflictException('该微信号已存在');
    }

    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  // 分页查询客户列表
  async findAll(queryDto: QueryCustomerDto, dataScope: any = {}) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
      customerIntent,
      trafficSource,
      salesId,
    } = queryDto;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'customer.sales_id = sales.id')
      .leftJoin('users', 'operator', 'customer.operator_id = operator.id')
      .addSelect('sales.real_name', 'salesName')
      .addSelect('operator.real_name', 'operatorName');

    // 数据权限过滤
    if (dataScope.salesId) {
      queryBuilder.andWhere('customer.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope.campusId) {
      // 通过销售的校区ID过滤
      queryBuilder.andWhere('sales.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 搜索条件
    if (keyword) {
      queryBuilder.andWhere(
        '(customer.wechat_nickname LIKE :keyword OR customer.wechat_id LIKE :keyword OR customer.phone LIKE :keyword OR customer.real_name LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (customerIntent) {
      queryBuilder.andWhere('customer.customer_intent = :customerIntent', {
        customerIntent,
      });
    }

    if (trafficSource) {
      queryBuilder.andWhere('customer.traffic_source = :trafficSource', {
        trafficSource,
      });
    }

    if (salesId) {
      queryBuilder.andWhere('customer.sales_id = :salesId', { salesId });
    }

    // 排序
    queryBuilder.orderBy('customer.create_time', 'DESC');

    // 分页
    const total = await queryBuilder.getCount();
    const list = await queryBuilder
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();

    // 转换字段名
    const formattedList = list.map((item) => ({
      id: item.customer_id,
      wechatNickname: item.customer_wechat_nickname,
      wechatId: item.customer_wechat_id,
      phone: item.customer_phone,
      realName: item.customer_real_name,
      trafficSource: item.customer_traffic_source,
      operatorId: item.customer_operator_id,
      salesId: item.customer_sales_id,
      salesWechat: item.customer_sales_wechat,
      customerIntent: item.customer_customer_intent,
      nextFollowTime: item.customer_next_follow_time,
      remark: item.customer_remark,
      createTime: item.customer_create_time,
      updateTime: item.customer_update_time,
      salesName: item.salesName,
      operatorName: item.operatorName,
    }));

    return {
      list: formattedList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 查询单个客户详情
  async findOne(id: number) {
    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'customer.sales_id = sales.id')
      .leftJoin('users', 'operator', 'customer.operator_id = operator.id')
      .where('customer.id = :id', { id })
      .addSelect('sales.real_name', 'salesName')
      .addSelect('sales.phone', 'salesPhone')
      .addSelect('operator.real_name', 'operatorName')
      .getRawOne();

    if (!result) {
      throw new NotFoundException('客户不存在');
    }

    // 查询跟进记录数量
    const followRecordCount = await this.followRecordRepository.count({
      where: { customerId: id },
    });

    return {
      id: result.customer_id,
      wechatNickname: result.customer_wechat_nickname,
      wechatId: result.customer_wechat_id,
      phone: result.customer_phone,
      realName: result.customer_real_name,
      trafficSource: result.customer_traffic_source,
      trafficPlatform: result.customer_traffic_platform,
      trafficCity: result.customer_traffic_city,
      operatorId: result.customer_operator_id,
      salesId: result.customer_sales_id,
      salesWechat: result.customer_sales_wechat,
      customerIntent: result.customer_customer_intent,
      lifecycleStage: result.customer_lifecycle_stage,
      nextFollowTime: result.customer_next_follow_time,
      remark: result.customer_remark,
      // AI分析字段
      studentGrade: result.customer_student_grade,
      studentAge: result.customer_student_age,
      familyEconomicLevel: result.customer_family_economic_level,
      decisionMakerRole: result.customer_decision_maker_role,
      parentRole: result.customer_parent_role,
      location: result.customer_location,
      estimatedValue: result.customer_estimated_value,
      qualityLevel: result.customer_quality_level,
      aiProfile: result.customer_ai_profile,
      lastAiAnalysisTime: result.customer_last_ai_analysis_time,
      // 时间字段
      createTime: result.customer_create_time,
      updateTime: result.customer_update_time,
      // 关联字段
      salesName: result.salesName,
      salesPhone: result.salesPhone,
      operatorName: result.operatorName,
      followRecordCount,
    };
  }

  // 更新客户
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 如果修改了微信号，检查是否与其他客户重复
    if (
      updateCustomerDto.wechatId &&
      updateCustomerDto.wechatId !== customer.wechatId
    ) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { wechatId: updateCustomerDto.wechatId },
      });

      if (existingCustomer) {
        throw new ConflictException('该微信号已被其他客户使用');
      }
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  // 批量更新客户
  async batchUpdate(batchUpdateDto: BatchUpdateCustomerDto) {
    const { ids, salesId, customerIntent, operatorId } = batchUpdateDto;

    if (ids.length === 0) {
      throw new NotFoundException('未选择任何客户');
    }

    // 构建更新对象
    const updateData: any = {};
    if (salesId !== undefined) {
      updateData.salesId = salesId;
    }
    if (customerIntent !== undefined) {
      updateData.customerIntent = customerIntent;
    }
    if (operatorId !== undefined) {
      updateData.operatorId = operatorId;
    }

    if (Object.keys(updateData).length === 0) {
      throw new NotFoundException('未指定任何更新字段');
    }

    // 批量更新
    await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set(updateData)
      .whereInIds(ids)
      .execute();

    return {
      success: true,
      message: `成功更新 ${ids.length} 个客户`,
      count: ids.length,
    };
  }

  // 删除客户
  async remove(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    await this.customerRepository.remove(customer);
    return { message: '删除成功' };
  }

  // 创建跟进记录
  async createFollowRecord(
    createFollowRecordDto: CreateFollowRecordDto,
    operatorId: number,
  ) {
    const { customerId, followContent, nextFollowTime } =
      createFollowRecordDto;

    // 检查客户是否存在
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 创建跟进记录
    const followRecord = this.followRecordRepository.create({
      customerId,
      followContent,
      followTime: new Date(),
      operatorId,
      nextFollowTime,
    });

    await this.followRecordRepository.save(followRecord);

    // 更新客户的下次回访时间
    if (nextFollowTime) {
      customer.nextFollowTime = nextFollowTime;
      await this.customerRepository.save(customer);
    }

    return followRecord;
  }

  // 获取客户跟进记录
  async getFollowRecords(customerId: number) {
    const records = await this.followRecordRepository
      .createQueryBuilder('record')
      .leftJoin('users', 'operator', 'record.operator_id = operator.id')
      .where('record.customer_id = :customerId', { customerId })
      .addSelect('operator.real_name', 'operatorName')
      .orderBy('record.follow_time', 'DESC')
      .getRawMany();

    return records.map((item) => ({
      id: item.record_id,
      customerId: item.record_customer_id,
      followContent: item.record_follow_content,
      followTime: item.record_follow_time,
      operatorId: item.record_operator_id,
      nextFollowTime: item.record_next_follow_time,
      createTime: item.record_create_time,
      operatorName: item.operatorName || 'AI智能助手',
    }));
  }

  // 快速搜索客户（用于订单登记时选择客户）
  async searchCustomers(keyword: string) {
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'customer.sales_id = sales.id')
      .where(
        'customer.wechat_id LIKE :keyword OR customer.wechat_nickname LIKE :keyword OR customer.phone LIKE :keyword',
        { keyword: `%${keyword}%` },
      )
      .select('customer.id', 'id')
      .addSelect('customer.wechat_nickname', 'wechatNickname')
      .addSelect('customer.wechat_id', 'wechatId')
      .addSelect('customer.phone', 'phone')
      .addSelect('customer.real_name', 'realName')
      .addSelect('sales.real_name', 'salesName')
      .limit(10)
      .getRawMany();

    return customers;
  }

  // 获取待回访客户列表
  async getPendingFollowUps(dataScope: any = {}) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今天结束时间

    const qb = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'sales.id = customer.sales_id')
      .leftJoin('users', 'operator', 'operator.id = customer.operator_id')
      .leftJoinAndSelect(
        'customer_follow_records',
        'lastFollow',
        'lastFollow.id = (SELECT id FROM customer_follow_records WHERE customer_id = customer.id ORDER BY follow_time DESC LIMIT 1)',
      )
      .where('customer.next_follow_time IS NOT NULL')
      .andWhere('customer.next_follow_time <= :today', { today })
      .select([
        'customer.id',
        'customer.wechat_nickname',
        'customer.wechat_id',
        'customer.phone',
        'customer.real_name',
        'customer.customer_intent',
        'customer.lifecycle_stage',
        'customer.next_follow_time',
        'customer.sales_id',
      ])
      .addSelect('sales.real_name', 'salesName')
      .addSelect('operator.real_name', 'operatorName')
      .addSelect('lastFollow.follow_time', 'lastFollowTime')
      .orderBy('customer.next_follow_time', 'ASC');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('customer.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('customer.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    const results = await qb.getRawMany();

    this.logger.debug(`[getPendingFollowUps] 查询结果数量: ${results.length}`);
    if (results.length > 0) {
      this.logger.debug(`[getPendingFollowUps] 原始字段列表: ${Object.keys(results[0]).join(', ')}`);
      this.logger.debug(`[getPendingFollowUps] 第一条原始数据: ${JSON.stringify(results[0])}`);
    }

    const mapped = results.map((item) => ({
      id: item.customer_id,
      wechatNickname: item.wechat_nickname,
      wechatId: item.wechat_id,
      phone: item.customer_phone,  // phone字段带customer前缀
      realName: item.real_name,
      customerIntent: item.customer_intent,
      lifecycleStage: item.lifecycle_stage,
      nextFollowTime: item.next_follow_time,
      lastFollowTime: item.lastFollowTime,
      salesId: item.sales_id,
      salesName: item.salesName,
      operatorName: item.operatorName,
    }));

    return mapped;
  }

  // 获取跟进统计
  async getFollowStatistics(dataScope: any = {}) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 基础查询条件
    const baseWhere: any = {};
    if (dataScope?.salesId) {
      baseWhere.salesId = dataScope.salesId;
    }
    if (dataScope?.campusId) {
      baseWhere.campusId = dataScope.campusId;
    }

    // 今日跟进数（从跟进记录表统计）
    const todayFollowCount = await this.followRecordRepository.count({
      where: {
        followTime: Between(
          today,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
        ...(dataScope?.salesId && { operatorId: dataScope.salesId }),
      },
    });

    // 本周跟进数
    const weekFollowCount = await this.followRecordRepository.count({
      where: {
        followTime: Between(
          weekStart,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
        ...(dataScope?.salesId && { operatorId: dataScope.salesId }),
      },
    });

    // 本月跟进数
    const monthFollowCount = await this.followRecordRepository.count({
      where: {
        followTime: Between(
          monthStart,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
        ...(dataScope?.salesId && { operatorId: dataScope.salesId }),
      },
    });

    // 待跟进客户数（今天需要跟进）
    const pendingCount = await this.customerRepository.count({
      where: {
        ...baseWhere,
        nextFollowTime: Between(
          today,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
      },
    });

    // 逾期未跟进数（应该在今天之前跟进但还没跟进的）
    const overdueCount = await this.customerRepository.count({
      where: {
        ...baseWhere,
        nextFollowTime: Between(
          new Date('2020-01-01'),
          today,
        ),
      },
    });

    // 总客户数
    const totalCustomers = await this.customerRepository.count({
      where: baseWhere,
    });

    return {
      todayFollow: todayFollowCount,
      weekFollow: weekFollowCount,
      monthFollow: monthFollowCount,
      pendingFollow: pendingCount,
      overdueFollow: overdueCount,
      totalCustomers,
    };
  }

  /**
   * AI智能识别创建客户
   * @param smartCreateDto 智能创建DTO（包含图片）
   * @param user 当前用户
   * @returns 识别后的客户信息结构化数据
   */
  async smartCreateCustomer(
    smartCreateDto: SmartCreateCustomerDto,
    user: any,
  ): Promise<any> {
    try {
      this.logger.log('开始AI智能识别创建客户（异步模式）...');

      // 1. 验证微信号
      if (!smartCreateDto.knownInfo?.wechatId) {
        throw new BadRequestException('请提供微信号');
      }

      // 2. 检查微信号是否已存在
      const existingCustomer = await this.customerRepository.findOne({
        where: { wechatId: smartCreateDto.knownInfo.wechatId },
      });

      if (existingCustomer) {
        throw new BadRequestException('该微信号对应的客户已存在');
      }

      // 3. 立即创建客户记录（仅保存微信号和基本信息）
      const customer = this.customerRepository.create({
        wechatId: smartCreateDto.knownInfo.wechatId,
        wechatNickname: smartCreateDto.knownInfo?.wechatNickname || null,
        phone: smartCreateDto.knownInfo?.phone || null,
        operatorId: smartCreateDto.knownInfo?.operatorId || null,
        salesId: user.id,
        customerIntent: '中意向',
        lifecycleStage: '线索',
        aiProcessingStatus: 'pending', // 标记为待处理
        remark: 'AI识别中，请稍后查看完整信息...',
      });

      const savedCustomer = await this.customerRepository.save(customer);
      this.logger.log(`客户创建成功，ID: ${savedCustomer.id}，开始后台AI识别...`);

      // 4. 异步处理OCR和AI分析（不等待结果）
      this.processAiRecognitionAsync(savedCustomer.id, smartCreateDto).catch(error => {
        this.logger.error(`客户${savedCustomer.id}的AI识别失败: ${error.message}`, error.stack);
      });

      // 5. 立即返回客户信息
      return {
        success: true,
        customerId: savedCustomer.id,
        message: '客户创建成功，AI正在后台识别中，请稍后查看详情',
        customer: savedCustomer,
      };

    } catch (error) {
      this.logger.error(`创建客户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 异步处理AI识别（不阻塞主流程）
   */
  private async processAiRecognitionAsync(
    customerId: number,
    smartCreateDto: SmartCreateCustomerDto,
  ): Promise<void> {
    try {
      // 更新状态为处理中
      await this.customerRepository.update(customerId, {
        aiProcessingStatus: 'processing',
      });

      // 1. 收集图片路径
      const imagePaths: string[] = [];

      // 处理base64图片
      if (smartCreateDto.imageBase64List && smartCreateDto.imageBase64List.length > 0) {
        for (let i = 0; i < smartCreateDto.imageBase64List.length; i++) {
          const base64Data = smartCreateDto.imageBase64List[i];
          const tempPath = await this.saveBase64ToTemp(base64Data, i);
          imagePaths.push(tempPath);
        }
      }

      // 处理URL图片
      if (smartCreateDto.imageUrls && smartCreateDto.imageUrls.length > 0) {
        imagePaths.push(...smartCreateDto.imageUrls);
      }

      if (imagePaths.length === 0) {
        throw new Error('没有提供图片');
      }

      this.logger.log(`客户${customerId}: 收集到${imagePaths.length}张图片，开始OCR识别...`);

      // 2. OCR识别
      let chatText: string;
      if (imagePaths.length === 1) {
        chatText = await this.doubaoOcrService.extractTextFromImage(imagePaths[0]);
      } else {
        chatText = await this.doubaoOcrService.extractTextFromImages(imagePaths);
      }

      this.logger.log(`客户${customerId}: OCR识别完成，文本长度: ${chatText.length}`);

      // 3. AI深度分析
      const analysisResult = await this.deepseekAnalysisService.analyzeChat(
        chatText,
        smartCreateDto.knownInfo,
      );

      this.logger.log(`客户${customerId}: AI分析完成，开始更新客户信息...`);

      // 4. 更新客户信息（使用动态配置）
      const updateData = await this.applyAiFieldMapping(analysisResult, smartCreateDto.knownInfo);
      await this.customerRepository.update(customerId, updateData);
      this.logger.log(`客户${customerId}: 客户信息更新完成，应用了${Object.keys(updateData).length}个字段`);

      // 5. 创建跟进记录，保存聊天文本
      const followRecord = this.followRecordRepository.create({
        customerId,
        followContent: `【AI智能创建客户-聊天记录】\n\n${chatText}\n\n---\n【AI分析摘要】\n意向等级：${this.mapIntentionScoreToLevel(analysisResult.intentionScore)}\n客户需求：${analysisResult.customerNeeds.slice(0, 3).join('、')}\n下一步建议：${analysisResult.nextSteps.slice(0, 2).join('、')}`,
        followTime: new Date(),
        operatorId: null, // AI自动创建，无操作员
        nextFollowTime: null,
      });
      const savedFollowRecord = await this.followRecordRepository.save(followRecord);
      this.logger.log(`客户${customerId}: 创建跟进记录ID=${savedFollowRecord.id}`);

      // 6. 创建AI标签
      await this.aiTagsService.autoTagFromAnalysis(
        customerId,
        analysisResult,
        savedFollowRecord.id,
      );
      this.logger.log(`客户${customerId}: AI标签创建完成`);

      // 7. 创建聊天记录分析
      try {
        // 查询客户信息以获取salesId和wechatId
        this.logger.log(`客户${customerId}: 开始创建聊天记录分析...`);
        const customerInfo = await this.customerRepository.findOne({
          where: { id: customerId },
        });

        if (!customerInfo) {
          throw new Error(`客户${customerId}不存在`);
        }

        this.logger.log(`客户${customerId}: 查询到客户信息，salesId=${customerInfo.salesId}, wechatId=${customerInfo.wechatId}`);

        const aiChatRecord = this.aiChatRecordRepository.create({
          customerId,
          userId: customerInfo.salesId, // 使用客户的销售ID
          chatDate: new Date(),
          wechatId: customerInfo.wechatId,
          images: [], // AI智能创建时图片已保存在跟进记录中
          ocrText: chatText,
          aiAnalysisResult: analysisResult,
          qualityLevel: analysisResult.qualityLevel,
          riskLevel: analysisResult.riskLevel,
          intentionScore: analysisResult.intentionScore,
          estimatedValue: analysisResult.estimatedValue,
          decisionMakerRole: analysisResult.customerProfile?.decisionMakerRole || null,
          ocrStatus: '已完成',
          analysisStatus: '已完成',
        });

        this.logger.log(`客户${customerId}: 准备保存聊天记录分析...`);
        const savedChatRecord = await this.aiChatRecordRepository.save(aiChatRecord);
        this.logger.log(`客户${customerId}: 创建聊天记录分析ID=${savedChatRecord.id}`);
      } catch (chatRecordError) {
        this.logger.error(`客户${customerId}: 创建聊天记录分析失败: ${chatRecordError.message}`, chatRecordError.stack);
        // 不影响整体流程，继续执行
      }

      // 8. 清理临时文件
      this.cleanupTempFiles(imagePaths);

      this.logger.log(`客户${customerId}: AI识别处理完成`);

    } catch (error) {
      // 更新失败状态
      await this.customerRepository.update(customerId, {
        aiProcessingStatus: 'failed',
        aiProcessingError: error.message,
        remark: `AI识别失败: ${error.message}`,
      });
      throw error;
    }
  }

  /**
   * 保存base64图片到临时目录
   */
  private async saveBase64ToTemp(base64Data: string, index: number): Promise<string> {
    try {
      // 移除data:image/xxx;base64,前缀
      const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');

      // 创建临时目录
      const tempDir = path.join(process.cwd(), 'temp', 'smart-create');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 生成文件名
      const fileName = `paste-${Date.now()}-${index}.jpg`;
      const filePath = path.join(tempDir, fileName);

      // 写入文件
      fs.writeFileSync(filePath, buffer);

      this.logger.log(`保存临时文件: ${filePath}`);
      return filePath;

    } catch (error) {
      this.logger.error(`保存base64图片失败: ${error.message}`);
      throw new BadRequestException('图片格式错误');
    }
  }

  /**
   * 清理临时文件
   */
  private cleanupTempFiles(imagePaths: string[]) {
    for (const filePath of imagePaths) {
      try {
        // 只删除临时目录中的文件
        if (filePath.includes('/temp/smart-create') || filePath.includes('\\temp\\smart-create')) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            this.logger.log(`删除临时文件: ${filePath}`);
          }
        }
      } catch (error) {
        this.logger.warn(`删除临时文件失败: ${filePath}, ${error.message}`);
      }
    }
  }

  /**
   * 根据AI字段映射配置动态应用字段
   */
  private async applyAiFieldMapping(analysisResult: any, knownInfo?: any): Promise<any> {
    try {
      // 从配置中获取字段映射规则
      const fieldMappings = await this.businessConfigService.getConfig('ai_field_mapping');

      if (!fieldMappings || !Array.isArray(fieldMappings)) {
        this.logger.warn('AI字段映射配置不存在或格式错误，使用默认映射');
        return this.getDefaultFieldMapping(analysisResult, knownInfo);
      }

      const updateData: any = {};

      // 遍历配置的每个字段映射
      for (const mapping of fieldMappings) {
        if (!mapping.enabled) {
          continue; // 跳过未启用的字段
        }

        // 从AI结果中获取值
        let aiValue = this.getNestedValue(analysisResult, mapping.aiField);

        // 如果AI没有识别到，且有已知信息，使用已知信息
        if (!aiValue && knownInfo) {
          aiValue = knownInfo[mapping.dbField];
        }

        // 如果有值，则添加到更新数据中
        if (aiValue !== undefined && aiValue !== null) {
          updateData[mapping.dbField] = aiValue;
        }
      }

      // 添加固定字段
      updateData.customerIntent = this.mapIntentionScoreToLevel(analysisResult.intentionScore);
      updateData.lifecycleStage = this.mapQualityLevelToStage(analysisResult.qualityLevel);
      updateData.aiProfile = JSON.stringify({
        needs: analysisResult.customerNeeds,
        painPoints: analysisResult.customerPainPoints,
        objections: analysisResult.customerObjections,
        nextSteps: analysisResult.nextSteps,
        salesStrategy: analysisResult.salesStrategy,
        riskFactors: analysisResult.riskFactors,
      });
      updateData.aiProcessingStatus = 'completed';
      updateData.lastAiAnalysisTime = new Date();
      updateData.remark = `AI分析完成\n\n【客户需求】\n${analysisResult.customerNeeds.join('\n')}\n\n【下一步建议】\n${analysisResult.nextSteps.join('\n')}`;

      return updateData;
    } catch (error) {
      this.logger.error(`应用AI字段映射失败: ${error.message}`, error.stack);
      return this.getDefaultFieldMapping(analysisResult, knownInfo);
    }
  }

  /**
   * 获取嵌套对象的值（例如：'customerProfile.wechatNickname'）
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * 默认字段映射（配置不可用时使用）
   */
  private getDefaultFieldMapping(analysisResult: any, knownInfo?: any): any {
    return {
      wechatNickname: analysisResult.customerProfile?.wechatNickname || knownInfo?.wechatNickname || null,
      realName: analysisResult.customerProfile?.parentRole || null,
      phone: knownInfo?.phone || null,
      location: analysisResult.customerProfile?.location || null,
      studentGrade: analysisResult.customerProfile?.studentGrade || null,
      studentAge: analysisResult.customerProfile?.studentAge || null,
      familyEconomicLevel: analysisResult.customerProfile?.familyEconomicLevel || null,
      decisionMakerRole: analysisResult.customerProfile?.decisionMakerRole || null,
      parentRole: analysisResult.customerProfile?.parentRole || null,
      estimatedValue: analysisResult.estimatedValue || null,
      qualityLevel: analysisResult.qualityLevel || null,
      customerIntent: this.mapIntentionScoreToLevel(analysisResult.intentionScore),
      lifecycleStage: this.mapQualityLevelToStage(analysisResult.qualityLevel),
      aiProfile: JSON.stringify({
        needs: analysisResult.customerNeeds,
        painPoints: analysisResult.customerPainPoints,
        objections: analysisResult.customerObjections,
        nextSteps: analysisResult.nextSteps,
        salesStrategy: analysisResult.salesStrategy,
        riskFactors: analysisResult.riskFactors,
      }),
      aiProcessingStatus: 'completed',
      lastAiAnalysisTime: new Date(),
      remark: `AI分析完成\n\n【客户需求】\n${analysisResult.customerNeeds.join('\n')}\n\n【下一步建议】\n${analysisResult.nextSteps.join('\n')}`,
    };
  }

  /**
   * 将意向分数映射为意向等级
   */
  private mapIntentionScoreToLevel(score: number): string {
    if (score >= 80) return '高意向';
    if (score >= 60) return '中意向';
    if (score >= 40) return '低意向';
    return '无意向';
  }

  /**
   * 将质量等级映射为客户阶段
   */
  private mapQualityLevelToStage(qualityLevel: string): string {
    const map: Record<string, string> = {
      'A': '报价',
      'B': '方案沟通',
      'C': '需求确认',
      'D': '初次接触',
    };
    return map[qualityLevel] || '初次接触';
  }

  /**
   * 从AI分析结果生成标签
   */
  private generateTagsFromAnalysis(analysisResult: any): string[] {
    const tags: string[] = [];

    // 意向相关
    if (analysisResult.intentionScore >= 80) {
      tags.push('高意向');
    } else if (analysisResult.intentionScore >= 60) {
      tags.push('中意向');
    }

    // 风险相关
    if (analysisResult.riskLevel !== '无风险' && analysisResult.riskLevel !== '低') {
      tags.push(`${analysisResult.riskLevel}风险`);
    }

    // 客户画像相关
    if (analysisResult.customerProfile.familyEconomicLevel === '高') {
      tags.push('高消费力');
    }
    if (analysisResult.customerProfile.educationAttitude === '很重视') {
      tags.push('教育重视');
    }

    // 紧迫性
    if (analysisResult.urgency === '高') {
      tags.push('急需成交');
    }

    // 客户心态
    if (analysisResult.customerMindset) {
      tags.push(analysisResult.customerMindset);
    }

    return tags;
  }

  /**
   * 导出客户数据为Excel
   */
  async exportToExcel(queryDto: QueryCustomerDto, dataScope: any): Promise<Buffer> {
    try {
      // 获取客户列表数据（不分页，获取所有符合条件的数据）
      const customers = await this.findAllForExport(queryDto, dataScope);

      // 准备Excel数据
      const excelData = customers.map((customer, index) => ({
        '序号': index + 1,
        '客户姓名': customer.realName || '',
        '微信昵称': customer.wechatNickname || '',
        '微信号': customer.wechatId || '',
        '手机号': customer.phone || '',
        '性别': customer.gender || '',
        '年龄': customer.age || '',
        '生命周期': customer.lifecycleStage || '',
        '客户意向': customer.customerIntent || '',
        '意向产品': customer.intentProduct || '',
        '客户来源': customer.source || '',
        '客户标签': Array.isArray(customer.tags) ? customer.tags.join(', ') : '',
        '预计成交金额': customer.estimatedAmount || '',
        '下次跟进时间': customer.nextFollowTime ? new Date(customer.nextFollowTime).toLocaleString('zh-CN') : '',
        '备注': customer.remark || '',
        '销售人员': customer.sales?.realName || '',
        '所属部门': customer.department?.departmentName || '',
        '所属校区': customer.campus?.campusName || '',
        '创建时间': customer.createTime ? new Date(customer.createTime).toLocaleString('zh-CN') : '',
        '更新时间': customer.updateTime ? new Date(customer.updateTime).toLocaleString('zh-CN') : '',
      }));

      // 创建工作簿
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '客户数据');

      // 设置列宽
      const columnWidths = [
        { wch: 6 },   // 序号
        { wch: 12 },  // 客户姓名
        { wch: 15 },  // 微信昵称
        { wch: 15 },  // 微信号
        { wch: 12 },  // 手机号
        { wch: 6 },   // 性别
        { wch: 6 },   // 年龄
        { wch: 12 },  // 生命周期
        { wch: 10 },  // 客户意向
        { wch: 15 },  // 意向产品
        { wch: 10 },  // 客户来源
        { wch: 25 },  // 客户标签
        { wch: 12 },  // 预计成交金额
        { wch: 18 },  // 下次跟进时间
        { wch: 30 },  // 备注
        { wch: 10 },  // 销售人员
        { wch: 12 },  // 所属部门
        { wch: 12 },  // 所属校区
        { wch: 18 },  // 创建时间
        { wch: 18 },  // 更新时间
      ];
      worksheet['!cols'] = columnWidths;

      // 生成Buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      this.logger.log(`导出客户数据成功，共${excelData.length}条记录`);

      return buffer;
    } catch (error) {
      this.logger.error(`导出客户数据失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取所有客户数据用于导出（不分页）
   */
  private async findAllForExport(queryDto: QueryCustomerDto, dataScope: any): Promise<Customer[]> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.sales', 'sales')
      .leftJoinAndSelect('customer.department', 'department')
      .leftJoinAndSelect('customer.campus', 'campus')
      .orderBy('customer.createTime', 'DESC');

    // 应用筛选条件（复用findAll的筛选逻辑）
    if (queryDto.keyword) {
      queryBuilder.andWhere(
        '(customer.realName LIKE :keyword OR customer.wechatNickname LIKE :keyword OR customer.phone LIKE :keyword OR customer.wechatId LIKE :keyword)',
        { keyword: `%${queryDto.keyword}%` },
      );
    }

    if (queryDto.lifecycleStage) {
      queryBuilder.andWhere('customer.lifecycleStage = :lifecycleStage', {
        lifecycleStage: queryDto.lifecycleStage,
      });
    }

    if (queryDto.customerIntent) {
      queryBuilder.andWhere('customer.customerIntent = :customerIntent', {
        customerIntent: queryDto.customerIntent,
      });
    }

    if (queryDto.source) {
      queryBuilder.andWhere('customer.source = :source', {
        source: queryDto.source,
      });
    }

    if (queryDto.salesId) {
      queryBuilder.andWhere('customer.salesId = :salesId', {
        salesId: queryDto.salesId,
      });
    }

    if (queryDto.campusId) {
      queryBuilder.andWhere('customer.campusId = :campusId', {
        campusId: queryDto.campusId,
      });
    }

    // 数据权限过滤
    if (dataScope) {
      if (dataScope.salesIds && dataScope.salesIds.length > 0) {
        queryBuilder.andWhere('customer.salesId IN (:...salesIds)', {
          salesIds: dataScope.salesIds,
        });
      }
      if (dataScope.departmentIds && dataScope.departmentIds.length > 0) {
        queryBuilder.andWhere('customer.departmentId IN (:...departmentIds)', {
          departmentIds: dataScope.departmentIds,
        });
      }
      if (dataScope.campusIds && dataScope.campusIds.length > 0) {
        queryBuilder.andWhere('customer.campusId IN (:...campusIds)', {
          campusIds: dataScope.campusIds,
        });
      }
    }

    return queryBuilder.getMany();
  }

  /**
   * 生成客户导入模板
   */
  async generateImportTemplate(): Promise<Buffer> {
    try {
      // 定义模板列
      const templateHeaders = [
        '客户姓名*',
        '微信昵称',
        '微信号*',
        '手机号',
        '性别',
        '年龄',
        '生命周期阶段',
        '客户意向',
        '意向产品',
        '客户来源',
        '客户标签',
        '预计成交金额',
        '下次跟进时间',
        '备注',
      ];

      // 添加说明行
      const instructions = [
        '张三',
        '微信名',
        'wechat123',
        '13800138000',
        '男',
        '30',
        '意向客户',
        '高意向',
        '少儿编程',
        '线上推广',
        '高意向,教育重视',
        '15000',
        '2025-01-20',
        '通过朋友推荐',
      ];

      const remarks = [
        '必填',
        '可选',
        '必填，唯一标识',
        '可选',
        '男/女',
        '数字',
        '未分级/待跟进/意向客户/高意向/试听中/已成交/已流失',
        '无意向/低意向/中意向/高意向',
        '可选',
        '线上推广/线下活动/老客转介绍/其他',
        '多个标签用逗号分隔',
        '数字',
        '格式：YYYY-MM-DD',
        '可选',
      ];

      // 创建工作簿
      const data = [templateHeaders, instructions, remarks];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '客户导入模板');

      // 设置列宽
      const columnWidths = [
        { wch: 12 },  // 客户姓名
        { wch: 12 },  // 微信昵称
        { wch: 15 },  // 微信号
        { wch: 12 },  // 手机号
        { wch: 6 },   // 性别
        { wch: 6 },   // 年龄
        { wch: 15 },  // 生命周期阶段
        { wch: 10 },  // 客户意向
        { wch: 15 },  // 意向产品
        { wch: 12 },  // 客户来源
        { wch: 20 },  // 客户标签
        { wch: 12 },  // 预计成交金额
        { wch: 15 },  // 下次跟进时间
        { wch: 20 },  // 备注
      ];
      worksheet['!cols'] = columnWidths;

      // 设置第一行样式（表头）
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'DDDDDD' } },
        };
      }

      // 生成Buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      this.logger.log('生成客户导入模板成功');

      return buffer;
    } catch (error) {
      this.logger.error(`生成导入模板失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从Excel导入客户数据
   */
  async importFromExcel(file: Express.Multer.File, user: any) {
    try {
      if (!file) {
        throw new BadRequestException('请上传Excel文件');
      }

      // 解析Excel文件
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // 验证数据
      if (data.length < 2) {
        throw new BadRequestException('Excel文件没有数据');
      }

      const headers = data[0] as string[];
      const rows = data.slice(1); // 跳过表头

      // 验证表头
      const requiredHeaders = ['客户姓名*', '微信号*'];
      const missingHeaders = requiredHeaders.filter(
        h => !headers.some(header => header && header.includes(h.replace('*', ''))),
      );
      if (missingHeaders.length > 0) {
        throw new BadRequestException(`缺少必需列: ${missingHeaders.join(', ')}`);
      }

      // 解析数据
      const customers = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any[];
        const rowNum = i + 2; // Excel行号（从1开始，跳过表头）

        // 跳过空行和示例行
        if (!row || row.length === 0 || !row[0]) continue;
        if (row[0] === '张三' || row[0] === '必填') continue; // 跳过示例和说明行

        try {
          const customerData: any = {
            realName: row[0],
            wechatNickname: row[1],
            wechatId: row[2],
            phone: row[3],
            gender: row[4],
            age: row[5] ? parseInt(row[5]) : null,
            lifecycleStage: row[6] || '未分级',
            customerIntent: row[7] || '无意向',
            intentProduct: row[8],
            source: row[9] || '其他',
            tags: row[10] ? row[10].split(',').map((t: string) => t.trim()) : [],
            estimatedAmount: row[11] ? parseFloat(row[11]) : null,
            nextFollowTime: row[12] ? new Date(row[12]) : null,
            remark: row[13],
            salesId: user.userId,
            departmentId: user.departmentId,
            campusId: user.campusId,
          };

          // 验证必填字段
          if (!customerData.realName) {
            errors.push({ row: rowNum, error: '客户姓名不能为空' });
            continue;
          }
          if (!customerData.wechatId) {
            errors.push({ row: rowNum, error: '微信号不能为空' });
            continue;
          }

          // 检查微信号是否已存在
          const existing = await this.customerRepository.findOne({
            where: { wechatId: customerData.wechatId },
          });
          if (existing) {
            errors.push({ row: rowNum, error: `微信号${customerData.wechatId}已存在` });
            continue;
          }

          customers.push(customerData);
        } catch (error) {
          errors.push({ row: rowNum, error: error.message });
        }
      }

      // 批量创建客户
      let successCount = 0;
      if (customers.length > 0) {
        const created = await this.customerRepository.save(customers);
        successCount = created.length;
        this.logger.log(`批量导入客户成功: ${successCount}条`);
      }

      return {
        success: true,
        message: `成功导入${successCount}条客户数据`,
        successCount,
        errorCount: errors.length,
        errors: errors.slice(0, 100), // 最多返回100条错误
        totalRows: rows.length,
      };
    } catch (error) {
      this.logger.error(`导入客户失败: ${error.message}`);
      throw error;
    }
  }
}
