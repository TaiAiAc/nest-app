# 构建阶段
FROM node:20 AS builder

# 全局安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run build

# 运行阶段
FROM node:20-alpine

# 安装必要的系统依赖
RUN apk add --no-cache python3 make g++

# 全局安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

# 在生产环境中重新安装依赖
RUN pnpm install --prod

# 重新编译 bcrypt
RUN cd /app/node_modules/bcrypt && npm rebuild bcrypt --build-from-source

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
