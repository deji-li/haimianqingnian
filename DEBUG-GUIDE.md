# 🐛 调试指南 - 前后端服务已启动

## 🟢 服务状态

### ✅ 前端服务 (已启动)
- **地址**: http://localhost:5174
- **状态**: 正常运行 ✅
- **端口**: 5174
- **热重载**: 支持

### ⏳ 后端服务 (启动中)
- **地址**: http://localhost:3000
- **状态**: 正在编译启动...
- **端口**: 3000
- **启动时间**: 通常需要1-2分钟

---

## 🔧 故障排查步骤

### 1️⃣ 验证服务启动

```bash
# 检查前端
curl -s http://localhost:5174 | head -10

# 检查后端（等待1-2分钟）
curl -s http://localhost:3000 || echo "后端还未启动完成"
```

### 2️⃣ 查看启动日志

```bash
# 前端日志
cat /tmp/frontend_fixed.log

# 后端日志
cat /tmp/backend_restarted.log
```

### 3️⃣ 如果服务异常，手动重启

**方式1：使用一键脚本**
```bash
D:\CC\1.1\START-SERVICES.bat
```

**方式2：分开启动**
```bash
# 终端1：后端
cd D:\CC\1.1\backend
npm run start:dev

# 终端2：前端  
cd D:\CC\1.1\frontend
npm run dev
```

---

## 🎨 UI优化检查清单

### ✅ 已修复问题
- [x] CSS语法错误 (notification/Index.vue)
- [x] 页面显示不全问题
- [x] 构建错误

### 🔍 待检查项目
- [ ] 页面布局是否正常
- [ ] 黄色主题是否正确应用
- [ ] 动画效果是否正常
- [ ] 所有页面是否完整显示
- [ ] 控制台是否有错误

### 📱 关键页面检查
1. **仪表盘**: http://localhost:5174/
2. **客户管理**: http://localhost:5174/customer/list
3. **AI工具**: http://localhost:5174/ai/tool-center
4. **系统配置**: http://localhost:5174/system/ai-config
5. **营销助手**: http://localhost:5174/ai/marketing-assistant

---

## 🐛 常见问题解决

### Q: 页面还是显示不全？
A: 硬刷新浏览器 (Ctrl+F5 或 Cmd+Shift+R)

### Q: 控制台有CSS错误？
A: 检查浏览器开发者工具Console标签页

### Q: 前端无法访问？
A: 检查5174端口是否被占用

### Q: 后端接口500错误？
A: 等待后端完全启动（约1-2分钟）

---

## 📞 反馈问题

如果发现任何问题，请提供：
1. **具体页面URL**
2. **问题描述**
3. **浏览器控制台错误截图**
4. **期望效果说明**

我会立即修复！ 🚀
