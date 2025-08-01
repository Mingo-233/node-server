
FROM node:18.20.5-bullseye-slim

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

# 先复制依赖配置文件
COPY package.json pnpm-lock.yaml ./

# 安装项目依赖
RUN echo "开始安装依赖..." \
  && pnpm install --prod \
  && echo "依赖安装完成，验证关键模块..." \
  && test -d node_modules/express || (echo "错误：express 模块未找到" && exit 1) \
  && echo "验证成功，关键依赖已正确安装" \
  && pnpm list --depth=0

# 复制项目代码
COPY . .

# 创建日志目录
RUN mkdir -p logs

# 开放端口
EXPOSE 3123

# 设置启动命令
CMD ["pm2-runtime", "start", "ecosystem.config.js"]



