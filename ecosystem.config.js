module.exports = {
  apps: [{
    name: 'parking-server',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3123
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3123
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // 重启策略
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    // 当应用崩溃时自动重启
    kill_timeout: 5000,
    listen_timeout: 8000,
    // 忽略监听文件变化
    ignore_watch: [
      'node_modules',
      'logs',
      '.git'
    ],
    // 合并日志
    merge_logs: true,
    // 日志时间格式
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
} 