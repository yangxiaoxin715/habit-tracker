"use client"

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BarChart, LineChart, DonutChart } from '@/components/ui/simple-chart';

interface StatsData {
  overview: {
    totalHabits: number;
    activeHabits: number;
    totalPoints: number;
    totalTasksCompleted: number;
    todayCompletions: number;
    todayPoints: number;
    weekCompletions: number;
    weekPoints: number;
  };
  habitStats: Array<{
    habitId: string;
    habitName: string;
    category: string;
    totalCompletions: number;
    weekCompletions: number;
    completionRate: number;
  }>;
  dailyTrend: Array<{
    date: string;
    completions: number;
    points: number;
  }>;
  categoryStats: Record<string, {
    totalHabits: number;
    activeHabits: number;
    completions: number;
    points: number;
  }>;
  streakStats: {
    currentStreak: number;
    maxStreak: number;
    totalActiveDays: number;
  };
  topHabits: Array<{
    habitId: string;
    habitName: string;
    category: string;
    totalCompletions: number;
    weekCompletions: number;
    completionRate: number;
  }>;
}

export default function StatsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatsData | null>(null);

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats/overview');
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast({
          title: "加载失败",
          description: "无法获取统计数据",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Load stats error:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-3 pb-20 max-w-md mx-auto">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2 text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-3 pb-20 max-w-md mx-auto">
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">暂无统计数据</p>
        </div>
      </div>
    );
  }

  // 准备图表数据
  const dailyChartData = data.dailyTrend.map(item => ({
    label: new Date(item.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
    value: item.completions
  }));

  const categoryChartData = Object.entries(data.categoryStats).map(([category, stats]) => ({
    label: category,
    value: stats.completions,
    color: getCategoryColor(category)
  }));

  const topHabitsChartData = data.topHabits.slice(0, 5).map(habit => ({
    label: habit.habitName.length > 4 ? habit.habitName.slice(0, 4) + '...' : habit.habitName,
    value: habit.totalCompletions,
    color: getCategoryColor(habit.category)
  }));

  return (
    <div className="p-3 pb-20 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">数据分析</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Target className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground mb-1">今日完成</p>
              <p className="text-xl font-bold">{data.overview.todayCompletions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Award className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground mb-1">当前积分</p>
              <p className="text-xl font-bold">{data.overview.totalPoints}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground mb-1">连续天数</p>
              <p className="text-xl font-bold">{data.streakStats.currentStreak}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground mb-1">活跃习惯</p>
              <p className="text-xl font-bold">{data.overview.activeHabits}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细统计 */}
      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="trend" className="text-xs">趋势</TabsTrigger>
          <TabsTrigger value="habits" className="text-xs">排行</TabsTrigger>
          <TabsTrigger value="category" className="text-xs">分类</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                最近7天完成趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={dailyChartData} height={140} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">连续完成统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">当前连续</span>
                  <Badge variant="outline" className="text-xs">{data.streakStats.currentStreak} 天</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">最长连续</span>
                  <Badge variant="outline" className="text-xs">{data.streakStats.maxStreak} 天</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">活跃天数</span>
                  <Badge variant="outline" className="text-xs">{data.streakStats.totalActiveDays} 天</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">最活跃习惯</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={topHabitsChartData} height={140} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">习惯详细排行</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.topHabits.slice(0, 5).map((habit, index) => (
                  <div key={habit.habitId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{habit.habitName}</p>
                        <p className="text-xs text-muted-foreground">{habit.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{habit.totalCompletions}</p>
                      <p className="text-xs text-muted-foreground">次</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">分类完成分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <DonutChart data={categoryChartData} size={160} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">分类详细统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.categoryStats).map(([category, stats]) => (
                  <div key={category} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{category}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.activeHabits}/{stats.totalHabits} 个习惯
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{stats.completions}</p>
                      <p className="text-xs text-muted-foreground">{stats.points} 积分</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 获取分类颜色
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    '学习': '#3b82f6',
    '生活': '#10b981',
    '社交': '#f59e0b',
    '运动': '#ef4444',
    '健康': '#8b5cf6',
    '默认': '#6b7280'
  };
  return colors[category] || colors['默认'];
} 