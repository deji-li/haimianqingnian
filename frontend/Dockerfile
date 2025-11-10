# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制整个 monorepo（需要访问 shared 包）
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY shared ./shared
COPY frontend ./frontend

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 构建前端应用
WORKDIR /app/frontend
RUN pnpm build

# 生产阶段 - 使用Nginx服务静态文件
FROM nginx:alpine

# 复制自定义nginx配置（相对于项目根目录）
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
