#!/bin/bash

echo "🚀 启动小学生习惯管理工具..."

# 检查数据库是否存在
if [ ! -f "dev.db" ]; then
    echo "📦 初始化数据库..."
    npx prisma db push
    echo "🌱 创建演示数据..."
    node scripts/seed-demo-data.js
fi

echo "🔥 启动开发服务器..."
echo "📱 应用将在 http://localhost:3000 启动"
echo "💡 演示账号: 13800138000"
echo ""

npm run dev 