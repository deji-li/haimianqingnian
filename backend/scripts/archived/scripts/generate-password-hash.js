// 生成bcrypt密码hash的脚本
const bcrypt = require('bcrypt');

const password = '123456'; // 默认密码
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('生成密码hash失败:', err);
    process.exit(1);
  }

  console.log('密码:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nSQL更新语句:');
  console.log(`UPDATE users SET password = '${hash}' WHERE username = 'admin';`);
});
