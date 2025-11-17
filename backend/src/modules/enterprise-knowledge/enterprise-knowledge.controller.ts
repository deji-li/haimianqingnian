import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EnterpriseKnowledgeService } from './enterprise-knowledge.service';
import { KnowledgeUsageService } from './knowledge-usage.service';
import {
  CreateKnowledgeDto,
  UpdateKnowledgeDto,
  QueryKnowledgeDto,
  IntelligentSearchDto,
  BatchImportKnowledgeDto,
} from './dto/knowledge.dto';

@ApiTags('企业知识库')
@Controller('enterprise-knowledge')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnterpriseKnowledgeController {
  constructor(
    private readonly enterpriseKnowledgeService: EnterpriseKnowledgeService,
    private readonly knowledgeUsageService: KnowledgeUsageService,
  ) {}

  /**
   * 创建知识库条目
   */
  @Post()
  @ApiOperation({ summary: '创建知识库条目' })
  async create(@Body() createDto: CreateKnowledgeDto, @Request() req) {
    return await this.enterpriseKnowledgeService.create(createDto, req.user.userId);
  }

  /**
   * 更新知识库条目
   */
  @Put(':id')
  @ApiOperation({ summary: '更新知识库条目' })
  async update(@Param('id') id: number, @Body() updateDto: UpdateKnowledgeDto) {
    return await this.enterpriseKnowledgeService.update(id, updateDto);
  }

  /**
   * 删除知识库条目
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除知识库条目' })
  async remove(@Param('id') id: number) {
    return await this.enterpriseKnowledgeService.remove(id);
  }

  /**
   * 查询知识库列表
   */
  @Get('list')
  @ApiOperation({ summary: '查询知识库列表' })
  async findAll(@Query() query: QueryKnowledgeDto) {
    return await this.enterpriseKnowledgeService.findAll(query);
  }

  /**
   * 智能搜索知识库
   */
  @Post('intelligent-search')
  @ApiOperation({ summary: '智能搜索知识库（AI语义匹配）' })
  async intelligentSearch(@Body() searchDto: IntelligentSearchDto) {
    return await this.enterpriseKnowledgeService.intelligentSearch(searchDto);
  }

  /**
   * 批量导入知识库
   */
  @Post('batch-import')
  @ApiOperation({ summary: '批量导入知识库' })
  async batchImport(@Body() batchDto: BatchImportKnowledgeDto, @Request() req) {
    return await this.enterpriseKnowledgeService.batchImport(batchDto, req.user.userId);
  }

  /**
   * 获取分类统计
   */
  @Get('categories')
  @ApiOperation({ summary: '获取知识库分类统计' })
  async getCategories() {
    return await this.enterpriseKnowledgeService.getCategories();
  }

  /**
   * 获取统计概览
   */
  @Get('stats/overview')
  @ApiOperation({ summary: '获取知识库统计概览' })
  async getOverview() {
    return await this.enterpriseKnowledgeService.getOverview();
  }

  /**
   * 获取单条知识库使用统计
   */
  @Get('usage/stats/:id')
  @ApiOperation({ summary: '获取单条知识库使用统计（使用次数、场景分布、趋势等）' })
  async getKnowledgeUsageStats(@Param('id') id: number) {
    return await this.knowledgeUsageService.getUsageStats(id);
  }

  /**
   * 获取全局使用统计
   */
  @Get('usage/global-stats')
  @ApiOperation({ summary: '获取全局使用统计（总使用量、今日使用、趋势等）' })
  async getGlobalUsageStats() {
    return await this.knowledgeUsageService.getGlobalUsageStats();
  }

  /**
   * 获取热门知识Top10
   */
  @Get('usage/hot-knowledge')
  @ApiOperation({ summary: '获取热门知识库Top10' })
  async getHotKnowledge() {
    return await this.knowledgeUsageService.getHotKnowledge(10);
  }

  /**
   * 获取单个知识库详情
   * 注意：这个路由必须放在最后，因为 :id 是通配符，会匹配所有路径
   */
  @Get(':id')
  @ApiOperation({ summary: '获取知识库详情' })
  async findOne(@Param('id') id: number) {
    return await this.enterpriseKnowledgeService.findOne(id);
  }
}
