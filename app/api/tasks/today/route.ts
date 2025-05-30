import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 验证JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as any;
    } catch (error) {
      return NextResponse.json(
        { error: '无效的访问令牌' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const today = new Date().toISOString().split('T')[0];
    
    // 获取用户的活跃习惯及其任务
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        active: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    // 获取今日已完成的任务
    const completedTasks = await prisma.taskCompletion.findMany({
      where: {
        userId,
        completedDate: today
      },
      select: {
        taskId: true
      }
    });
    
    const completedTaskIds = new Set(completedTasks.map((ct: { taskId: string }) => ct.taskId));
    
    // 生成今日任务列表
    const tasks: any[] = [];
    
    habits.forEach((habit: any) => {
      habit.tasks.forEach((task: any) => {
        tasks.push({
          id: task.id,
          title: task.title,
          description: task.description,
          order: task.order,
          habitId: habit.id,
          habitName: habit.name,
          completed: completedTaskIds.has(task.id)
        });
      });
    });
    
    return NextResponse.json({
      success: true,
      tasks,
      date: today
    });
    
  } catch (error) {
    console.error('Get today tasks error:', error);
    return NextResponse.json(
      { error: '获取今日任务失败' },
      { status: 500 }
    );
  }
} 