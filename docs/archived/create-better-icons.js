/**
 * 创建更好看的TabBar图标 - 带简单图形
 * 使用PC端主色黄色#FFB800
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 创建PNG图片
function createPNG(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  // 图像数据
  const imageData = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    imageData[rowStart] = 0; // filter type

    for (let x = 0; x < width; x++) {
      const pixel = drawFn(x, y, width, height);
      const offset = rowStart + 1 + x * 4;
      imageData[offset] = pixel.r;
      imageData[offset + 1] = pixel.g;
      imageData[offset + 2] = pixel.b;
      imageData[offset + 3] = pixel.a;
    }
  }

  // 压缩图像数据
  const compressedData = zlib.deflateSync(imageData);

  // 构建PNG文件
  const chunks = [];
  chunks.push(createChunk('IHDR', ihdr));
  chunks.push(createChunk('IDAT', compressedData));
  chunks.push(createChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat([signature, ...chunks]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCRC(buffer) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc = crc ^ buffer[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 绘制圆形
function drawCircle(x, y, centerX, centerY, radius) {
  const dx = x - centerX;
  const dy = y - centerY;
  return dx * dx + dy * dy <= radius * radius;
}

// 绘制矩形
function drawRect(x, y, left, top, right, bottom) {
  return x >= left && x <= right && y >= top && y <= bottom;
}

// 不同图标的绘制函数
const icons = {
  home: (x, y, w, h, isActive) => {
    const centerX = w / 2;
    const centerY = h / 2;

    // 绘制房子形状
    const isHouse = (
      // 屋顶三角形
      (y < centerY && Math.abs(x - centerX) < (centerY - y)) ||
      // 房子主体
      (y >= centerY && x >= centerX - 15 && x <= centerX + 15 && y <= centerY + 20) ||
      // 门
      (y >= centerY + 5 && x >= centerX - 5 && x <= centerX + 5 && y <= centerY + 20)
    );

    if (isHouse) {
      return isActive ? { r: 255, g: 184, b: 0, a: 255 } : { r: 144, g: 147, b: 153, a: 255 };
    }
    return { r: 0, g: 0, b: 0, a: 0 };
  },

  customer: (x, y, w, h, isActive) => {
    const centerX = w / 2;
    const centerY = h / 2;

    // 头部圆形
    const isHead = drawCircle(x, y, centerX, centerY - 10, 12);
    // 身体梯形
    const isBody = (
      y >= centerY + 5 &&
      y <= centerY + 25 &&
      x >= centerX - (y - centerY - 5) * 0.8 - 5 &&
      x <= centerX + (y - centerY - 5) * 0.8 + 5
    );

    if (isHead || isBody) {
      return isActive ? { r: 255, g: 184, b: 0, a: 255 } : { r: 144, g: 147, b: 153, a: 255 };
    }
    return { r: 0, g: 0, b: 0, a: 0 };
  },

  order: (x, y, w, h, isActive) => {
    const centerX = w / 2;
    const centerY = h / 2;

    // 文件图标
    const isFile = drawRect(x, y, centerX - 15, centerY - 20, centerX + 15, centerY + 20);
    const isTopCorner = x >= centerX + 5 && y <= centerY - 10 && x <= centerX + 15 && y >= centerY - 20;
    const isCutout = x >= centerX + 5 && x <= centerX + 15 && y >= centerY - 20 && y <= centerY - 10;

    // 内部横线
    const isLine1 = y === Math.floor(centerY - 5) && x >= centerX - 10 && x <= centerX + 5;
    const isLine2 = y === Math.floor(centerY + 2) && x >= centerX - 10 && x <= centerX + 5;
    const isLine3 = y === Math.floor(centerY + 9) && x >= centerX - 10 && x <= centerX + 5;

    if ((isFile && !isCutout) || isLine1 || isLine2 || isLine3) {
      return isActive ? { r: 255, g: 184, b: 0, a: 255 } : { r: 144, g: 147, b: 153, a: 255 };
    }
    return { r: 0, g: 0, b: 0, a: 0 };
  },

  stats: (x, y, w, h, isActive) => {
    const centerX = w / 2;
    const centerY = h / 2;

    // 柱状图
    const bar1 = drawRect(x, y, centerX - 20, centerY + 15, centerX - 12, centerY + 20);
    const bar2 = drawRect(x, y, centerX - 8, centerY + 5, centerX, centerY + 20);
    const bar3 = drawRect(x, y, centerX + 4, centerY - 5, centerX + 12, centerY + 20);
    const bar4 = drawRect(x, y, centerX + 16, centerY, centerY + 10, centerY + 20);

    if (bar1 || bar2 || bar3 || bar4) {
      return isActive ? { r: 255, g: 184, b: 0, a: 255 } : { r: 144, g: 147, b: 153, a: 255 };
    }
    return { r: 0, g: 0, b: 0, a: 0 };
  },

  my: (x, y, w, h, isActive) => {
    const centerX = w / 2;
    const centerY = h / 2;

    // 头部圆形（稍大）
    const isHead = drawCircle(x, y, centerX, centerY - 8, 15);
    // 身体圆形（更大）
    const isBody = drawCircle(x, y, centerX, centerY + 15, 20) && y >= centerY + 5;

    if (isHead || isBody) {
      return isActive ? { r: 255, g: 184, b: 0, a: 255 } : { r: 144, g: 147, b: 153, a: 255 };
    }
    return { r: 0, g: 0, b: 0, a: 0 };
  },
};

const outputDir = path.join(__dirname, 'mobile', 'static', 'tabbar');

console.log('开始生成带图形的TabBar图标...\n');
console.log('PC端主色: #FFB800 (黄色)');
console.log('未选中色: #909399 (灰色)\n');

Object.keys(icons).forEach(name => {
  const drawFn = icons[name];

  const normalPng = createPNG(81, 81, (x, y, w, h) => drawFn(x, y, w, h, false));
  const activePng = createPNG(81, 81, (x, y, w, h) => drawFn(x, y, w, h, true));

  fs.writeFileSync(path.join(outputDir, `${name}.png`), normalPng);
  console.log(`✅ 创建: ${name}.png (灰色图标)`);

  fs.writeFileSync(path.join(outputDir, `${name}-active.png`), activePng);
  console.log(`✅ 创建: ${name}-active.png (黄色图标)`);
});

console.log('\n🎉 所有图标生成完成！');
console.log('配色已与PC端统一：');
console.log('- 未选中: #909399 (灰色)');
console.log('- 选中: #FFB800 (黄色)');
