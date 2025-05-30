'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Phone, User } from 'lucide-react'

interface LoginForm {
  phone: string
  name: string
}

export default function PhoneLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState<LoginForm>({
    phone: '',
    name: ''
  })

  // 简化登录
  const handleLogin = async () => {
    if (!form.phone) {
      setError('请输入手机号')
      return
    }

    if (!form.name) {
      setError('请输入姓名')
      return
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(form.phone)) {
      setError('请输入正确的手机号')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          role: 'PARENT' // 默认设置为家长角色
        })
      })

      const data = await response.json()

      if (data.success) {
        // 存储用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        // 跳转到首页
        router.push('/')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('登录失败，请重试')
      console.error('登录错误:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateForm = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            习惯管理工具
          </CardTitle>
          <CardDescription className="text-gray-600">
            家长和孩子共同培养好习惯
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="pl-10"
                maxLength={11}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">家庭昵称</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="请输入家庭昵称，如：小明家"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              这个昵称将用于标识您的家庭账户
            </p>
          </div>

          <Button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800"
          >
            {isLoading ? '登录中...' : '开始使用'}
          </Button>

          <div className="text-center text-xs text-gray-500 mt-6">
            <p>演示版本 - 家庭共用账号，无需验证码</p>
            <p className="mt-1">推荐使用：13800138000 | 小明家</p>
            <p className="mt-1 text-gray-400">家长和孩子可以共同使用这个账号管理习惯</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 