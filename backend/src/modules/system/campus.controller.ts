import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@ApiTags('校区管理')
@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post()
  @ApiOperation({ summary: '创建校区' })
  async create(@Body() createCampusDto: CreateCampusDto) {
    return this.campusService.create(createCampusDto);
  }

  @Get()
  @ApiOperation({ summary: '获取校区列表' })
  async findAll() {
    return this.campusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取校区详情' })
  async findOne(@Param('id') id: string) {
    return this.campusService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新校区' })
  async update(
    @Param('id') id: string,
    @Body() updateCampusDto: UpdateCampusDto,
  ) {
    return this.campusService.update(+id, updateCampusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除校区' })
  async remove(@Param('id') id: string) {
    return this.campusService.remove(+id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: '切换校区状态' })
  async toggleStatus(@Param('id') id: string) {
    return this.campusService.toggleStatus(+id);
  }
}
