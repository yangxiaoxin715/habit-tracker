import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 读取JSON文件
function readJsonFile(filePath: string, defaultValue: any = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
  }
  return defaultValue
}

async function migrateData() {
  try {
    console.log('开始数据迁移...')

    // 创建默认用户（用于现有数据）
    const defaultPassword = await bcrypt.hash('123456', 12)
    
    const defaultUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        name: '演示用户',
        password: defaultPassword,
        role: 'CHILD'
      }
    })

    console.log('✓ 创建默认用户:', defaultUser.name)

    // 迁移习惯数据
    const habitsFile = path.join(process.cwd(), 'data/habits.json')
    const oldHabits = readJsonFile(habitsFile)

    if (oldHabits.length > 0) {
      for (const oldHabit of oldHabits) {
        // 创建习惯
        const habit = await prisma.habit.upsert({
          where: { id: oldHabit.id },
          update: {
            name: oldHabit.name,
            description: oldHabit.description,
            category: oldHabit.category,
            active: oldHabit.active
          },
          create: {
            id: oldHabit.id,
            name: oldHabit.name,
            description: oldHabit.description,
            category: oldHabit.category,
            active: oldHabit.active,
            userId: defaultUser.id
          }
        })

        // 创建任务
        for (const oldTask of oldHabit.tasks) {
          await prisma.task.upsert({
            where: { id: oldTask.id },
            update: {
              title: oldTask.title,
              description: oldTask.description
            },
            create: {
              id: oldTask.id,
              title: oldTask.title,
              description: oldTask.description,
              habitId: habit.id
            }
          })
        }

        console.log(`✓ 迁移习惯: ${habit.name}`)
      }
    }

    // 迁移积分交易记录
    const pointsFile = path.join(process.cwd(), 'data/points.json')
    const oldTransactions = readJsonFile(pointsFile)

    if (oldTransactions.length > 0) {
      for (const oldTransaction of oldTransactions) {
        await prisma.pointTransaction.upsert({
          where: { id: oldTransaction.id },
          update: {},
          create: {
            id: oldTransaction.id,
            amount: oldTransaction.amount,
            type: oldTransaction.type === 'earn' ? 'EARN' : 'SPEND',
            description: oldTransaction.description,
            createdAt: new Date(oldTransaction.createdAt),
            userId: defaultUser.id
          }
        })
      }
      console.log(`✓ 迁移积分交易记录: ${oldTransactions.length} 条`)
    }

    // 迁移任务完成记录
    const tasksFile = path.join(process.cwd(), 'data/tasks.json')
    const oldCompletions = readJsonFile(tasksFile)

    if (oldCompletions.length > 0) {
      for (const oldCompletion of oldCompletions) {
        await prisma.taskCompletion.upsert({
          where: { id: oldCompletion.id },
          update: {},
          create: {
            id: oldCompletion.id,
            date: oldCompletion.date,
            pointsEarned: oldCompletion.pointsEarned,
            completedAt: new Date(oldCompletion.completedAt),
            userId: defaultUser.id,
            taskId: oldCompletion.taskId,
            habitId: oldCompletion.habitId
          }
        })
      }
      console.log(`✓ 迁移任务完成记录: ${oldCompletions.length} 条`)
    }

    // 迁移奖励数据
    const rewardsFile = path.join(process.cwd(), 'data/rewards.json')
    const oldRewards = readJsonFile(rewardsFile)

    if (oldRewards.length > 0) {
      for (const oldReward of oldRewards) {
        let rewardType: 'BADGE' | 'PHYSICAL' | 'CUSTOM' = 'CUSTOM'
        
        if (oldReward.type === 'badge') rewardType = 'BADGE'
        else if (oldReward.type === 'physical') rewardType = 'PHYSICAL'

        await prisma.reward.upsert({
          where: { id: oldReward.id },
          update: {
            name: oldReward.name,
            description: oldReward.description,
            points: oldReward.points,
            type: rewardType,
            image: oldReward.image,
            isActive: true,
            isGlobal: true
          },
          create: {
            id: oldReward.id,
            name: oldReward.name,
            description: oldReward.description,
            points: oldReward.points,
            type: rewardType,
            image: oldReward.image,
            isActive: true,
            isGlobal: true
          }
        })

        // 如果奖励已经被兑换，创建兑换记录
        if (oldReward.earned) {
          await prisma.rewardRedemption.upsert({
            where: {
              userId_rewardId: {
                userId: defaultUser.id,
                rewardId: oldReward.id
              }
            },
            update: {},
            create: {
              userId: defaultUser.id,
              rewardId: oldReward.id
            }
          })
        }
      }
      console.log(`✓ 迁移奖励数据: ${oldRewards.length} 条`)
    }

    console.log('🎉 数据迁移完成！')
    console.log(`默认用户登录信息：`)
    console.log(`邮箱: demo@example.com`)
    console.log(`密码: 123456`)

  } catch (error) {
    console.error('❌ 数据迁移失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateData() 