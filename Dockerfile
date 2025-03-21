# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:18-slim

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有项目文件
COPY . .

# 暴露端口（如果需要使用SSE模式）
EXPOSE 3000

# 设置环境变量（这些将在运行时被覆盖）
ENV REPLICATE_API_TOKEN=""
ENV STORAGE_ENDPOINT=""
ENV STORAGE_ACCESS_KEY=""
ENV STORAGE_SECRET_KEY=""
ENV STORAGE_BUCKET=""
ENV STORAGE_DOMAIN=""

# 启动MCP服务器
CMD ["node", "index.js"]
