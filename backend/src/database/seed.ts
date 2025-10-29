import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // 开始事务
    await queryRunner.startTransaction();

    // 1. 创建角色表并插入初始数据
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`code\` varchar(50) NOT NULL COMMENT '角色代码',
        \`name\` varchar(50) NOT NULL COMMENT '角色名称',
        \`description\` varchar(255) DEFAULT NULL COMMENT '角色描述',
        \`status\` tinyint NOT NULL DEFAULT '1' COMMENT '状态：1启用 0禁用',
        \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 插入角色（使用 INSERT IGNORE 避免重复）
    await queryRunner.query(`
      INSERT IGNORE INTO \`roles\` (\`id\`, \`code\`, \`name\`, \`description\`, \`status\`)
      VALUES
      (1, 'admin', '系统管理员', '拥有系统所有权限', 1),
      (2, 'sales_manager', '销售主管', '销售团队管理', 1),
      (3, 'sales', '销售顾问', '客户跟进与订单处理', 1),
      (4, 'finance', '财务人员', '财务数据查看与报表', 1),
      (5, 'teacher', '授课老师', '查看课程与学员信息', 1)
    `);

    // 2. 检查管理员账户是否存在
    const adminExists = await queryRunner.query(
      `SELECT id FROM users WHERE username = 'admin'`,
    );

    if (adminExists.length === 0) {
      // 生成密码 hash (123456)
      const passwordHash = await bcrypt.hash('123456', 10);

      // 插入管理员账户
      await queryRunner.query(
        `INSERT INTO users (username, password, real_name, phone, email, role_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin',
          passwordHash,
          '系统管理员',
          '13800138000',
          'admin@example.com',
          1,
          1,
        ],
      );

      console.log('✓ 管理员账户创建成功');
      console.log('  用户名: admin');
      console.log('  密码: 123456');
    } else {
      console.log('✓ 管理员账户已存在');
    }

    // 提交事务
    await queryRunner.commitTransaction();
    console.log('✓ 数据库种子数据初始化完成');
  } catch (error) {
    // 回滚事务
    await queryRunner.rollbackTransaction();
    console.error('✗ 数据库种子数据初始化失败:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
