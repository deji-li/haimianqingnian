const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function executeSQLFile() {
  let connection;
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'education_crm',
      multipleStatements: true
    });

    console.log('✅ 成功连接数据库');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'init-ai-intelligent-fusion.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📖 读取SQL文件成功');

    // 执行SQL
    const [results] = await connection.query(sql);
    console.log('✅ SQL执行成功');

    // 显示结果
    if (Array.isArray(results)) {
      const lastResult = results[results.length - 1];
      if (lastResult && lastResult.length > 0) {
        console.log('\\n📊 配置验证结果:');
        lastResult.forEach(row => {
          console.log(`  - ${row.scenario_key}: ${row.scenario_name} (${row.model_provider}) - ${row.is_active ? '已启用' : '未启用'}`);
        });
      }
    }

    console.log('\\n🎉 智能融合AI配置创建完成！');

  } catch (error) {
    console.error('\\n❌ 执行失败:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('提示: 数据库密码错误，请检查密码配置');
      console.error('可能的密码: root, root123456, 123456, 或空密码');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executeSQLFile();
