/**
 * 创建简单的纯色PNG图标（不需要canvas库）
 * 使用PNG-JS纯JavaScript实现
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 创建一个简单的81x81 PNG图片
function createSimplePNG(r, g, b, a = 255) {
  const width = 81;
  const height = 81;

  // PNG文件头
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
      const offset = rowStart + 1 + x * 4;
      imageData[offset] = r;
      imageData[offset + 1] = g;
      imageData[offset + 2] = b;
      imageData[offset + 3] = a;
    }
  }

  // 压缩图像数据
  const compressedData = zlib.deflateSync(imageData);

  // 构建PNG文件
  const chunks = [];

  // IHDR chunk
  chunks.push(createChunk('IHDR', ihdr));

  // IDAT chunk
  chunks.push(createChunk('IDAT', compressedData));

  // IEND chunk
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

const outputDir = path.join(__dirname, 'mobile', 'static', 'tabbar');

const icons = [
  { name: 'home', normal: [122, 126, 131], active: [59, 130, 246] },       // 灰色/蓝色
  { name: 'customer', normal: [122, 126, 131], active: [59, 130, 246] },
  { name: 'order', normal: [122, 126, 131], active: [59, 130, 246] },
  { name: 'stats', normal: [122, 126, 131], active: [59, 130, 246] },
  { name: 'my', normal: [122, 126, 131], active: [59, 130, 246] },
];

console.log('开始生成TabBar图标...\n');

icons.forEach(icon => {
  const normalPng = createSimplePNG(...icon.normal);
  const activePng = createSimplePNG(...icon.active);

  fs.writeFileSync(path.join(outputDir, `${icon.name}.png`), normalPng);
  console.log(`✅ 创建: ${icon.name}.png`);

  fs.writeFileSync(path.join(outputDir, `${icon.name}-active.png`), activePng);
  console.log(`✅ 创建: ${icon.name}-active.png`);
});

console.log('\n🎉 所有图标生成完成！');
console.log('这些是纯色方块图标，建议后续替换为专业图标');
console.log('可以从 https://www.iconfont.cn/ 下载免费图标');
