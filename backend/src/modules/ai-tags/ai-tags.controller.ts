import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiTagsService } from './ai-tags.service';
import { CreateTagDto, QueryTagsDto } from './dto/tag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('AI客户标签')
@ApiBearerAuth()
@Controller('ai-tags')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AiTagsController {
  constructor(private readonly aiTagsService: AiTagsService) {}

  @Post()
  @ApiOperation({ summary: '手动添加标签' })
  @RequirePermissions('ai:tag:edit')
  async create(@Body() createTagDto: CreateTagDto, @Request() req) {
    return this.aiTagsService.create(createTagDto, req.user.id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: '获取客户的所有标签' })
  @RequirePermissions('ai:tag:view')
  async findByCustomer(@Param('customerId') customerId: number) {
    return this.aiTagsService.findByCustomer(customerId);
  }

  @Get('list')
  @ApiOperation({ summary: '查询标签列表' })
  @RequirePermissions('ai:tag:view')
  async findAll(@Query() query: QueryTagsDto) {
    return this.aiTagsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取标签统计' })
  @RequirePermissions('ai:tag:view')
  async getStatistics(@Query('customerId') customerId?: number) {
    return this.aiTagsService.getStatistics(customerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除标签' })
  @RequirePermissions('ai:tag:edit')
  async remove(@Param('id') id: number) {
    return this.aiTagsService.remove(id);
  }
}
