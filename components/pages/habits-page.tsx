"use client"

import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Habit, Task } from '@/lib/data';

export default function HabitsPage() {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: '学习'
  });
  
  // 快速登录函数
  const quickLogin = async () => {
    try {
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
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setError(null);
        await loadHabits();
        toast({
          title: "登录成功",
          description: "已使用演示账号登录"
        });
      } else {
        toast({
          title: "登录失败",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('快速登录失败:', error);
      toast({
        title: "登录失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  
  // 加载习惯数据
  const loadHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("请先登录");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/habits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "无法获取习惯数据");
      }
    } catch (error) {
      console.error('Load habits error:', error);
      setError("网络错误，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  };
  
  // 切换习惯状态
  const toggleHabit = async (habitId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "未登录",
          description: "请先登录",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // 重新加载习惯列表以确保数据同步
        await loadHabits();
        toast({
          title: "状态更新",
          description: data.message
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "更新失败",
          description: errorData.error || "请稍后重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Toggle habit error:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };
  
  // 创建新习惯
  const createHabit = async () => {
    if (!newHabit.name || !newHabit.description) {
      toast({
        title: "信息不完整",
        description: "请填写习惯名称和描述",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newHabit,
          tasks: [] // 先创建空的任务列表，后续可以添加
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits);
        setNewHabit({ name: '', description: '', category: '学习' });
        setShowCreateDialog(false);
        toast({
          title: "创建成功",
          description: `习惯"${data.habit.name}"已创建`
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
      console.error('Create habit error:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };
  
  // 删除习惯
  const deleteHabit = async (habitId: string, habitName: string) => {
    if (!confirm(`确定要删除习惯"${habitName}"吗？此操作不可恢复。`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits);
        toast({
          title: "删除成功",
          description: `习惯"${habitName}"已删除`
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "删除失败",
          description: errorData.error || "请稍后重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Delete habit error:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    }
  };
  
  // 更新任务（暂时保留本地更新，后续可以添加API）
  const updateTask = (habitId: string, taskId: string, updates: Partial<Task>) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? {
            ...habit, 
            tasks: habit.tasks.map(task => 
              task.id === taskId 
                ? { ...task, ...updates } 
                : task
            )
          } 
        : habit
    ));
    setEditingTask(null);
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadHabits();
  }, []);

  // 按分类分组习惯
  const categorizedHabits = habits.reduce<Record<string, Habit[]>>((groups, habit) => {
    const category = habit.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(habit);
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
            <Button onClick={loadHabits} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">习惯管理</h1>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadHabits}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>新建习惯</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新习惯</DialogTitle>
                <DialogDescription>
                  添加一个新的好习惯来培养
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">习惯名称</Label>
                  <Input
                    id="name"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="例如：每日阅读"
                  />
                </div>
                <div>
                  <Label htmlFor="description">习惯描述</Label>
                  <Textarea
                    id="description"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    placeholder="描述这个习惯的目的和意义"
                  />
                </div>
                <div>
                  <Label htmlFor="category">分类</Label>
                  <Select value={newHabit.category} onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="学习">学习</SelectItem>
                      <SelectItem value="生活">生活</SelectItem>
                      <SelectItem value="社交">社交</SelectItem>
                      <SelectItem value="运动">运动</SelectItem>
                      <SelectItem value="健康">健康</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button onClick={createHabit}>
                  创建习惯
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">所有习惯</TabsTrigger>
          <TabsTrigger value="active">已启用</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="space-y-6">
            {Object.entries(categorizedHabits).map(([category, categoryHabits]) => (
              <div key={category}>
                <h2 className="text-lg font-medium mb-3 text-primary">{category}习惯</h2>
                <div className="space-y-3">
                  {categoryHabits.map(habit => (
                    <HabitCard 
                      key={habit.id} 
                      habit={habit} 
                      onToggle={() => toggleHabit(habit.id)}
                      onDelete={() => deleteHabit(habit.id, habit.name)}
                      onEditTask={(task) => {
                        setEditingTask(task);
                        setEditingHabitId(habit.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <div className="space-y-3">
            {habits.filter(h => h.active).map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onToggle={() => toggleHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id, habit.name)}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setEditingHabitId(habit.id);
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 编辑任务对话框 */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title">任务标题</Label>
                <Input
                  id="task-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="task-description">任务描述</Label>
                <Textarea
                  id="task-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              取消
            </Button>
            <Button onClick={() => {
              if (editingTask && editingHabitId) {
                updateTask(editingHabitId, editingTask.id, editingTask);
              }
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 习惯卡片组件
function HabitCard({ 
  habit, 
  onToggle, 
  onDelete,
  onEditTask 
}: { 
  habit: Habit; 
  onToggle: () => void;
  onDelete: () => void;
  onEditTask: (task: Task) => void;
}) {
  return (
    <Card className={`${habit.active ? 'border-primary/50' : 'border-muted'} transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{habit.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
            <Badge variant="outline" className="mt-2">{habit.category}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={habit.active}
              onCheckedChange={onToggle}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">任务列表：</h4>
          {habit.tasks.length > 0 ? (
            habit.tasks.map(task => (
              <div key={task.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditTask(task)}
                >
                  <Edit size={14} />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">暂无任务</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}