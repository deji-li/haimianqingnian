import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('字典管理')
@Controller('dictionary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Post()
  @ApiOperation({ summary: '创建字典项' })
  create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionaryService.create(createDictionaryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有字典项' })
  findAll() {
    return this.dictionaryService.findAll();
  }

  @Get('type/:type')
  @ApiOperation({ summary: '根据类型获取字典项' })
  findByType(@Param('type') type: string) {
    return this.dictionaryService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取字典详情' })
  findOne(@Param('id') id: string) {
    return this.dictionaryService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新字典项' })
  update(
    @Param('id') id: string,
    @Body() updateDictionaryDto: UpdateDictionaryDto,
  ) {
    return this.dictionaryService.update(+id, updateDictionaryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除字典项' })
  remove(@Param('id') id: string) {
    return this.dictionaryService.remove(+id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: '切换字典状态' })
  toggleStatus(@Param('id') id: string) {
    return this.dictionaryService.toggleStatus(+id);
  }

  @Post('init')
  @ApiOperation({ summary: '初始化默认字典数据' })
  initDefaultData() {
    return this.dictionaryService.initDefaultData();
  }
}
