# Scripts Directory

这个目录包含用于支持后端功能的辅助脚本。

## parse_docx.py

Word文档解析脚本，用于提取.docx文件的文本内容。

### 功能
- 提取Word文档中所有段落的文本
- 提取表格内容并格式化为文本
- 跳过空段落，保持内容整洁

### 依赖
- Python 3.x
- python-docx库

### 安装依赖
```bash
pip install python-docx
```

### 使用方法

#### 命令行使用
```bash
python parse_docx.py /path/to/document.docx
```

#### 在NestJS中使用
脚本被`ai-chat.service.ts`的`parseFileContent()`方法调用，自动处理.docx文件。

### 输出格式
- 成功：输出提取的文本内容（通过stdout）
- 失败：输出以"ERROR: "开头的错误信息，并返回退出码1

### 示例

输入文件`chat.docx`：
```
客户：你们的课程怎么收费？
销售：我们有多种套餐...
```

输出：
```
客户：你们的课程怎么收费？
销售：我们有多种套餐...
```

### 注意事项
1. 脚本路径应该是`backend/scripts/parse_docx.py`
2. 确保Python环境已安装python-docx
3. 文件路径支持中文和特殊字符
4. 建议文件大小不超过10MB

### 错误处理
- 文件不存在：返回错误信息
- 文件格式错误：返回错误信息
- 解析失败：返回错误信息

所有错误都会被NestJS捕获并返回给前端用户。
