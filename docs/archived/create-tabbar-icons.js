/**
 * 使用Node.js Canvas生成TabBar图标
 * 运行: node create-tabbar-icons.js
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了canvas包
try {
  require.resolve('canvas');
} catch (e) {
  console.log('需要先安装canvas包：npm install canvas');
  console.log('或者使用方案1：用浏览器打开 create-icons.html 手动下载图标');
  process.exit(1);
}

const { createCanvas } = require('canvas');

const icons = [
  { emoji: '🏠', name: 'home', color: '#7A7E83', activeColor: '#3b82f6' },
  { emoji: '👥', name: 'customer', color: '#7A7E83', activeColor: '#3b82f6' },
  { emoji: '📦', name: 'order', color: '#7A7E83', activeColor: '#3b82f6' },
  { emoji: '📊', name: 'stats', color: '#7A7E83', activeColor: '#3b82f6' },
  { emoji: '👤', name: 'my', color: '#7A7E83', activeColor: '#3b82f6' },
];

const outputDir = path.join(__dirname, 'mobile', 'static', 'tabbar');

// 确保目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function createIcon(emoji, filename, bgColor) {
  const canvas = createCanvas(81, 81);
  const ctx = canvas.getContext('2d');

  // 绘制圆角背景
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, 81, 81, 15);
  ctx.fill();

  // 绘制emoji
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.fillText(emoji, 40.5, 40.5);

  // 保存为PNG
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ 创建: ${filename}`);
}

console.log('开始生成TabBar图标...\n');

icons.forEach(icon => {
  createIcon(icon.emoji, `${icon.name}.png`, icon.color);
  createIcon(icon.emoji, `${icon.name}-active.png`, icon.activeColor);
});

console.log('\n🎉 所有图标生成完成！');
console.log(`输出目录: ${outputDir}`);
