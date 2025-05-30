import { NextResponse } from 'next/server'

// 使用全局变量存储验证码（开发环境）
declare global {
  var verificationCodes: Map<string, any> | undefined
}

const verificationCodes = globalThis.verificationCodes ?? new Map()
if (process.env.NODE_ENV !== 'production') globalThis.verificationCodes = verificationCodes

// 生成6位验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 模拟发送短信的函数
async function sendSMS(phone: string, code: string): Promise<boolean> {
  console.log('='.repeat(50))
  console.log(`📱 验证码发送成功！`)
  console.log(`📞 手机号: ${phone}`)
  console.log(`🔢 验证码: ${code}`)
  console.log(`⏰ 有效期: 5分钟`)
  console.log('='.repeat(50))
  return true
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入正确的手机号' },
        { status: 400 }
      )
    }

    // 检查是否在限制时间内已发送过验证码（1分钟限制）
    const lastSent = verificationCodes.get(`${phone}_time`)
    if (lastSent && Date.now() - lastSent < 60 * 1000) {
      return NextResponse.json(
        { success: false, message: '请等待1分钟后再次发送验证码' },
        { status: 429 }
      )
    }

    // 生成验证码
    const code = generateVerificationCode()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5分钟后过期

    // 保存验证码到内存
    verificationCodes.set(phone, { code, expiresAt })
    verificationCodes.set(`${phone}_time`, Date.now())

    // 发送短信
    const sent = await sendSMS(phone, code)
    
    if (!sent) {
      return NextResponse.json(
        { success: false, message: '验证码发送失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送，请注意查收'
    })

  } catch (error) {
    console.error('发送验证码失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
} 