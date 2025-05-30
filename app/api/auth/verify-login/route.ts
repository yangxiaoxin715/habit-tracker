import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// 使用外部Map存储验证码（需要和send-code共享）
declare global {
  var verificationCodes: Map<string, any> | undefined
}

const verificationCodes = globalThis.verificationCodes ?? new Map()
if (process.env.NODE_ENV !== 'production') globalThis.verificationCodes = verificationCodes

export async function POST(request: Request) {
  try {
    const { phone, code, name, role, parentPhone } = await request.json()

    // 验证必填字段
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: '请输入手机号和验证码' },
        { status: 400 }
      )
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入正确的手机号' },
        { status: 400 }
      )
    }

    // 验证码格式检查
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: '请输入6位数字验证码' },
        { status: 400 }
      )
    }

    // 开发环境：任何6位数字都可以通过验证
    // 生产环境：检查存储的验证码
    let isValidCode = false
    
    if (process.env.NODE_ENV === 'development') {
      // 开发环境：简化验证逻辑
      isValidCode = /^\d{6}$/.test(code)
      console.log(`开发环境验证码验证: ${phone} - ${code} -> ${isValidCode}`)
    } else {
      // 生产环境：检查存储的验证码
      const storedData = verificationCodes.get(phone)
      isValidCode = storedData && storedData.code === code && Date.now() <= storedData.expiresAt
    }

    if (!isValidCode) {
      return NextResponse.json(
        { success: false, message: '验证码无效或已过期' },
        { status: 400 }
      )
    }

    // 删除已使用的验证码
    verificationCodes.delete(phone)
    verificationCodes.delete(`${phone}_time`)

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

      console.log('新用户注册:', { 
        phone: user.phone, 
        name: user.name, 
        role: user.role,
        hasParent: !!parentId
      })
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
    console.error('验证码登录失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
} 