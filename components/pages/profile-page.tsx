"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Phone, 
  User, 
  Calendar, 
  Award, 
  Settings, 
  LogOut,
  Users
} from 'lucide-react'

interface UserInfo {
  id: string
  phone: string
  name: string
  role: 'CHILD' | 'PARENT'
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [totalPoints, setTotalPoints] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)

  useEffect(() => {
    // 检查本地存储的用户信息
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!savedUser || !token) {
      // 如果没有登录信息，跳转到登录页
      router.push('/auth/phone-login')
      return
    }

    const userInfo = JSON.parse(savedUser)
    setUser(userInfo)

    // 获取用户统计信息
    fetchUserStats()
  }, [router])

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // 获取积分信息
      const pointsResponse = await fetch('/api/points', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json()
        setTotalPoints(pointsData.totalPoints || 0)
      }

      // 获取完成任务统计
      const tasksResponse = await fetch('/api/tasks/completed-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setCompletedTasks(tasksData.count || 0)
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/auth/phone-login')
  }

  const handleLogin = () => {
    router.push('/auth/phone-login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold">
              欢迎使用习惯管理工具
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">请先登录以使用所有功能</p>
            <Button 
              onClick={handleLogin}
              className="w-full"
            >
              手机号登录
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">我的</h1>
      </div>

      {/* 用户信息卡片 */}
      <Card className="mb-4 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                {user.name?.[0] || '用'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate mb-1">{user.name}</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-3 h-3 mr-1" />
                {user.phone}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">总积分</p>
            <p className="text-xl font-bold text-primary">{totalPoints}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">完成任务</p>
            <p className="text-xl font-bold text-primary">{completedTasks}</p>
          </CardContent>
        </Card>
      </div>

      {/* 账户信息 */}
      <Card className="mb-4 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">账户信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="flex items-center space-x-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">姓名</p>
              <p className="text-sm text-muted-foreground truncate">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">手机号</p>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">注册时间</p>
              <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-sm h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/50"
          onClick={() => router.push('/settings')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          设置
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start text-sm h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/50"
          onClick={() => router.push('/family')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Users className="w-4 h-4 text-primary" />
          </div>
          家庭管理
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start text-sm h-12 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
          onClick={handleLogout}
        >
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          退出登录
        </Button>
      </div>

      {/* 底部间距 */}
      <div className="h-4"></div>
    </div>
  )
}