#!/bin/bash

echo "🚀 停车提醒服务器启动脚本"
echo "=========================="

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查pnpm是否已安装，如果没有则使用npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    echo "✅ 使用 pnpm 作为包管理器"
else
    PACKAGE_MANAGER="npm"
    echo "✅ 使用 npm 作为包管理器"
fi

# 安装依赖
echo "📦 正在安装依赖..."
$PACKAGE_MANAGER install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 创建日志目录
echo "📁 创建日志目录..."
mkdir -p logs

# 检查PM2是否已全局安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2未全局安装，使用本地PM2..."
    PM2_CMD="npx pm2"
else
    echo "✅ 使用全局PM2"
    PM2_CMD="pm2"
fi

# 启动服务
echo "🚀 正在启动停车提醒服务器..."
$PM2_CMD start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 服务启动成功！"
    echo "📍 服务地址: http://127.0.0.1:3123"
    echo ""
    echo "常用命令:"
    echo "  查看状态: $PM2_CMD status"
    echo "  查看日志: $PM2_CMD logs parking-server"
    echo "  重启服务: $PM2_CMD restart parking-server"
    echo "  停止服务: $PM2_CMD stop parking-server"
    echo "  删除服务: $PM2_CMD delete parking-server"
    echo ""
    echo "API端点:"
    echo "  停车通知: http://127.0.0.1:3123/notify"
    echo "  测试通知: http://127.0.0.1:3123/mock"
    echo ""
else
    echo "❌ 服务启动失败，请检查错误信息"
    exit 1
fi 