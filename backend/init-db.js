// 一次性数据库初始化脚本
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'education_crm',
    multipleStatements: true,
  });

  try {
    const sqlPath = path.join(__dirname, '../database/ai_init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('正在执行数据库初始化...');
    await connection.query(sql);
    console.log('✅ 数据库初始化成功！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

initDatabase();
