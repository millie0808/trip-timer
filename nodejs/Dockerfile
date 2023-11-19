# 使用官方 Node.js 基礎映像
FROM --platform=linux/amd64 node:18.17.1

# 設定工作目錄
WORKDIR /app

# 複製應用程式依賴文件並安裝
COPY package*.json ./
RUN npm install

# 將本地文件複製到容器中
COPY . .

# 暴露端口
EXPOSE 3000

# 定義啟動命令
CMD ["npx", "nodemon", "app.js"]


