const fs = require('fs');
const path = require('path');

// 需要修复的DTO文件列表
const dtoFiles = [
  'src/modules/commission/dto/query-commission.dto.ts',
  'src/modules/commission/dto/update-commission.dto.ts',
  'src/modules/okr/dto/create-okr.dto.ts',
  'src/modules/okr/dto/query-okr.dto.ts',
  'src/modules/okr/dto/update-okr.dto.ts',
  'src/modules/order/dto/create-order.dto.ts',
];

dtoFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // 1. 添加 ValidateIf 到 imports
  if (content.includes('IsEnum') && !content.includes('ValidateIf')) {
    content = content.replace(
      /from 'class-validator';/,
      match => {
        const importLine = content.substring(0, content.indexOf(match));
        if (importLine.includes('IsEnum')) {
          return match.replace('} from', ', ValidateIf } from');
        }
        return match;
      }
    );
    modified = true;
  }

  // 2. 为所有 @IsOptional() 后跟 @IsEnum 的字段添加 @ValidateIf
  const enumPattern = /(@IsOptional\(\)\s*\n\s*)(@IsEnum\([^\)]+\))/g;
  const matches = [...content.matchAll(enumPattern)];

  if (matches.length > 0) {
    // 从后往前替换，避免位置偏移
    matches.reverse().forEach(match => {
      const fieldName = extractFieldName(content, match.index + match[0].length);
      if (fieldName) {
        const validateIf = `  @ValidateIf((o) => o.${fieldName} !== '' && o.${fieldName} !== null && o.${fieldName} !== undefined)\n`;
        content = content.substring(0, match.index + match[1].length) +
                 validateIf +
                 content.substring(match.index + match[1].length);
        modified = true;
      }
    });
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
});

function extractFieldName(content, startIndex) {
  // 找到下一个字段名
  const match = content.substring(startIndex).match(/\n\s+(\w+)\??:/);
  return match ? match[1] : null;
}

console.log('\n✨ All DTO files processed!');
