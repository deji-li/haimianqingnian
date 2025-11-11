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
COPY mobile ./mobile

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 构建PC端应用
WORKDIR /app/frontend
RUN pnpm build

# 构建移动端应用
WORKDIR /app/mobile
RUN pnpm build:h5
RUN echo "=== Mobile build output ===" && find dist -type f 2>/dev/null || echo "No dist directory"

# 生产阶段 - 使用Nginx服务静态文件
FROM nginx:alpine

# 复制自定义nginx配置（相对于项目根目录）
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制PC端构建产物
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# 从构建阶段复制移动端构建产物到 /mobile 子目录
# uni-app H5输出在 dist/build/h5 目录
COPY --from=builder /app/mobile/dist/build/h5 /usr/share/nginx/html/mobile

# 复制移动端static静态资源（uni-app不会自动处理static目录）
COPY --from=builder /app/mobile/static /usr/share/nginx/html/mobile/static

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
