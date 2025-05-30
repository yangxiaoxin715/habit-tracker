import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取所有习惯
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
    
    // 获取用户的所有习惯
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      habits
    });
    
  } catch (error) {
    console.error('Get habits error:', error);
    return NextResponse.json(
      { error: '获取习惯失败' },
      { status: 500 }
    );
  }
}

// 创建新习惯
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
    const { name, description, category, tasks } = body;
    
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 创建新习惯
    const newHabit = await prisma.habit.create({
      data: {
        name,
        description,
        category,
        active: true,
        userId,
        tasks: {
          create: (tasks || []).map((task: any, index: number) => ({
            title: task.title,
            description: task.description,
            order: index + 1
          }))
        }
      },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      habit: newHabit
    });
    
  } catch (error) {
    console.error('Create habit error:', error);
    return NextResponse.json(
      { error: '创建习惯失败' },
      { status: 500 }
    );
  }
} 