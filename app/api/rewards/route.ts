import { NextRequest, NextResponse } from 'next/server';
import { rewardStorage } from '@/lib/storage';
import { getRewards, Reward } from '@/lib/data';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取所有奖励
export async function GET() {
  try {
    let rewards = rewardStorage.getAll();
    
    // 如果没有奖励数据，初始化默认奖励
    if (rewards.length === 0) {
      rewards = getRewards();
      rewardStorage.save(rewards);
    }
    
    return NextResponse.json({
      success: true,
      rewards
    });
    
  } catch (error) {
    console.error('Get rewards error:', error);
    return NextResponse.json(
      { error: '获取奖励失败' },
      { status: 500 }
    );
  }
}

// 创建自定义奖励
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, points, type = 'custom' } = body;
    
    if (!name || !description || !points) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    if (points < 50) {
      return NextResponse.json(
        { error: '奖励积分不能少于50' },
        { status: 400 }
      );
    }
    
    // 创建新奖励
    const newReward: Reward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      points,
      type,
      image: null,
      earned: false
    };
    
    const rewards = rewardStorage.getAll();
    rewards.push(newReward);
    rewardStorage.save(rewards);
    
    return NextResponse.json({
      success: true,
      reward: newReward,
      rewards
    });
    
  } catch (error) {
    console.error('Create reward error:', error);
    return NextResponse.json(
      { error: '创建奖励失败' },
      { status: 500 }
    );
  }
} 