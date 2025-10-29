const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'education_crm'
  });

  // 模拟 order.service.ts 的查询
  try {
    const [results] = await conn.query(`
      SELECT
        \`order\`.*,
        sales.real_name as salesName,
        campus.campus_name as campusName
      FROM orders AS \`order\`
      LEFT JOIN customers AS customer ON customer.id = \`order\`.customer_id
      LEFT JOIN users AS sales ON sales.id = \`order\`.sales_id
      LEFT JOIN campus AS campus ON campus.id = \`order\`.campus_id
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
