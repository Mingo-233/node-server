
FROM node:18.20.5-bullseye-slim

# 安装必要的系统依赖，包括git
RUN apt-get update && apt-get install -y \
  git \
  && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 全局安装 pnpm 和 pm2
RUN npm install -g pnpm
RUN npm install -g pm2

# https://github.com/keymetrics/pm2-logrotate
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 100M \
  && pm2 set pm2-logrotate:retain 30 \
  && pm2 set pm2-logrotate:compress false \
  && pm2 set pm2-logrotate:dateFormat YYYY-MM-DD \
  && pm2 set pm2-logrotate:workerInterval 10 \
  && pm2 set pm2-logrotate:rotateInterval 0 0 * * * \
  && pm2 set pm2-logrotate:rotateModule true

# 设置时区
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo 'Asia/Shanghai' >/etc/timezone

# 克隆代码仓库到/app目录
RUN git clone --single-branch --branch parking https://github.com/Mingo-233/node-server.git . \
  && rm -rf .git

# 安装项目依赖
RUN pnpm install --prod

# 创建日志目录
RUN mkdir -p logs

# 开放端口
EXPOSE 3123

# 设置启动命令
CMD ["pm2-runtime", "start", "ecosystem.config.js"]



