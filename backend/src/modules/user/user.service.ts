import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UserCampus } from './entities/user-campus.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  username: string;
  password: string;
  realName: string;
  roleCode: string;
  departmentId?: number;
  campusId?: number;
  campusIds?: number[];
  phone?: string;
  email?: string;
  status?: number;
}

export interface UpdateUserDto {
  realName?: string;
  roleCode?: string;
  departmentId?: number;
  campusId?: number;
  campusIds?: number[];
  phone?: string;
  email?: string;
  avatar?: string;
  status?: number;
}

export interface QueryUserDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  roleCode?: string;
  status?: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserCampus)
    private userCampusRepository: Repository<UserCampus>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto) {
    // 检查用户名是否存在
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 根据 roleCode 查询 roleId
    let roleId: number | undefined;
    if (createUserDto.roleCode) {
      const roleResult = await this.userRepository.query(
        'SELECT id FROM roles WHERE code = ?',
        [createUserDto.roleCode],
      );
      if (roleResult.length === 0) {
        throw new NotFoundException('角色不存在');
      }
      roleId = roleResult[0].id;
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 提取campusIds，不保存到user表
    const { roleCode, campusIds, ...userData } = createUserDto;
    const user = this.userRepository.create({
      ...userData,
      roleId,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // 处理多校区绑定
    if (campusIds && campusIds.length > 0) {
      for (let i = 0; i < campusIds.length; i++) {
        const userCampus = this.userCampusRepository.create({
          userId: savedUser.id,
          campusId: campusIds[i],
          isPrimary: i === 0 ? 1 : 0, // 第一个为主校区
        });
        await this.userCampusRepository.save(userCampus);
      }
    }

    // 返回时移除密码
    delete savedUser.password;
    return savedUser;
  }

  /**
   * 分页查询用户列表
   */
  async findAll(queryDto: QueryUserDto) {
    const { page = 1, pageSize = 20, keyword, roleCode, status } = queryDto;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('roles', 'role', 'role.id = user.role_id')
      .leftJoin('department', 'dept', 'dept.id = user.department_id')
      .leftJoin('campus', 'campus', 'campus.id = user.campus_id')
      .addSelect('role.name', 'roleName')
      .addSelect('role.code', 'roleCode')
      .addSelect('dept.department_name', 'departmentName')
      .addSelect('campus.campus_name', 'campusName');

    // 关键词搜索
    if (keyword) {
      qb.andWhere(
        '(user.username LIKE :keyword OR user.real_name LIKE :keyword OR user.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 角色筛选
    if (roleCode) {
      qb.andWhere('role.code = :roleCode', { roleCode });
    }

    // 状态筛选
    if (status !== undefined) {
      qb.andWhere('user.status = :status', { status });
    }

    // 分页
    const total = await qb.getCount();
    qb.skip((page - 1) * pageSize).take(pageSize);

    // 排序
    qb.orderBy('user.create_time', 'DESC');

    const rawResults = await qb.getRawMany();

    // 格式化结果
    const list = await Promise.all(
      rawResults.map(async (raw) => {
        // 查询用户关联的所有校区
        const userCampuses = await this.userCampusRepository.find({
          where: { userId: raw.user_id },
        });
        const campusIds = userCampuses.map((uc) => uc.campusId);

        return {
          id: raw.user_id,
          username: raw.user_username,
          realName: raw.user_real_name,
          roleCode: raw.user_role_code,
          departmentId: raw.user_department_id,
          campusId: raw.user_campus_id,
          campusIds: campusIds,
          phone: raw.user_phone,
          email: raw.user_email,
          status: raw.user_status,
          createTime: raw.user_create_time,
          updateTime: raw.user_update_time,
          roleName: raw.roleName,
          departmentName: raw.departmentName,
          campusName: raw.campusName,
        };
      }),
    );

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取用户详情
   */
  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    delete user.password;
    return user;
  }

  /**
   * 更新用户
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果有 roleCode，转换为 roleId
    let roleId: number | undefined;
    if (updateUserDto.roleCode) {
      const roleResult = await this.userRepository.query(
        'SELECT id FROM roles WHERE code = ?',
        [updateUserDto.roleCode],
      );
      if (roleResult.length === 0) {
        throw new NotFoundException('角色不存在');
      }
      roleId = roleResult[0].id;
    }

    // 提取campusIds，不保存到user表
    const { roleCode, campusIds, ...userData } = updateUserDto;
    Object.assign(user, userData);
    if (roleId !== undefined) {
      user.roleId = roleId;
    }

    await this.userRepository.save(user);

    // 处理多校区绑定更新
    if (campusIds !== undefined) {
      // 删除现有绑定
      await this.userCampusRepository.delete({ userId: id });

      // 创建新绑定
      if (campusIds.length > 0) {
        for (let i = 0; i < campusIds.length; i++) {
          const userCampus = this.userCampusRepository.create({
            userId: id,
            campusId: campusIds[i],
            isPrimary: i === 0 ? 1 : 0,
          });
          await this.userCampusRepository.save(userCampus);
        }
      }
    }

    delete user.password;
    return user;
  }

  /**
   * 删除用户
   */
  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.remove(user);
    return { message: '删除成功' };
  }

  /**
   * 重置密码
   */
  async resetPassword(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
    return { message: '密码重置成功' };
  }

  /**
   * 修改密码
   */
  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('原密码错误');
    }

    // 设置新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
    return { message: '密码修改成功' };
  }

  /**
   * 启用/禁用用户
   */
  async toggleStatus(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.status = user.status === 1 ? 0 : 1;
    await this.userRepository.save(user);

    return { message: user.status === 1 ? '用户已启用' : '用户已禁用' };
  }
}
