"use client"

import { useState, useEffect } from 'react';
import { Star, Trophy, Gift, Award, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Reward } from '@/lib/data';
import Image from 'next/image';

export default function RewardsPage() {
  const { toast } = useToast();
  const [points, setPoints] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customReward, setCustomReward] = useState({ 
    name: '', 
    description: '',
    points: 500 
  });
  
  // 计算等级
  const level = points < 300 ? '新手' : points < 1000 ? '进阶' : '高手';
  const nextLevel = level === '新手' ? '进阶' : level === '进阶' ? '高手' : '大师';
  const levelPoints = level === '新手' ? 300 : level === '进阶' ? 1000 : 2000;
  const progress = Math.min(100, (points / levelPoints) * 100);
  
  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载积分和奖励
      const [pointsResponse, rewardsResponse] = await Promise.all([
        fetch('/api/points'),
        fetch('/api/rewards')
      ]);
      
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setPoints(pointsData.points || 0);
      }
      
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setRewards(rewardsData.rewards || []);
      }
      
    } catch (error) {
      console.error('Load data error:', error);
      toast({
        title: "加载失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 兑换奖励
  const redeemReward = async (reward: Reward) => {
    if (redeeming) return; // 防止重复点击
    
    try {
      setRedeeming(reward.id);
      
      const response = await fetch(`/api/rewards/${reward.id}/redeem`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 更新本地状态
        setPoints(data.remainingPoints);
        if (reward.type === 'badge') {
          setRewards(prev => 
            prev.map(r => 
              r.id === reward.id 
                ? { ...r, earned: true } 
                : r
            )
          );
        }
        
        toast({
          title: "兑换成功！",
          description: data.message
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "兑换失败",
          description: errorData.error || "请稍后重试",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Redeem reward error:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setRedeeming(null);
    }
  };

  // 创建自定义奖励
  const createCustomReward = async () => {
    if (!customReward.name || !customReward.description) {
      toast({
        title: "信息不完整",
        description: "请填写奖励名称和描述",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customReward),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
        setCustomReward({ name: '', description: '', points: 500 });
        setShowCustomDialog(false);
        toast({
          title: "创建成功",
          description: `奖励"${data.reward.name}"已创建`
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "创建失败",
          description: errorData.error || "请稍后重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Create reward error:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">心想事成</h1>
        <div className="flex items-center gap-2">
          <Star className="text-primary fill-primary" size={20} />
          <span className="font-bold">{points}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <Card className="mb-6 bg-gold-gradient text-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-white" size={24} />
              <div>
                <p className="text-sm opacity-90">当前等级</p>
                <p className="font-bold">{level}</p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1 border-white/50 text-white">
              距离{nextLevel}：{Math.max(0, levelPoints - points)}积分
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-90">
              <span>0</span>
              <span>{levelPoints}</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" indicatorClassName="bg-white" />
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">成就徽章</h2>
          <Badge variant="secondary" className="text-xs">
            已获得 {rewards.filter(r => r.type === 'badge' && r.earned).length} / {rewards.filter(r => r.type === 'badge').length}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {rewards
            .filter(reward => reward.type === 'badge')
            .map(reward => (
              <Card key={reward.id} className={`transition-all duration-300 ${
                reward.earned 
                  ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/50 shadow-lg scale-105' 
                  : 'hover:border-primary/30'
              }`}>
                <CardContent className="pt-6 pb-4 text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                    reward.earned 
                      ? 'bg-primary/20 animate-pulse shadow-lg' 
                      : 'bg-primary/10'
                  }`}>
                    <Award className={`h-8 w-8 transition-all duration-300 ${
                      reward.earned 
                        ? 'text-primary animate-bounce' 
                        : 'text-muted-foreground'
                    }`} />
                    {reward.earned && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <h3 className={`font-medium ${reward.earned ? 'text-primary' : ''}`}>
                    {reward.name}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    reward.earned ? 'text-primary/70' : 'text-muted-foreground'
                  }`}>
                    {reward.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 justify-center">
                  {reward.earned ? (
                    <Badge 
                      variant="outline" 
                      className="border-primary/50 text-primary bg-primary/5 shadow-sm"
                    >
                      ✨ 已获得 ✨
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => redeemReward(reward)}
                      disabled={points < reward.points || redeeming === reward.id}
                      className="border-primary/50 text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      {redeeming === reward.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        `${reward.points}积分兑换`
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">我的愿望</h2>
          <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                添加愿望
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建自定义奖励</DialogTitle>
                <DialogDescription>
                  设定一个您想要的奖励目标
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reward-name">奖励名称</Label>
                  <Input
                    id="reward-name"
                    value={customReward.name}
                    onChange={(e) => setCustomReward({ ...customReward, name: e.target.value })}
                    placeholder="例如：看电影"
                  />
                </div>
                <div>
                  <Label htmlFor="reward-description">奖励描述</Label>
                  <Textarea
                    id="reward-description"
                    value={customReward.description}
                    onChange={(e) => setCustomReward({ ...customReward, description: e.target.value })}
                    placeholder="描述这个奖励的具体内容"
                  />
                </div>
                <div>
                  <Label htmlFor="reward-points">所需积分</Label>
                  <Input
                    id="reward-points"
                    type="number"
                    min="50"
                    max="2000"
                    value={customReward.points}
                    onChange={(e) => setCustomReward({ ...customReward, points: parseInt(e.target.value) || 500 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                  取消
                </Button>
                <Button onClick={createCustomReward}>
                  创建奖励
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-4">
          {rewards
            .filter(reward => reward.type === 'physical' || reward.type === 'custom')
            .map(reward => (
              <Card key={reward.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {reward.image ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={reward.image}
                            alt={reward.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Gift className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {reward.type === 'custom' ? '自定义' : '实物奖励'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      onClick={() => redeemReward(reward)}
                      disabled={points < reward.points || redeeming === reward.id}
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      {redeeming === reward.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        `${reward.points}积分兑换`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}