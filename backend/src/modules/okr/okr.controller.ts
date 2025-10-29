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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OkrService } from './okr.service';
import { CreateOkrDto } from './dto/create-okr.dto';
import { UpdateOkrDto } from './dto/update-okr.dto';
import { QueryOkrDto } from './dto/query-okr.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DataScopeGuard } from '../../common/guards/data-scope.guard';

@ApiTags('OKR管理')
@Controller('okr')
@UseGuards(JwtAuthGuard, DataScopeGuard)
@ApiBearerAuth()
export class OkrController {
  constructor(private readonly okrService: OkrService) {}

  @Post()
  @ApiOperation({ summary: '创建OKR' })
  async create(@Body() createOkrDto: CreateOkrDto) {
    return this.okrService.create(createOkrDto);
  }

  @Get()
  @ApiOperation({ summary: '获取OKR列表' })
  async findAll(@Query() queryDto: QueryOkrDto, @Request() req) {
    return this.okrService.findAll(queryDto, req.dataScope);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取OKR统计' })
  @ApiQuery({ name: 'userId', required: false })
  async getStatistics(@Query('userId') userId?: number) {
    return this.okrService.getStatistics(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取OKR详情' })
  async findOne(@Param('id') id: string) {
    return this.okrService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新OKR' })
  async update(@Param('id') id: string, @Body() updateOkrDto: UpdateOkrDto) {
    return this.okrService.update(+id, updateOkrDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除OKR' })
  async remove(@Param('id') id: string) {
    return this.okrService.remove(+id);
  }

  @Put('key-result/:id')
  @ApiOperation({ summary: '更新关键结果' })
  async updateKeyResult(
    @Param('id') id: string,
    @Body() updateDto: UpdateKeyResultDto,
  ) {
    return this.okrService.updateKeyResult(+id, updateDto);
  }

  @Post(':id/key-result')
  @ApiOperation({ summary: '添加关键结果' })
  async addKeyResult(
    @Param('id') id: string,
    @Body() body: { description: string; targetValue: number; unit?: string; weight?: number },
  ) {
    return this.okrService.addKeyResult(
      +id,
      body.description,
      body.targetValue,
      body.unit,
      body.weight,
    );
  }

  @Delete('key-result/:id')
  @ApiOperation({ summary: '删除关键结果' })
  async removeKeyResult(@Param('id') id: string) {
    return this.okrService.removeKeyResult(+id);
  }
}
