import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campus } from './entities/campus.entity';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@Injectable()
export class CampusService {
  constructor(
    @InjectRepository(Campus)
    private campusRepository: Repository<Campus>,
  ) {}

  // 创建校区
  async create(createCampusDto: CreateCampusDto) {
    // 检查校区编码是否重复
    const existingByCode = await this.campusRepository.findOne({
      where: { campusCode: createCampusDto.campusCode },
    });

    if (existingByCode) {
      throw new ConflictException('校区编码已存在');
    }

    // 检查校区名称是否重复
    const existingByName = await this.campusRepository.findOne({
      where: { campusName: createCampusDto.campusName },
    });

    if (existingByName) {
      throw new ConflictException('校区名称已存在');
    }

    const campus = this.campusRepository.create(createCampusDto);
    return await this.campusRepository.save(campus);
  }

  // 获取所有校区
  async findAll() {
    const campuses = await this.campusRepository.find({
      order: { sort: 'ASC', id: 'ASC' },
    });

    // 获取校区负责人信息
    const campusesWithManager = await Promise.all(
      campuses.map(async (campus) => {
        let managerName = null;
        if (campus.managerId) {
          const result = await this.campusRepository.query(
            'SELECT real_name FROM users WHERE id = ?',
            [campus.managerId],
          );
          if (result.length > 0) {
            managerName = result[0].real_name;
          }
        }
        return {
          ...campus,
          managerName,
        };
      }),
    );

    return campusesWithManager;
  }

  // 获取校区详情
  async findOne(id: number) {
    const campus = await this.campusRepository.findOne({
      where: { id },
    });

    if (!campus) {
      throw new NotFoundException('校区不存在');
    }

    // 获取负责人信息
    let managerName = null;
    if (campus.managerId) {
      const result = await this.campusRepository.query(
        'SELECT real_name FROM users WHERE id = ?',
        [campus.managerId],
      );
      if (result.length > 0) {
        managerName = result[0].real_name;
      }
    }

    return {
      ...campus,
      managerName,
    };
  }

  // 更新校区
  async update(id: number, updateCampusDto: UpdateCampusDto) {
    const campus = await this.campusRepository.findOne({
      where: { id },
    });

    if (!campus) {
      throw new NotFoundException('校区不存在');
    }

    // 检查校区编码是否重复
    if (
      updateCampusDto.campusCode &&
      updateCampusDto.campusCode !== campus.campusCode
    ) {
      const existingByCode = await this.campusRepository.findOne({
        where: { campusCode: updateCampusDto.campusCode },
      });

      if (existingByCode) {
        throw new ConflictException('校区编码已存在');
      }
    }

    // 检查校区名称是否重复
    if (
      updateCampusDto.campusName &&
      updateCampusDto.campusName !== campus.campusName
    ) {
      const existingByName = await this.campusRepository.findOne({
        where: { campusName: updateCampusDto.campusName },
      });

      if (existingByName && existingByName.id !== id) {
        throw new ConflictException('校区名称已存在');
      }
    }

    Object.assign(campus, updateCampusDto);
    return await this.campusRepository.save(campus);
  }

  // 删除校区
  async remove(id: number) {
    const campus = await this.campusRepository.findOne({
      where: { id },
    });

    if (!campus) {
      throw new NotFoundException('校区不存在');
    }

    // 检查是否有员工
    const userCount = await this.campusRepository.query(
      'SELECT COUNT(*) as count FROM users WHERE campus_id = ?',
      [id],
    );

    if (userCount[0].count > 0) {
      throw new ConflictException('该校区下有员工，无法删除');
    }

    // 检查是否有订单
    const orderCount = await this.campusRepository.query(
      'SELECT COUNT(*) as count FROM orders WHERE campus_id = ?',
      [id],
    );

    if (orderCount[0].count > 0) {
      throw new ConflictException('该校区下有订单，无法删除');
    }

    await this.campusRepository.remove(campus);
    return { message: '删除成功' };
  }

  // 切换状态
  async toggleStatus(id: number) {
    const campus = await this.campusRepository.findOne({
      where: { id },
    });

    if (!campus) {
      throw new NotFoundException('校区不存在');
    }

    campus.status = campus.status === 1 ? 0 : 1;
    return await this.campusRepository.save(campus);
  }
}
