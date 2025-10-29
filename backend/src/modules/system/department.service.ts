import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  // 创建部门
  async create(createDepartmentDto: CreateDepartmentDto) {
    // 检查同级部门名称是否重复
    const existing = await this.departmentRepository.findOne({
      where: {
        departmentName: createDepartmentDto.departmentName,
        parentId: createDepartmentDto.parentId || null,
      },
    });

    if (existing) {
      throw new ConflictException('同级部门名称已存在');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  // 获取所有部门（树形结构）
  async findAll() {
    const departments = await this.departmentRepository.find({
      order: { sort: 'ASC', id: 'ASC' },
    });

    // 获取部门负责人信息
    const departmentsWithManager = await Promise.all(
      departments.map(async (dept) => {
        let managerName = null;
        if (dept.managerId) {
          const result = await this.departmentRepository.query(
            'SELECT real_name FROM users WHERE id = ?',
            [dept.managerId],
          );
          if (result.length > 0) {
            managerName = result[0].real_name;
          }
        }
        return {
          ...dept,
          managerName,
        };
      }),
    );

    // 构建树形结构
    return this.buildTree(departmentsWithManager, null);
  }

  // 构建树形结构
  private buildTree(departments: any[], parentId: number | null): any[] {
    return departments
      .filter((dept) => dept.parentId === parentId)
      .map((dept) => ({
        ...dept,
        children: this.buildTree(departments, dept.id),
      }));
  }

  // 获取部门详情
  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('部门不存在');
    }

    // 获取负责人信息
    let managerName = null;
    if (department.managerId) {
      const result = await this.departmentRepository.query(
        'SELECT real_name FROM user WHERE id = ?',
        [department.managerId],
      );
      if (result.length > 0) {
        managerName = result[0].real_name;
      }
    }

    return {
      ...department,
      managerName,
    };
  }

  // 更新部门
  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('部门不存在');
    }

    // 检查是否修改了名称，如果修改了需要检查重复
    if (
      updateDepartmentDto.departmentName &&
      updateDepartmentDto.departmentName !== department.departmentName
    ) {
      const existing = await this.departmentRepository.findOne({
        where: {
          departmentName: updateDepartmentDto.departmentName,
          parentId: updateDepartmentDto.parentId ?? department.parentId,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('同级部门名称已存在');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  // 删除部门
  async remove(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('部门不存在');
    }

    // 检查是否有子部门
    const childCount = await this.departmentRepository.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new ConflictException('该部门下有子部门，无法删除');
    }

    // 检查是否有员工
    const userCount = await this.departmentRepository.query(
      'SELECT COUNT(*) as count FROM users WHERE department_id = ?',
      [id],
    );

    if (userCount[0].count > 0) {
      throw new ConflictException('该部门下有员工，无法删除');
    }

    await this.departmentRepository.remove(department);
    return { message: '删除成功' };
  }

  // 切换状态
  async toggleStatus(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('部门不存在');
    }

    department.status = department.status === 1 ? 0 : 1;
    return await this.departmentRepository.save(department);
  }
}
