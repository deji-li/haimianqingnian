const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'education_crm'
  });

  // 测试user.service.ts的查询
  try {
    const [results] = await conn.query(`
      SELECT
        \`user\`.*,
        role.name as roleName,
        role.code as roleCode,
        dept.department_name as departmentName,
        campus.campus_name as campusName
      FROM users AS \`user\`
      LEFT JOIN roles AS role ON role.id = \`user\`.role_id
      LEFT JOIN department AS dept ON dept.id = \`user\`.department_id
      LEFT JOIN campus AS campus ON campus.id = \`user\`.campus_id
      LIMIT 1
    `);
    console.log('✅ 查询成功!');
    console.log('返回数据:', results.length, '条');
    if (results.length > 0) {
      console.log('第一条数据:', JSON.stringify(results[0], null, 2));
    }
  } catch (error) {
    console.log('❌ SQL错误:');
    console.log('错误信息:', error.message);
    console.log('SQL:', error.sql);
  }

  await conn.end();
})();
