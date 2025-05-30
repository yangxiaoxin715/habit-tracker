import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(11, '手机号格式不正确'),
  password: z.string().min(6, '密码至少需要6位'),
  role: z.enum(['PARENT', 'CHILD']).default('CHILD'),
  parentPhone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, password, role, parentPhone } = registerSchema.parse(body)

    // 检查手机号是否已被使用
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 处理父子关系
    let parentId = null
    if (role === 'CHILD' && parentPhone) {
      const parent = await prisma.user.findUnique({
        where: { phone: parentPhone }
      })
      
      if (!parent) {
        return NextResponse.json(
          { error: '未找到家长账号' },
          { status: 400 }
        )
      }
      
      if (parent.role !== 'PARENT') {
        return NextResponse.json(
          { error: '该手机号不是家长账号' },
          { status: 400 }
        )
      }
      
      parentId = parent.id
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        role,
        parentId
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user
    })

  } catch (error) {
    console.error('Register error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
} 