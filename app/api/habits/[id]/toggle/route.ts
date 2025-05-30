import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 切换习惯状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const habitId = params.id;
    
    if (!habitId) {
      return NextResponse.json(
        { error: '缺少习惯ID' },
        { status: 400 }
      );
    }
    
    // 查找习惯
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: userId
      }
    });
    
    if (!habit) {
      return NextResponse.json(
        { error: '习惯不存在' },
        { status: 404 }
      );
    }
    
    // 切换状态
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: { active: !habit.active },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      habit: updatedHabit,
      message: `习惯已${updatedHabit.active ? '启用' : '禁用'}`
    });
    
  } catch (error) {
    console.error('Toggle habit error:', error);
    return NextResponse.json(
      { error: '切换习惯状态失败' },
      { status: 500 }
    );
  }
} 