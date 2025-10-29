import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // 系统内置角色，不能删除
  private readonly SYSTEM_ROLES = ['admin', 'sales_manager', 'sales', 'campus_manager', 'operator', 'finance'];

  // 创建角色
  async create(createRoleDto: CreateRoleDto) {
    // 检查角色标识是否已存在
    const existingByCode = await this.roleRepository.findOne({
      where: { code: createRoleDto.code },
    });

    if (existingByCode) {
      throw new ConflictException('角色标识已存在');
    }

    // 检查角色名称是否已存在
    const existingByName = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingByName) {
      throw new ConflictException('角色名称已存在');
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  // 获取所有角色
  async findAll() {
    const roles = await this.roleRepository.find({
      order: { id: 'ASC' },
    });

    // 添加 isSystem 标识和字段映射
    return roles.map((role) => ({
      id: role.id,
      roleName: role.name,
      roleKey: role.code,
      status: role.status,
      remark: role.description,
      isSystem: this.SYSTEM_ROLES.includes(role.code),
      createTime: role.createTime,
      updateTime: role.updateTime,
    }));
  }

  // 获取角色详情
  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 统计使用该角色的用户数
    const userCount = await this.roleRepository.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id],
    );

    return {
      id: role.id,
      roleName: role.name,
      roleKey: role.code,
      status: role.status,
      remark: role.description,
      isSystem: this.SYSTEM_ROLES.includes(role.code),
      userCount: userCount[0].count,
      createTime: role.createTime,
      updateTime: role.updateTime,
    };
  }

  // 更新角色
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 系统角色不能修改标识
    if (this.SYSTEM_ROLES.includes(role.code) && updateRoleDto.code) {
      throw new ConflictException('系统角色不能修改标识');
    }

    // 检查角色标识是否与其他角色重复
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingByCode = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code },
      });

      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException('角色标识已被使用');
      }
    }

    // 检查角色名称是否与其他角色重复
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingByName = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingByName && existingByName.id !== id) {
        throw new ConflictException('角色名称已被使用');
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  // 删除角色
  async remove(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 系统角色不能删除
    if (this.SYSTEM_ROLES.includes(role.code)) {
      throw new ConflictException('系统角色不能删除');
    }

    // 检查是否有用户使用该角色
    const userCount = await this.roleRepository.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id],
    );

    if (userCount[0].count > 0) {
      throw new ConflictException('该角色下有用户，无法删除');
    }

    await this.roleRepository.remove(role);
    return { message: '删除成功' };
  }

  // 切换角色状态
  async toggleStatus(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    role.status = role.status === 1 ? 0 : 1;
    return await this.roleRepository.save(role);
  }

  // 更新角色状态（用于前端 Switch 组件）
  async updateStatus(id: number, status: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    role.status = status;
    return await this.roleRepository.save(role);
  }
}
