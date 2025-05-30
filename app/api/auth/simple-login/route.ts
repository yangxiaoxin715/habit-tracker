import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { phone, name, role, parentPhone } = await request.json()

    console.log('简化登录请求:', { phone, name, role, parentPhone })

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入正确的手机号' },
        { status: 400 }
      )
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      // 新用户注册
      if (!name) {
        return NextResponse.json(
          { success: false, message: '首次登录请输入姓名' },
          { status: 400 }
        )
      }

      // 如果是孩子账号且提供了家长手机号，查找家长
      let parentId = null
      if (role === 'CHILD' && parentPhone) {
        const parent = await prisma.user.findUnique({
          where: { phone: parentPhone }
        })
        if (parent && parent.role === 'PARENT') {
          parentId = parent.id
        }
      }

      user = await prisma.user.create({
        data: {
          phone,
          name,
          role: role || 'CHILD',
          parentId
        }
      })

      console.log('新用户注册成功:', { 
        phone: user.phone, 
        name: user.name, 
        role: user.role,
        hasParent: !!parentId
      })
    } else {
      console.log('用户登录:', { phone: user.phone, name: user.name })
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        role: user.role 
      },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    })

  } catch (error) {
    console.error('简化登录失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json(
      { success: false, message: `服务器错误: ${errorMessage}` },
      { status: 500 }
    )
  }
} 