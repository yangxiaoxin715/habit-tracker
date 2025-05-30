# 故障排除指南

## 🚨 ChunkLoadError 解决方案

### 问题现象
浏览器显示 "ChunkLoadError: Loading chunk app/page failed" 错误

### 📋 解决步骤

#### 1. 立即解决方案
```bash
# 步骤1: 终止所有 Next.js 进程
pkill -f "next"

# 步骤2: 清理构建缓存
rm -rf .next

# 步骤3: 重新启动开发服务器
npm run dev
```

#### 2. 浏览器端操作
1. **硬刷新页面**: `Ctrl + F5` (Windows/Linux) 或 `Cmd + Shift + R` (Mac)
2. **清除浏览器缓存**: 
   - 打开开发者工具 (F12)
   - 右键点击刷新按钮
   - 选择"清空缓存并硬性重新加载"
3. **无痕模式测试**: 打开新的无痕/隐私窗口访问应用

#### 3. 如果问题仍然存在
```bash
# 清理 npm 缓存
npm cache clean --force

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重新启动
npm run dev
```

## 🔧 常见问题解决方案

### 端口冲突问题
```bash
# 查看端口使用情况
lsof -i :3000
lsof -i :3001

# 终止占用端口的进程
kill -9 [进程ID]
```

### API 路由问题
如果看到 `export const dynamic = "force-dynamic"` 错误：

1. **检查 next.config.js**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // 确保没有 output: 'export' 配置
};

module.exports = nextConfig;
```

2. **如果需要静态导出**，需要移除所有 API 路由中的 `dynamic = 'force-dynamic'`

### 依赖问题
```bash
# 检查 Node.js 版本 (推荐 18+)
node --version

# 检查 npm 版本
npm --version

# 更新到最新的 LTS 版本
npm install npm@latest -g
```

## 📱 移动端测试

### 本地网络访问
```bash
# 获取本机IP地址
ifconfig | grep "inet " | grep -v 127.0.0.1

# 启动服务器允许外部访问
npm run dev -- --hostname 0.0.0.0
```

然后在手机上访问: `http://[你的IP地址]:3000`

### 移动端调试
1. Chrome 开发者工具 → More tools → Remote devices
2. 或使用 `chrome://inspect` 调试移动端页面

## 🧹 定期维护

### 每周清理
```bash
# 清理构建缓存
rm -rf .next

# 清理 npm 缓存
npm cache clean --force
```

### 项目健康检查
```bash
# 检查依赖安全性
npm audit

# 修复安全问题
npm audit fix

# 检查过时依赖
npm outdated
```

## 🆘 紧急恢复

如果项目完全无法启动：

```bash
# 完全重置项目环境
rm -rf .next node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

## 📞 获取帮助

如果问题仍然存在，请提供以下信息：

1. **错误截图**
2. **控制台输出**
3. **系统信息**:
   ```bash
   node --version
   npm --version
   npx next --version
   ```
4. **浏览器信息** (版本、类型)

## 🎯 预防措施

1. **定期清理缓存**: 每天开发前运行 `rm -rf .next`
2. **使用稳定的 Node.js 版本**: 推荐 18.x LTS
3. **避免多个开发服务器**: 确保只运行一个 `npm run dev`
4. **定期更新依赖**: 但要在稳定版本中进行

---

**记住**: 大多数开发环境问题都可以通过清理缓存和重启来解决！ 🚀 