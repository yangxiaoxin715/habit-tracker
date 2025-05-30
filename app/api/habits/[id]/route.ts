import { NextRequest, NextResponse } from 'next/server';
import { habitStorage } from '@/lib/storage';
import { Habit } from '@/lib/data';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 更新习惯
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = params.id;
    const body = await request.json();
    const { name, description, category, tasks, active } = body;
    
    if (!habitId) {
      return NextResponse.json(
        { error: '缺少习惯ID' },
        { status: 400 }
      );
    }
    
    const updates: Partial<Habit> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (tasks !== undefined) updates.tasks = tasks;
    if (active !== undefined) updates.active = active;
    
    const updatedHabits = habitStorage.update(habitId, updates);
    const updatedHabit = updatedHabits.find(h => h.id === habitId);
    
    if (!updatedHabit) {
      return NextResponse.json(
        { error: '习惯不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      habit: updatedHabit,
      habits: updatedHabits
    });
    
  } catch (error) {
    console.error('Update habit error:', error);
    return NextResponse.json(
      { error: '更新习惯失败' },
      { status: 500 }
    );
  }
}

// 删除习惯
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = params.id;
    
    if (!habitId) {
      return NextResponse.json(
        { error: '缺少习惯ID' },
        { status: 400 }
      );
    }
    
    const updatedHabits = habitStorage.delete(habitId);
    
    return NextResponse.json({
      success: true,
      habits: updatedHabits,
      message: '习惯已删除'
    });
    
  } catch (error) {
    console.error('Delete habit error:', error);
    return NextResponse.json(
      { error: '删除习惯失败' },
      { status: 500 }
    );
  }
} 