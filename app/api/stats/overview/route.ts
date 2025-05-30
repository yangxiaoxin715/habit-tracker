import { NextResponse } from 'next/server';
import { taskStorage, pointsStorage, habitStorage, TaskCompletion } from '@/lib/storage';

// 强制动态渲染
export const dynamic = 'force-dynamic';

interface CategoryStats {
  totalHabits: number;
  activeHabits: number;
  completions: number;
  points: number;
}

interface DateCompletions {
  [date: string]: number;
}

// 获取统计概览
export async function GET() {
  try {
    const habits = habitStorage.getAll();
    const completions = taskStorage.getCompletions();
    const pointTransactions = pointsStorage.getTransactions();
    
    // 基础统计
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.active).length;
    const totalPoints = pointsStorage.getCurrentPoints();
    const totalTasksCompleted = completions.length;
    
    // 今日统计
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = completions.filter(c => c.date === today);
    const todayPoints = todayCompletions.reduce((sum, c) => sum + c.pointsEarned, 0);
    
    // 本周统计
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weekCompletions = completions.filter(c => c.date >= weekAgoStr);
    const weekPoints = weekCompletions.reduce((sum, c) => sum + c.pointsEarned, 0);
    
    // 习惯完成率统计
    const habitStats = habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const habitWeekCompletions = habitCompletions.filter(c => c.date >= weekAgoStr);
      
      return {
        habitId: habit.id,
        habitName: habit.name,
        category: habit.category,
        totalCompletions: habitCompletions.length,
        weekCompletions: habitWeekCompletions.length,
        completionRate: habit.tasks.length > 0 ? 
          (habitCompletions.length / (habit.tasks.length * 7)) * 100 : 0 // 假设7天周期
      };
    });
    
    // 每日完成趋势（最近7天）
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayCompletions = completions.filter(c => c.date === dateStr);
      dailyTrend.push({
        date: dateStr,
        completions: dayCompletions.length,
        points: dayCompletions.reduce((sum, c) => sum + c.pointsEarned, 0)
      });
    }
    
    // 分类统计
    const categoryStats: Record<string, CategoryStats> = {};
    habits.forEach(habit => {
      if (!categoryStats[habit.category]) {
        categoryStats[habit.category] = {
          totalHabits: 0,
          activeHabits: 0,
          completions: 0,
          points: 0
        };
      }
      
      categoryStats[habit.category].totalHabits++;
      if (habit.active) categoryStats[habit.category].activeHabits++;
      
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      categoryStats[habit.category].completions += habitCompletions.length;
      categoryStats[habit.category].points += habitCompletions.reduce((sum, c) => sum + c.pointsEarned, 0);
    });
    
    // 连续完成天数统计
    const streakStats = calculateStreaks(completions);
    
    // 最活跃的习惯
    const topHabits = habitStats
      .sort((a, b) => b.totalCompletions - a.totalCompletions)
      .slice(0, 5);
    
    return NextResponse.json({
      success: true,
      overview: {
        totalHabits,
        activeHabits,
        totalPoints,
        totalTasksCompleted,
        todayCompletions: todayCompletions.length,
        todayPoints,
        weekCompletions: weekCompletions.length,
        weekPoints
      },
      habitStats,
      dailyTrend,
      categoryStats,
      streakStats,
      topHabits
    });
    
  } catch (error) {
    console.error('Get stats overview error:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}

// 计算连续完成天数
function calculateStreaks(completions: TaskCompletion[]) {
  const dateCompletions: DateCompletions = {};
  
  // 按日期分组
  completions.forEach(completion => {
    if (!dateCompletions[completion.date]) {
      dateCompletions[completion.date] = 0;
    }
    dateCompletions[completion.date]++;
  });
  
  // 计算当前连续天数
  let currentStreak = 0;
  let maxStreak = 0;
  const today = new Date();
  
  for (let i = 0; i < 30; i++) { // 检查最近30天
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (dateCompletions[dateStr] && dateCompletions[dateStr] > 0) {
      if (i === 0 || currentStreak > 0) { // 今天有完成或者连续中
        currentStreak++;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      if (i === 0) {
        // 今天没完成，检查昨天
        continue;
      } else {
        break; // 连续中断
      }
    }
  }
  
  return {
    currentStreak,
    maxStreak,
    totalActiveDays: Object.keys(dateCompletions).length
  };
} 