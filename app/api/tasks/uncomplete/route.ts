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
    
    // 查找今日的完成记录
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        taskId_userId_completedDate: {
          userId,
          taskId,
          completedDate: today
        }
      }
    });
    
    if (!existingCompletion) {
      return NextResponse.json(
        { error: '今日未完成此任务，无法撤销' },
        { status: 400 }
      );
    }
    
    // 删除任务完成记录
    await prisma.taskCompletion.delete({
      where: {
        id: existingCompletion.id
      }
    });
    
    // 添加积分扣除记录
    await prisma.pointTransaction.create({
      data: {
        userId,
        amount: -100,
        type: 'SPEND',
        description: `撤销任务完成: ${taskId}`
      }
    });
    
    return NextResponse.json({
      success: true,
      message: '任务完成已撤销，扣除100积分'
    });
    
  } catch (error) {
    console.error('Uncomplete task error:', error);
    return NextResponse.json(
      { 
        error: '撤销任务失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 