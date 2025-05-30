import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { taskId, habitId } = body;
    
    if (!taskId || !habitId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // 检查是否已经完成过
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        userId_taskId_date: {
          userId,
          taskId,
          date: today
        }
      }
    });
    
    if (existingCompletion) {
      return NextResponse.json(
        { error: '今日已完成此任务' },
        { status: 400 }
      );
    }
    
    // 创建任务完成记录
    const completion = await prisma.taskCompletion.create({
      data: {
        userId,
        taskId,
        habitId,
        date: today,
        pointsEarned: 100
      }
    });
    
    // 添加积分交易记录
    await prisma.pointTransaction.create({
      data: {
        userId,
        amount: 100,
        type: 'EARN',
        description: `完成任务: ${taskId}`
      }
    });
    
    return NextResponse.json({
      success: true,
      completion,
      message: '任务完成！获得100积分！'
    });
    
  } catch (error) {
    console.error('Complete task error:', error);
    return NextResponse.json(
      { 
        error: '完成任务失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 