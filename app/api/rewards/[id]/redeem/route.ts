import { NextRequest, NextResponse } from 'next/server';
import { rewardStorage, pointsStorage } from '@/lib/storage';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 兑换奖励
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rewardId = params.id;
    
    if (!rewardId) {
      return NextResponse.json(
        { error: '缺少奖励ID' },
        { status: 400 }
      );
    }
    
    const rewards = rewardStorage.getAll();
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return NextResponse.json(
        { error: '奖励不存在' },
        { status: 404 }
      );
    }
    
    if (reward.earned && reward.type === 'badge') {
      return NextResponse.json(
        { error: '该徽章已经获得过了' },
        { status: 400 }
      );
    }
    
    const currentPoints = pointsStorage.getCurrentPoints();
    if (currentPoints < reward.points) {
      return NextResponse.json(
        { error: `积分不足，需要${reward.points}积分，当前${currentPoints}积分` },
        { status: 400 }
      );
    }
    
    // 扣除积分
    pointsStorage.spendPoints(reward.points, `兑换奖励: ${reward.name}`);
    
    // 对于徽章类型，标记为已获得；其他类型可以重复兑换
    let updatedRewards = rewards;
    if (reward.type === 'badge') {
      updatedRewards = rewards.map(r => 
        r.id === rewardId ? { ...r, earned: true } : r
      );
      rewardStorage.save(updatedRewards);
    }
    
    const newPoints = pointsStorage.getCurrentPoints();
    
    return NextResponse.json({
      success: true,
      reward: { ...reward, earned: reward.type === 'badge' ? true : reward.earned },
      pointsSpent: reward.points,
      remainingPoints: newPoints,
      message: `成功兑换"${reward.name}"！`
    });
    
  } catch (error) {
    console.error('Redeem reward error:', error);
    return NextResponse.json(
      { 
        error: '兑换奖励失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 