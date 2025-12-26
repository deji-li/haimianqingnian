import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService, CreateUserDto, UpdateUserDto, QueryUserDto } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { Log } from '../log/decorators/log.decorator';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermissions('user:create')
  @Log('用户管理', '创建用户')
  @ApiOperation({ summary: '创建用户' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RequirePermissions('user:view')
  @ApiOperation({ summary: '获取用户列表' })
  findAll(@Query() queryDto: QueryUserDto) {
    return this.userService.findAll(queryDto);
  }

  @Get(':id')
  @RequirePermissions('user:view')
  @ApiOperation({ summary: '获取用户详情' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('user:update')
  @Log('用户管理', '更新用户')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('user:delete')
  @Log('用户管理', '删除用户')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post(':id/reset-password')
  @RequirePermissions('user:reset-password')
  @Log('用户管理', '重置密码')
  @ApiOperation({ summary: '重置密码' })
  resetPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    return this.userService.resetPassword(+id, body.newPassword);
  }

  @Post(':id/change-password')
  @ApiOperation({ summary: '修改密码' })
  changePassword(
    @Param('id') id: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(
      +id,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Post('change-password')
  @Log('个人中心', '修改密码')
  @ApiOperation({ summary: '修改当前用户密码' })
  changeMyPassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Post(':id/toggle-status')
  @RequirePermissions('user:update')
  @Log('用户管理', '切换用户状态')
  @ApiOperation({ summary: '启用/禁用用户' })
  toggleStatus(@Param('id') id: string) {
    return this.userService.toggleStatus(+id);
  }
}
