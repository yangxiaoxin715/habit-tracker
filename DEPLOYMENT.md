# 🚀 小学生习惯管理工具 - Vercel部署指南

## 📋 部署前准备

### 1. 代码准备
- ✅ 已更新数据库配置为PostgreSQL
- ✅ 已添加Vercel配置文件
- ✅ 已更新package.json脚本

### 2. 账号准备
- GitHub账号（用于代码托管）
- Vercel账号（用于部署）

## 🔧 部署步骤

### 步骤1：推送代码到GitHub

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "准备部署到Vercel"

# 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/habit-tracker.git

# 推送到GitHub
git push -u origin main
```

### 步骤2：在Vercel部署

1. **访问Vercel**
   - 打开 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 点击 "Import"

3. **配置环境变量**
   在Vercel项目设置中添加以下环境变量：
   
   ```
   NEXTAUTH_SECRET=你的随机密钥字符串
   DATABASE_URL=postgresql://...（Vercel会自动提供）
   ```

4. **添加数据库**
   - 在Vercel项目中点击 "Storage"
   - 选择 "Postgres"
   - 创建数据库

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 步骤3：初始化数据库

部署完成后，在Vercel项目的Functions标签页中运行：

```bash
npx prisma db push
node scripts/seed-demo-data.js
```

## 🎯 部署后验证

1. **访问应用**
   - 打开Vercel提供的域名
   - 例如：https://your-app-name.vercel.app

2. **测试功能**
   - 使用演示账号登录：13800138000
   - 检查习惯管理功能
   - 测试任务打卡功能

## 📱 分享给用户

### 演示账号信息
- 手机号：13800138000
- 家庭昵称：演示用户

### 功能介绍
- ✅ 习惯管理：创建和管理好习惯
- ✅ 任务打卡：每日任务完成跟踪
- ✅ 积分系统：完成任务获得积分
- ✅ 数据统计：查看习惯养成进度
- ✅ 移动端适配：支持手机和平板使用

## 🔧 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL数据库连接URL | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | JWT签名密钥 | `your-super-secret-key-here` |

## 📞 技术支持

如果部署过程中遇到问题，请检查：
1. 环境变量是否正确设置
2. 数据库是否成功创建
3. 构建日志是否有错误信息

---

🎉 **恭喜！你的小学生习惯管理工具已成功部署！** 