FROM node:18-alpine

WORKDIR /app

# 1. 先复制依赖相关文件
COPY package.json package-lock.json ./

# 2. 安装依赖（用 ci 命令保持依赖版本锁定）
RUN npm ci

# 3. 复制所有源代码（包括 src、public 等）
COPY . .

# 4. 构建生产版本（如果只需要开发模式可去掉这一步）
RUN npm run build

# 5. 暴露端口（根据实际使用的端口，默认5173）
EXPOSE 5173

# 6. 启动命令（开发模式用 "dev"，生产用 "preview"）
CMD ["npm", "run", "dev"]
