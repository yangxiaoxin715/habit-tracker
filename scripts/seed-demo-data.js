const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始创建演示数据...');

  try {
    // 删除现有数据（按依赖关系顺序）
    console.log('🧹 清理现有数据...');
    await prisma.taskCompletion.deleteMany();
    await prisma.pointTransaction.deleteMany();
    await prisma.rewardRedemption.deleteMany();
    await prisma.task.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.user.deleteMany();

    // 创建演示用户
    console.log('👤 创建演示用户...');
    const user = await prisma.user.create({
      data: {
        phone: '13800138000',
        name: '演示用户',
        role: 'PARENT'
      }
    });
    console.log('✅ 创建演示用户:', user.name);

    // 创建默认习惯
    console.log('📚 创建默认习惯...');
    const habitsData = [
      {
        name: '每日阅读',
        description: '培养阅读习惯，增长知识',
        category: '学习',
        tasks: [
          { title: '阅读10分钟', description: '每天固定时间阅读课外书籍', order: 1 },
          { title: '分享阅读内容', description: '向家长简单分享今天读到的内容', order: 2 },
          { title: '提出一个问题', description: '针对阅读内容提出一个问题并思考', order: 3 }
        ]
      },
      {
        name: '运动锻炼',
        description: '保持身体健康，增强体质',
        category: '健康',
        tasks: [
          { title: '户外活动30分钟', description: '进行跑步、跳绳或其他户外运动', order: 1 },
          { title: '做眼保健操', description: '保护视力，预防近视', order: 2 }
        ]
      },
      {
        name: '生活自理',
        description: '培养独立生活能力',
        category: '生活',
        tasks: [
          { title: '整理房间', description: '保持房间整洁，物品摆放有序', order: 1 },
          { title: '帮助家务', description: '主动帮助家长做一些力所能及的家务', order: 2 }
        ]
      },
      {
        name: '学习计划',
        description: '养成良好的学习习惯',
        category: '学习',
        tasks: [
          { title: '完成作业', description: '认真完成当天的学校作业', order: 1 },
          { title: '预习明天课程', description: '提前预习明天要学的内容', order: 2 },
          { title: '复习今日所学', description: '回顾今天学到的知识点', order: 3 }
        ]
      },
      {
        name: '社交礼仪',
        description: '培养良好的社交能力',
        category: '社交',
        tasks: [
          { title: '问候家人', description: '主动向家人问好，表达关心', order: 1 },
          { title: '感谢他人', description: '对他人的帮助表示感谢', order: 2 }
        ]
      }
    ];

    for (const habitData of habitsData) {
      const { tasks, ...habitInfo } = habitData;
      const habit = await prisma.habit.create({
        data: {
          ...habitInfo,
          userId: user.id,
          active: true
        }
      });

      // 创建任务
      for (const taskData of tasks) {
        await prisma.task.create({
          data: {
            ...taskData,
            habitId: habit.id
          }
        });
      }

      console.log(`✅ 创建习惯: ${habit.name} (${tasks.length}个任务)`);
    }

    // 创建默认奖励
    console.log('🎁 创建默认奖励...');
    const rewardsData = [
      {
        name: '阅读小达人',
        description: '连续阅读7天获得',
        cost: 700,
        type: 'BADGE'
      },
      {
        name: '运动健将',
        description: '连续运动14天获得',
        cost: 1400,
        type: 'BADGE'
      },
      {
        name: '小小图书',
        description: '可以选择一本喜欢的课外书',
        cost: 1000,
        type: 'PHYSICAL'
      },
      {
        name: '电影时光',
        description: '和家人一起看一部电影',
        cost: 800,
        type: 'CUSTOM'
      },
      {
        name: '户外游玩',
        description: '周末户外活动一次',
        cost: 1500,
        type: 'CUSTOM'
      }
    ];

    for (const rewardData of rewardsData) {
      const reward = await prisma.reward.create({
        data: rewardData
      });
      console.log(`✅ 创建奖励: ${reward.name}`);
    }

    // 创建一些积分记录
    console.log('💰 创建积分记录...');
    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        amount: 500,
        type: 'EARN',
        description: '欢迎奖励'
      }
    });

    console.log('🎉 演示数据创建完成！');
    console.log('\n📱 可以使用以下账号登录：');
    console.log('手机号: 13800138000');
    console.log('家庭昵称: 演示用户');
    console.log('\n🎯 功能包括：');
    console.log('- 5个习惯类别的管理');
    console.log('- 每日任务打卡');
    console.log('- 积分奖励系统');
    console.log('- 数据统计分析');

  } catch (error) {
    console.error('❌ 创建演示数据失败:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 