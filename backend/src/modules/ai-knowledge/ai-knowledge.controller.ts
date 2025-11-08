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
import { AiKnowledgeService } from './ai-knowledge.service';
import {
  CreateKnowledgeDto,
  UpdateKnowledgeDto,
  QueryKnowledgeDto,
  SearchKnowledgeDto,
} from './dto/knowledge.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('AI知识库')
@ApiBearerAuth()
@Controller('ai-knowledge')
@UseGuards(JwtAuthGuard)
export class AiKnowledgeController {
  constructor(private readonly aiKnowledgeService: AiKnowledgeService) {}

  @Post()
  @ApiOperation({ summary: '创建知识库条目' })
  @RequirePermissions('ai:knowledge:create')
  async create(@Body() createDto: CreateKnowledgeDto, @Request() req) {
    return this.aiKnowledgeService.create(createDto, req.user.id);
  }

  @Post('batch-import')
  @ApiOperation({ summary: '批量导入知识库' })
  @RequirePermissions('ai:knowledge:create')
  async batchImport(@Body() knowledgeList: CreateKnowledgeDto[], @Request() req) {
    return this.aiKnowledgeService.batchImport(knowledgeList, req.user.id);
  }

  @Post('search')
  @ApiOperation({ summary: 'AI智能搜索知识库' })
  @RequirePermissions('ai:knowledge:view')
  async intelligentSearch(@Body() searchDto: SearchKnowledgeDto) {
    return this.aiKnowledgeService.intelligentSearch(searchDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取知识库列表' })
  @RequirePermissions('ai:knowledge:view')
  async findAll(@Query() query: QueryKnowledgeDto) {
    return this.aiKnowledgeService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取知识库分类' })
  @RequirePermissions('ai:knowledge:view')
  async getCategories() {
    return this.aiKnowledgeService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取知识库条目详情' })
  @RequirePermissions('ai:knowledge:view')
  async findOne(@Param('id') id: number) {
    return this.aiKnowledgeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新知识库条目' })
  @RequirePermissions('ai:knowledge:edit')
  async update(@Param('id') id: number, @Body() updateDto: UpdateKnowledgeDto) {
    return this.aiKnowledgeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除知识库条目' })
  @RequirePermissions('ai:knowledge:delete')
  async remove(@Param('id') id: number) {
    return this.aiKnowledgeService.remove(id);
  }
}
