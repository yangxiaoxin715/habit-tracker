# 🚀 小学生习惯管理工具 - Vercel 部署完整指南

## 📋 准备工作

### 1. 本地环境设置

首先在项目根目录创建 `.env.local` 文件（用于本地开发）：

```bash
echo 'DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-local-development-secret"' > .env.local
```

### 2. 确保代码最新状态

```bash
# 确保所有文件都已提交
git add .
git commit -m "准备部署到Vercel - 修复数据库配置"

# 如果还没有GitHub仓库，创建一个
# 在GitHub上创建新仓库，然后执行：
git remote add origin https://github.com/你的用户名/habit-tracker.git
git branch -M main
git push -u origin main
```

## 🌐 Vercel 部署步骤

### 步骤 1: 登录 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 授权 Vercel 访问你的 GitHub 仓库

### 步骤 2: 导入项目

1. 点击 **"New Project"**
2. 选择你的 GitHub 仓库 `habit-tracker`
3. 点击 **"Import"**

### 步骤 3: 配置项目设置

在项目配置页面：

1. **项目名称**: 保持默认或自定义（如 `habit-tracker-app`）
2. **框架预设**: Next.js（应该自动检测）
3. **根目录**: 保持默认（`./`）

### 步骤 4: 添加数据库

**重要**: 在点击 "Deploy" 之前，先添加数据库！

1. 在项目配置页面，点击 **"Storage"** 标签
2. 点击 **"Create Database"**
3. 选择 **"Postgres"**
4. 输入数据库名称（如 `habit-tracker-db`）
5. 选择区域（推荐 Washington, D.C.）
6. 点击 **"Create"**

### 步骤 5: 配置环境变量

在项目设置中添加环境变量：

1. 点击 **"Environment Variables"** 标签
2. 添加以下变量：

```
NEXTAUTH_SECRET=随机生成一个32位以上的密钥
```

生成密钥的方法：
```bash
# 在终端运行
openssl rand -base64 32
```

**注意**: `DATABASE_URL` 会在创建数据库后自动添加，无需手动设置。

### 步骤 6: 部署

1. 确保所有配置完成
2. 点击 **"Deploy"**
3. 等待构建完成（大约 2-3 分钟）

## 🗄️ 数据库初始化

部署成功后，需要初始化数据库：

### 方法 1: 使用 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 复制生产环境变量到本地
vercel env pull .env.production

# 使用生产数据库运行初始化
export $(cat .env.production | xargs) && npx prisma db push --schema prisma/schema-production.prisma
export $(cat .env.production | xargs) && node scripts/seed-demo-data.js
```

### 方法 2: 使用 Vercel 网页控制台

1. 进入 Vercel 项目页面
2. 点击 **"Functions"** 标签
3. 在终端中运行：
   ```bash
   npx prisma db push
   node scripts/seed-demo-data.js
   ```

## ✅ 验证部署

### 1. 访问应用

部署完成后，Vercel 会提供一个 URL，如：
`https://your-app-name.vercel.app`

### 2. 测试功能

1. **登录测试**:
   - 点击"快速体验(演示账号)"
   - 或手动输入：手机号 `13800138000`

2. **功能验证**:
   - ✅ 查看今日任务列表
   - ✅ 完成任务打卡
   - ✅ 查看积分变化
   - ✅ 访问习惯管理页面
   - ✅ 查看奖励系统
   - ✅ 测试数据统计页面

## 🎯 自定义域名（可选）

如果有自己的域名：

1. 在 Vercel 项目设置中
2. 点击 **"Domains"**
3. 添加你的域名
4. 按照提示配置 DNS 记录

## 🔧 常见问题解决

### 问题 1: 构建失败

**原因**: TypeScript 编译错误
**解决**: 检查控制台日志，修复类型错误后重新部署

### 问题 2: 数据库连接失败

**原因**: 数据库未正确创建或环境变量缺失
**解决**: 
1. 确认在 Vercel 中创建了 Postgres 数据库
2. 检查环境变量中是否有 `DATABASE_URL`

### 问题 3: 演示数据不存在

**原因**: 数据库未初始化
**解决**: 运行数据库初始化命令

## 📱 分享给用户

部署成功后，您可以分享以下信息：

### 🌐 访问地址
```
https://your-app-name.vercel.app
```

### 👤 演示账号
- **手机号**: 13800138000
- **家庭昵称**: 演示用户

### 🎯 功能特色
- ✨ 移动端优化设计
- 📱 支持手机、平板访问
- 🎮 游戏化习惯养成
- 📊 数据可视化统计
- 🏆 积分奖励系统

## 🔄 后续更新

当您修改代码后：

1. 提交代码到 GitHub：
   ```bash
   git add .
   git commit -m "更新功能"
   git push
   ```

2. Vercel 会自动检测变化并重新部署

## 🎉 恭喜！

您的小学生习惯管理工具已成功部署到 Vercel！

现在家长和孩子们可以在任何设备上访问和使用这个应用了。🌟 