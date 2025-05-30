import { NextResponse } from 'next/server';
import { rewardStorage } from '@/lib/storage';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取已获得的奖励
export async function GET() {
  try {
    const rewards = rewardStorage.getAll();
    const earnedRewards = rewards.filter(r => r.earned);
    
    return NextResponse.json({
      success: true,
      earnedRewards,
      count: earnedRewards.length
    });
    
  } catch (error) {
    console.error('Get earned rewards error:', error);
    return NextResponse.json(
      { error: '获取已获得奖励失败' },
      { status: 500 }
    );
  }
} 