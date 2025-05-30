import { NextResponse } from 'next/server';
import { pointsStorage } from '@/lib/storage';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentPoints = pointsStorage.getCurrentPoints();
    const transactions = pointsStorage.getTransactions();
    
    return NextResponse.json({
      success: true,
      points: currentPoints,
      transactions: transactions.slice(-10) // 返回最近10条记录
    });
    
  } catch (error) {
    console.error('Get points error:', error);
    return NextResponse.json(
      { error: '获取积分失败' },
      { status: 500 }
    );
  }
} 