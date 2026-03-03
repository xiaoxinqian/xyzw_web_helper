#!/bin/bash

# XYZW Web Helper 后台启动脚本

echo "正在启动 XYZW Web Helper..."

# 停止旧进程
pm2 stop xyzw-web-helper 2>/dev/null || true
pm2 delete xyzw-web-helper 2>/dev/null || true

# 启动服务
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 显示状态
pm2 status

echo ""
echo "✅ 服务已启动！"
echo "📍 访问地址: http://localhost:3000"
echo "📋 查看日志: pm2 logs xyzw-web-helper"
echo "🔄 重启服务: pm2 restart xyzw-web-helper"
echo "⏹️  停止服务: pm2 stop xyzw-web-helper"
echo ""
echo "现在你可以："
echo "1. 打开浏览器访问 http://localhost:3000"
echo "2. 配置你的定时任务"
echo "3. 关闭浏览器 - 任务会继续在后台运行！"
