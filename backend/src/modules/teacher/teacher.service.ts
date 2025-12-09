import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource, In } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { TeacherCampus } from './entities/teacher-campus.entity';
import { Campus } from '../system/entities/campus.entity';

@Injectable()
export class TeacherService {
  private readonly logger = new Logger(TeacherService.name);

  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherCampus)
    private readonly teacherCampusRepository: Repository<TeacherCampus>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建或查找老师（用于订单同步）
   */
  async findOrCreateTeacher(teacherData: {
    teacherId?: string;
    teacherName: string;
    campusName?: string;
    sourceSystem?: string;
  }): Promise<Teacher> {
    let teacher: Teacher;

    // 如果有老师ID，先按ID查找（映射到name字段）
    if (teacherData.teacherId) {
      teacher = await this.teacherRepository.findOne({
        where: { name: teacherData.teacherId },
      });
    }

    // 如果没找到，按姓名查找
    if (!teacher) {
      teacher = await this.teacherRepository.findOne({
        where: { name: teacherData.teacherName },
      });
    }

    // 查找校区
    let campus = null;
    if (teacherData.campusName) {
      campus = await this.campusRepository.findOne({
        where: { campusName: teacherData.campusName },
      });
    }

    if (teacher) {
      this.logger.log(`找到已有老师: ${teacher.name}`);

      // 如果找到了校区，检查是否需要添加到老师的校区列表中
      if (campus) {
        const added = await this.addCampusToTeacher(teacher.id, campus.id);
        if (added) {
          this.logger.log(`为已有老师 ${teacher.name} 添加了新校区: ${campus.campusName}`);
        }
      }

      return teacher;
    }

    // 创建新老师
    teacher = this.teacherRepository.create({
      name: teacherData.teacherId || teacherData.teacherName,
      displayName: teacherData.teacherName,
      status: '在职',
      level: '合作讲师', // 外部系统导入的老师默认为合作讲师
    });

    await this.teacherRepository.save(teacher);

    // 如果有校区，创建校区关联
    if (campus) {
      await this.addCampusToTeacher(teacher.id, campus.id);
      // 更新老师的主要校区字段
      await this.teacherRepository.update(teacher.id, {
        campusId: campus.id
      });
    }

    this.logger.log(`创建新老师: ${teacher.name} (校区: ${campus?.campusName || '未分配'})`);

    return teacher;
  }

  /**
   * 获取老师列表（包含业绩统计）
   */
  async getTeachers(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    campusId?: number;
    status?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const where: any = {};

    if (params.keyword) {
      where.name = Like(`%${params.keyword}%`);
    }
    if (params.status) {
      where.status = params.status;
    }

    // 基础查询条件
    let baseQuery = this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.campus', 'campus')
      .where(where)
      .orderBy('teacher.createTime', 'DESC');

    // 如果指定了校区ID，需要关联查询teacher_campuses表
    if (params.campusId) {
      baseQuery = baseQuery
        .innerJoin('teacher.campus', 'filter_campus', 'filter_campus.id = :campusId', { campusId: params.campusId });
    }

    const [teachers, total] = await baseQuery
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 为每个老师添加业绩统计和校区信息
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        // 获取该老师的订单统计
        const orderStats = await this.getOrderStatsForTeacher(teacher.name);

        // 获取该老师的所有校区
        const campuses = await this.getTeacherCampuses(teacher.id);

        return {
          ...teacher,
          campusName: teacher.campus?.campusName || '未分配',
          campuses: campuses, // 新增：所有关联校区
          campusIds: campuses.map(c => c.id), // 新增：校区ID数组（用于前端编辑）
          orderCount: orderStats.orderCount,
          totalSales: orderStats.totalSales,
          totalCommission: orderStats.totalCommission,
          totalProfit: orderStats.totalProfit, // 新增：总利润（销售额 - 提成）
          averageOrderValue: orderStats.averageOrderValue,
        };
      })
    );

    return {
      list: teachersWithStats,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取老师的订单统计信息
   */
  private async getOrderStatsForTeacher(teacherName: string) {
    const query = `
      SELECT
        COUNT(*) as orderCount,
        COALESCE(SUM(payment_amount), 0) as totalSales,
        COALESCE(SUM(commission_amount), 0) as totalCommission,
        COALESCE(SUM(payment_amount - COALESCE(commission_amount, 0)), 0) as totalProfit,
        COALESCE(AVG(payment_amount), 0) as averageOrderValue
      FROM orders
      WHERE (teacher_id = ? OR teacher_name = ?)
        AND is_deleted = 0
    `;

    const result = await this.dataSource.query(query, [teacherName, teacherName]);

    return {
      orderCount: parseInt(result[0]?.orderCount) || 0,
      totalSales: parseFloat(result[0]?.totalSales) || 0,
      totalCommission: parseFloat(result[0]?.totalCommission) || 0,
      totalProfit: parseFloat(result[0]?.totalProfit) || 0,
      averageOrderValue: parseFloat(result[0]?.averageOrderValue) || 0,
    };
  }

  /**
   * 获取老师排行榜
   */
  async getTeacherRanking(params: {
    type: 'commission' | 'orderCount' | 'studentCount';
    timeRange?: 'day' | 'week' | 'month' | 'year';
    campusId?: number;
    limit?: number;
  }) {
    const limit = params.limit || 20;
    const orderField = {
      commission: 'totalCommission',
      orderCount: 'totalSales', // 使用totalSales作为订单数量的替代指标
      studentCount: 'totalCommission', // 使用totalCommission作为学生数量的替代指标
    }[params.type];

    const where: any = {};
    if (params.campusId) {
      where.campusId = params.campusId;
    }

    const teachers = await this.teacherRepository.find({
      where,
      relations: ['campus'],
      order: { [orderField]: 'DESC' },
      take: limit,
    });

    return teachers.map((teacher, index) => ({
      rank: index + 1,
      teacherId: teacher.name,
      teacherName: teacher.displayName || teacher.name,
      campusName: teacher.campus?.campusName,
      value: teacher[orderField] || 0,
    }));
  }

  /**
   * 更新老师统计信息
   */
  async updateTeacherStats(teacherId: string, commissionAmount: number) {
    const teacher = await this.teacherRepository.findOne({
      where: { name: teacherId },
    });

    if (teacher) {
      teacher.totalCommission += commissionAmount;
      teacher.totalSales += commissionAmount; // 使用totalSales作为订单统计
      await this.teacherRepository.save(teacher);
      this.logger.log(`更新老师统计: ${teacher.name}, 固定提成+${commissionAmount}元, 销售+${commissionAmount}元`);
    }
  }

  /**
   * 创建老师
   */
  async createTeacher(data: Partial<Teacher>) {
    const teacher = this.teacherRepository.create(data);
    return await this.teacherRepository.save(teacher);
  }

  /**
   * 更新老师信息
   */
  async updateTeacher(id: number, data: Partial<Teacher>) {
    await this.teacherRepository.update(id, data);
    return await this.teacherRepository.findOne({ where: { id } });
  }

  /**
   * 更新老师校区关联
   */
  async updateTeacherCampuses(teacherId: number, campusIds: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取现有的校区关联
      const existingCampuses = await queryRunner.manager.query(
        `SELECT campus_id, is_primary FROM teacher_campuses WHERE teacher_id = ?`,
        [teacherId]
      );

      const existingCampusIds = existingCampuses.map(c => c.campus_id);

      if (!campusIds || campusIds.length === 0) {
        // 如果没有选择任何校区，删除所有现有校区关联
        await queryRunner.manager.query(
          `DELETE FROM teacher_campuses WHERE teacher_id = ?`,
          [teacherId]
        );
        await queryRunner.manager.update(Teacher, teacherId, { campusId: null });
      } else {
        // 1. 删除不再选择的校区
        const campusesToDelete = existingCampusIds.filter(id => !campusIds.includes(id));
        if (campusesToDelete.length > 0) {
          await queryRunner.manager.query(
            `DELETE FROM teacher_campuses WHERE teacher_id = ? AND campus_id IN (${campusesToDelete.map(() => '?').join(',')})`,
            [teacherId, ...campusesToDelete]
          );
        }

        // 2. 添加新选择的校区
        for (let i = 0; i < campusIds.length; i++) {
          const campusId = campusIds[i];
          const isPrimary = i === 0;

          // 只有当校区不存在时才添加
          if (!existingCampusIds.includes(campusId)) {
            await queryRunner.manager.query(
              `INSERT INTO teacher_campuses (teacher_id, campus_id, is_primary, create_time, update_time)
               VALUES (?, ?, ?, NOW(), NOW())`,
              [teacherId, campusId, isPrimary ? 1 : 0]
            );
          } else {
            // 如果校区已存在，更新 is_primary 状态
            await queryRunner.manager.query(
              `UPDATE teacher_campuses SET is_primary = ?, update_time = NOW()
               WHERE teacher_id = ? AND campus_id = ?`,
              [isPrimary ? 1 : 0, teacherId, campusId]
            );
          }
        }

        // 3. 更新老师表的主要校区字段（保持向后兼容）
        await queryRunner.manager.update(Teacher, teacherId, {
          campusId: campusIds[0]
        });
      }

      await queryRunner.commitTransaction();
      this.logger.log(`成功更新老师${teacherId}的校区关联：${campusIds?.join(', ') || '无'}`);

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`更新老师${teacherId}校区关联失败:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取老师的关联校区
   */
  async getTeacherCampuses(teacherId: number) {
    // 使用原生SQL查询来调试问题
    const query = `
      SELECT
        c.id as id,
        c.campus_name as campusName,
        tc.is_primary as isPrimary
      FROM teacher_campuses tc
      LEFT JOIN campus c ON tc.campus_id = c.id
      WHERE tc.teacher_id = ?
      ORDER BY tc.is_primary DESC, tc.create_time ASC
    `;

    const results = await this.dataSource.query(query, [teacherId]);

    return results.map((row: any) => ({
      id: row.id,
      campusName: row.campusName,
      isPrimary: row.isPrimary === 1
    }));
  }

  /**
   * 为老师添加校区（用于订单同步，不删除现有校区）
   */
  async addCampusToTeacher(teacherId: number, campusId: number) {
    // 检查是否已存在该校区关联
    const existing = await this.teacherCampusRepository.findOne({
      where: {
        teacher: { id: teacherId },
        campus: { id: campusId }
      }
    });

    if (existing) {
      return false; // 已存在，无需添加
    }

    // 检查该老师是否已有校区
    const existingCount = await this.teacherCampusRepository.count({
      where: { teacher: { id: teacherId } }
    });

    const newRelation = this.teacherCampusRepository.create({
      teacher: { id: teacherId },
      campus: { id: campusId },
      isPrimary: existingCount === 0 // 如果是第一个校区，设为主要校区
    });

    await this.teacherCampusRepository.save(newRelation);

    // 如果这是第一个校区，同时更新老师表的主要校区字段
    if (existingCount === 0) {
      await this.teacherRepository.update(teacherId, { campusId });
    }

    this.logger.log(`为老师${teacherId}添加校区${campusId}`);
    return true;
  }

  /**
   * 删除老师
   */
  async deleteTeacher(id: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (teacher) {
      await this.teacherRepository.remove(teacher);
      return true;
    }
    return false;
  }

  /**
   * 同步订单中的老师到老师表
   */
  async syncTeachersFromOrders() {
    // 使用原生SQL查询获取所有有teacherId但没有关联到teachers表的订单
    const query = `
      SELECT
        o.teacher_id as teacherId,
        o.teacher_name as teacherName,
        o.course_name as courseName,
        COUNT(o.id) as orderCount,
        SUM(o.payment_amount) as totalAmount
      FROM orders o
      LEFT JOIN teachers t ON t.id = o.teacher_id
      WHERE o.teacher_id IS NOT NULL AND t.id IS NULL
      GROUP BY o.teacher_id, o.teacher_name, o.course_name
    `;

    const ordersWithTeachers = await this.dataSource.query(query);

    this.logger.log(`找到 ${ordersWithTeachers.length} 个需要同步的老师`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 获取默认校区
    const defaultCampus = await this.campusRepository.findOne({ where: { id: 6 } });

    for (const teacherData of ordersWithTeachers) {
      try {
        // 从课程名称中提取科目
        let subject = teacherData.courseName;
        if (subject) {
          // 简单的科目提取逻辑
          if (subject.includes('游泳')) subject = '游泳';
          else if (subject.includes('网球')) subject = '网球';
          else if (subject.includes('古琴')) subject = '古琴';
          else if (subject.includes('音乐')) subject = '音乐';
          else if (subject.includes('舞蹈')) subject = '舞蹈';
          else if (subject.includes('化妆')) subject = '化妆';
          else if (subject.includes('咖啡')) subject = '咖啡';
          else if (subject.includes('普拉提')) subject = '普拉提';
          else if (subject.includes('调酒')) subject = '调酒';
          else if (subject.includes('收纳')) subject = '收纳';
          else if (subject.includes('书画')) subject = '书画';
          else if (subject.includes('乐器')) subject = '乐器';
          else subject = '其他';
        }

        // 设置固定提成金额（根据科目设置不同标准）
        let fixedCommissionAmount = 100; // 默认100元
        if (subject === '游泳' || subject === '网球') {
          fixedCommissionAmount = 150;
        } else if (subject === '古琴' || subject === '乐器') {
          fixedCommissionAmount = 200;
        } else if (subject === '舞蹈') {
          fixedCommissionAmount = 120;
        } else if (subject === '化妆') {
          fixedCommissionAmount = 180;
        }

        // 创建老师记录
        const newTeacher = this.teacherRepository.create({
          name: teacherData.teacherId?.toString() || teacherData.teacherName,
          displayName: teacherData.teacherName,
          subject: subject,
          level: '合作讲师',
          campusId: defaultCampus?.id,
          defaultCommissionRate: fixedCommissionAmount, // 改为固定金额
          status: '在职',
          totalSales: parseFloat(teacherData.totalAmount || 0),
          totalCommission: fixedCommissionAmount * teacherData.orderCount, // 按订单数量计算总提成
          remark: `从订单同步创建，订单数：${teacherData.orderCount}，单课提成：${fixedCommissionAmount}元`
        });

        await this.teacherRepository.save(newTeacher);
        results.success++;
        this.logger.log(`成功同步老师：${teacherData.teacherName}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `同步老师 ${teacherData.teacherName} 失败: ${error.message}`;
        results.errors.push(errorMsg);
        this.logger.error(errorMsg, error);
      }
    }

    return {
      message: `同步完成，成功 ${results.success} 个，失败 ${results.failed} 个`,
      results
    };
  }

  /**
   * 获取老师详情（包含业绩统计）
   */
  async getTeacherDetail(id: number) {
    // 获取老师基本信息
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['campus']
    });

    if (!teacher) {
      throw new Error(`老师ID ${id} 不存在`);
    }

    // 获取老师的所有校区
    const campuses = await this.getTeacherCampuses(id);

    // 获取该老师的订单统计信息
    const orderStatsQuery = `
      SELECT
        COUNT(*) as orderCount,
        SUM(payment_amount) as totalSales,
        SUM(commission_amount) as totalCommission,
        SUM(payment_amount - COALESCE(commission_amount, 0)) as totalProfit,
        AVG(payment_amount) as averageOrderValue,
        COUNT(DISTINCT customer_id) as studentCount
      FROM orders
      WHERE teacher_id = ?
      AND is_deleted = 0
    `;

    const orderStats = await this.dataSource.query(orderStatsQuery, [teacher.name]);

    const stats = orderStats[0] || {
      orderCount: 0,
      totalSales: 0,
      totalCommission: 0,
      totalProfit: 0,
      averageOrderValue: 0,
      studentCount: 0
    };

    // 获取老师教授的课程统计
    const courseStatsQuery = `
      SELECT
        course_name,
        COUNT(*) as courseOrderCount,
        SUM(payment_amount) as courseRevenue,
        SUM(commission_amount) as courseCommission,
        COUNT(DISTINCT customer_id) as courseStudentCount,
        AVG(payment_amount) as courseAvgPrice
      FROM orders
      WHERE (teacher_id = ? OR teacher_name = ?)
        AND is_deleted = 0
        AND course_name IS NOT NULL AND course_name != ''
      GROUP BY course_name
      ORDER BY courseOrderCount DESC, courseRevenue DESC
    `;

    const courseStats = await this.dataSource.query(courseStatsQuery, [teacher.name, teacher.displayName]);

    // 计算利润率
    const profitRate = stats.totalSales > 0 ? (stats.totalProfit / stats.totalSales) * 100 : 0;

    // 获取最近订单
    const recentOrdersQuery = `
      SELECT
        o.id,
        o.order_no as orderNo,
        o.course_name as courseName,
        o.payment_amount as paymentAmount,
        o.commission_amount as teacherCommission,
        (o.payment_amount - COALESCE(o.commission_amount, 0)) as profit,
        o.payment_time as paymentTime,
        o.order_status as orderStatus,
        c.wechat_nickname as customerName
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.teacher_id = ?
      AND o.is_deleted = 0
      ORDER BY o.payment_time DESC
      LIMIT 10
    `;

    const recentOrders = await this.dataSource.query(recentOrdersQuery, [teacher.name]);

    // 构建返回数据
    const teacherDetail = {
      ...teacher,
      campus: teacher.campus ? {
        id: teacher.campus.id,
        campusName: teacher.campus.campusName
      } : null,
      campusName: teacher.campus?.campusName || null,
      // 新增：多校区信息
      campuses: campuses,
      campusIds: campuses.map(c => c.id),
      // 业绩统计
      orderCount: parseInt(stats.orderCount) || 0,
      studentCount: parseInt(stats.studentCount) || 0,
      totalOrders: parseInt(stats.orderCount) || 0,
      totalSales: parseFloat(stats.totalSales) || 0,
      totalCommission: parseFloat(stats.totalCommission) || 0,
      totalProfit: parseFloat(stats.totalProfit) || 0,
      averageOrderValue: parseFloat(stats.averageOrderValue) || 0,
      profitRate: profitRate,
      // 课程统计
      courseStats: courseStats.map(course => ({
        courseName: course.course_name,
        orderCount: parseInt(course.courseOrderCount) || 0,
        revenue: parseFloat(course.courseRevenue) || 0,
        commission: parseFloat(course.courseCommission) || 0,
        studentCount: parseInt(course.courseStudentCount) || 0,
        avgPrice: parseFloat(course.courseAvgPrice) || 0,
        profit: (parseFloat(course.courseRevenue) || 0) - (parseFloat(course.courseCommission) || 0)
      })),
      // 最近订单
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        courseName: order.courseName,
        customerName: order.customerName,
        paymentAmount: parseFloat(order.paymentAmount) || 0,
        teacherCommission: parseFloat(order.teacherCommission) || 0,
        profit: parseFloat(order.profit) || 0,
        paymentTime: order.paymentTime,
        orderStatus: order.orderStatus
      }))
    };

    return {
      code: 200,
      message: 'success',
      data: teacherDetail
    };
  }
}