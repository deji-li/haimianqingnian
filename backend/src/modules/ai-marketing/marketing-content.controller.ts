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
import { MarketingContentService } from './marketing-content.service';
import {
  CreateMarketingContentDto,
  UpdateMarketingContentDto,
  QueryMarketingContentDto,
  RecordUsageDto,
} from './dto/marketing-content.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('AI营销文案库')
@Controller('ai-marketing/content')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MarketingContentController {
  constructor(private readonly contentService: MarketingContentService) {}

  @Post()
  @ApiOperation({ summary: '保存文案到文案库' })
  @RequirePermissions('ai-marketing:use')
  async create(@Request() req, @Body() dto: CreateMarketingContentDto) {
    return this.contentService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取文案列表' })
  @RequirePermissions('ai-marketing:use')
  async findAll(@Request() req, @Query() query: QueryMarketingContentDto) {
    return this.contentService.findAll(req.user.userId, query, req.user.role);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取统计数据' })
  @RequirePermissions('ai-marketing:use')
  async getStatistics(@Request() req) {
    return this.contentService.getStatistics(req.user.userId, req.user.role);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取所有分类' })
  @RequirePermissions('ai-marketing:use')
  async getCategories(@Request() req) {
    return this.contentService.getCategories(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个文案详情' })
  @RequirePermissions('ai-marketing:use')
  async findOne(@Param('id') id: number) {
    return this.contentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文案' })
  @RequirePermissions('ai-marketing:use')
  async update(@Param('id') id: number, @Body() dto: UpdateMarketingContentDto) {
    return this.contentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文案' })
  @RequirePermissions('ai-marketing:use')
  async remove(@Param('id') id: number) {
    return this.contentService.remove(id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: '切换收藏状态' })
  @RequirePermissions('ai-marketing:use')
  async toggleFavorite(@Param('id') id: number) {
    return this.contentService.toggleFavorite(id);
  }

  @Post(':id/usage')
  @ApiOperation({ summary: '记录使用' })
  @RequirePermissions('ai-marketing:use')
  async recordUsage(@Param('id') id: number, @Body() dto: RecordUsageDto) {
    return this.contentService.recordUsage(id, dto);
  }
}
