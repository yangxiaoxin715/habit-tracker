"use client"

import { useState, useEffect } from 'react';
import { Check, Clock, Star, RefreshCw, BarChart3, Undo2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { TaskWithHabit } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskWithHabit[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [uncompleting, setUncompleting] = useState<string | null>(null);
  
  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 获取格式化的今日日期
  const getTodayDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${month}月${day}日`;
  };

  // 获取认证头
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 加载今日任务和积分
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 检查是否有token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('未登录，请先登录');
        setLoading(false);
        return;
      }
      
      // 并行加载任务和积分
      const [tasksResponse, pointsResponse] = await Promise.all([
        fetch('/api/tasks/today', {
          headers: getAuthHeaders()
        }),
        fetch('/api/points', {
          headers: getAuthHeaders()
        })
      ]);
      
      // 检查认证状态
      if (tasksResponse.status === 401 || pointsResponse.status === 401) {
        setError('登录已过期，请重新登录');
        setLoading(false);
        return;
      }
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      } else {
        console.error('获取任务失败:', await tasksResponse.text());
        setError('获取任务数据失败');
      }
      
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setPoints(pointsData.totalPoints || 0);
      } else {
        console.error('获取积分失败:', await pointsResponse.text());
      }
      
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('网络连接失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  // 快速登录演示账号
  const quickLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138000',
          name: '演示用户',
          role: 'PARENT'
        })
      });

      const data = await response.json();

      if (data.success) {
        // 存储用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // 重新加载数据
        await loadData();
        
        toast({
          title: "登录成功",
          description: "欢迎使用习惯管理工具！",
        });
      } else {
        setError(data.message || '登录失败');
      }
    } catch (error) {
      console.error('快速登录失败:', error);
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 重新登录
  const handleRelogin = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/auth/phone-login';
  };

  // 完成任务
  const completeTask = async (taskId: string, habitId: string) => {
    if (completing || uncompleting) return; // 防止重复点击
    
    try {
      setCompleting(taskId);
      
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ taskId, habitId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 更新本地状态
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, completed: true } 
              : task
          )
        );
        setPoints(prev => prev + 100);
        
        toast({
          title: "任务完成！",
          description: `获得100积分！当前积分：${points + 100}`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "完成失败",
          description: errorData.error || "请稍后重试",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('完成任务失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setCompleting(null);
    }
  };

  // 撤销任务完成
  const uncompleteTask = async (taskId: string, habitId: string) => {
    if (completing || uncompleting) return; // 防止重复点击
    
    try {
      setUncompleting(taskId);
      
      const response = await fetch('/api/tasks/uncomplete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ taskId, habitId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 更新本地状态
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, completed: false } 
              : task
          )
        );
        setPoints(prev => prev - 100);
        
        toast({
          title: "任务已撤销",
          description: `扣除100积分，当前积分：${points - 100}`,
          variant: "default"
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "撤销失败",
          description: errorData.error || "请稍后重试",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('撤销任务失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setUncompleting(null);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 按习惯分组任务
  const groupedTasks = tasks.reduce<Record<string, TaskWithHabit[]>>((groups, task) => {
    const habitId = task.habitId;
    if (!groups[habitId]) {
      groups[habitId] = [];
    }
    groups[habitId].push(task);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="flex items-center">
            <RefreshCw className="animate-spin h-8 w-8 text-primary" />
            <span className="ml-2">加载中...</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">如果加载时间过长，可以尝试：</p>
            <Button onClick={quickLogin} variant="outline" size="sm">
              快速体验 (演示账号)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 pb-20">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
          </div>
          <div className="flex flex-col space-y-2 w-full max-w-xs">
            <Button onClick={quickLogin} className="w-full">
              快速体验 (演示账号)
            </Button>
            <div className="flex space-x-3">
              <Button onClick={loadData} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>
              <Button onClick={handleRelogin} variant="outline" className="flex-1">
                重新登录
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">今日任务</h1>
          <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{getTodayDate()}</span>
          </div>
        </div>
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
        <CardContent className="p-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm">今日完成进度</span>
            <span className="text-sm font-medium">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" indicatorClassName="bg-white" />
        </CardContent>
      </Card>

      {Object.entries(groupedTasks).map(([habitId, tasks]) => {
        const habitName = tasks[0]?.habitName || '未命名习惯';
        
        return (
          <div key={habitId} className="mb-4">
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="mr-2 border-primary/50 text-primary">{habitName}</Badge>
            </div>
            
            {tasks.map(task => (
              <Card 
                key={task.id} 
                className={`mb-3 ${
                  task.completed 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'hover:border-primary/50 hover:bg-primary/5'
                } transition-all duration-200`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.completed ? (
                        <>
                          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                          <Button 
                            onClick={() => uncompleteTask(task.id, task.habitId)} 
                            size="sm" 
                            variant="outline"
                            disabled={uncompleting === task.id}
                            className="rounded-full h-9 w-9 p-0 border-orange-200 text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-300"
                          >
                            {uncompleting === task.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Undo2 className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => completeTask(task.id, task.habitId)} 
                          size="sm" 
                          disabled={completing === task.id}
                          className="rounded-full h-9 w-9 p-0 bg-primary hover:bg-primary/90 transition-colors"
                        >
                          {completing === task.id ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <Check className="h-5 w-5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}
      
      <div className="mt-8 flex justify-between">
        <Link href="/report">
          <Button variant="outline" className="flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10">
            <Clock size={16} />
            <span>生成周报告</span>
          </Button>
        </Link>
        
        <Link href="/stats">
          <Button variant="outline" className="flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10">
            <BarChart3 size={16} />
            <span>数据统计</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}