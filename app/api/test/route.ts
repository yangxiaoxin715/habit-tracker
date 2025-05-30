import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API 工作正常',
    timestamp: new Date().toISOString()
  });
} 