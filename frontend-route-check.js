const fs = require('fs');
const path = require('path');

// 读取路由文件
const routerPath = path.join(__dirname, 'frontend/src/router/index.ts');
const routerContent = fs.readFileSync(routerPath, 'utf8');

// 获取所有前端API文件
const apiDir = path.join(__dirname, 'frontend/src/api');
const apiFiles = fs.readdirSync(apiDir).filter(file => file.endsWith('.ts'));

// 获取所有前端页面
const viewsDir = path.join(__dirname, 'frontend/src/views');
function getAllVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllVueFiles(filePath, fileList);
    } else if (file.endsWith('.vue')) {
      fileList.push(path.relative(viewsDir, filePath));
    }
  });
  return fileList;
}

const vueFiles = getAllVueFiles(viewsDir);

console.log('=== 前端API文件 ===');
apiFiles.forEach(file => {
  console.log(`✓ ${file}`);
});

console.log('\n=== 前端Vue���面文件 ===');
vueFiles.forEach(file => {
  console.log(`✓ ${file}`);
});

// 检查路由中的所有路径
const routeMatches = routerContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
const routes = routeMatches ? routeMatches.map(match => match.match(/['"`]([^'"`]+)['"`]/)[1]) : [];

console.log('\n=== 路由中的路径 ===');
routes.forEach(route => {
  console.log(`✓ ${route}`);
});

// 检查是否有API文件但没路由的功能
console.log('\n=== API文件分析 ===');
apiFiles.forEach(apiFile => {
  const apiName = apiFile.replace('.ts', '');
  console.log(`\n📁 ${apiFile}`);

  // 检查是否有对应的Vue页面
  const possibleVueFiles = vueFiles.filter(vueFile =>
    vueFile.toLowerCase().includes(apiName.toLowerCase()) ||
    apiName.toLowerCase().includes(vueFile.toLowerCase().replace('.vue', '').replace('/', ''))
  );

  if (possibleVueFiles.length > 0) {
    console.log(`  → 对应Vue页面: ${possibleVueFiles.join(', ')}`);
  } else {
    console.log(`  → ❌ 没有对应的Vue页面`);
  }

  // 检查是否有对应的路由
  const hasRoute = routes.some(route =>
    route.toLowerCase().includes(apiName.toLowerCase()) ||
    apiName.toLowerCase().includes(route.replace('/', '').toLowerCase())
  );

  if (hasRoute) {
    console.log(`  → ✓ 有对应路由`);
  } else {
    console.log(`  → ❌ 没有对应路由`);
  }
});

console.log('\n=== 可能缺失前端入口的功能 ===');

// 基于后端API路由，检查可能缺失的前端功能
const backendAPIPatterns = [
  'team-stats',      // 团队统计
  'lifecycle',       // 客户生命周期
  'ai-api-keys',     // AI API密钥管理 (已添加)
  'ai-chat',         // AI聊天
  'ai-tools',        // AI工具
  'order-sync',      // 订单同步
  'automation',      // 自动化
  'operation'        // 运营管理
];

backendAPIPatterns.forEach(pattern => {
  const hasApiFile = apiFiles.some(file => file.toLowerCase().includes(pattern));
  const hasVueFile = vueFiles.some(file => file.toLowerCase().includes(pattern));
  const hasRoute = routes.some(route => route.toLowerCase().includes(pattern));

  if (!hasVueFile || !hasRoute) {
    console.log(`🚨 ${pattern}:`);
    if (!hasApiFile) console.log(`  - 缺少API文件`);
    if (!hasVueFile) console.log(`  - 缺少Vue页面`);
    if (!hasRoute) console.log(`  - 缺少路由配置`);
  }
});