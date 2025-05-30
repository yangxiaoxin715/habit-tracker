import fs from 'fs';
import path from 'path';
import { Habit, TaskWithHabit, Reward } from './data';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const HABITS_FILE = path.join(DATA_DIR, 'habits.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const POINTS_FILE = path.join(DATA_DIR, 'points.json');
const REWARDS_FILE = path.join(DATA_DIR, 'rewards.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取JSON文件
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

// 写入JSON文件
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// 积分系统
export interface PointTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  createdAt: string;
}

export const pointsStorage = {
  getTransactions: (): PointTransaction[] => readJsonFile(POINTS_FILE, []),
  saveTransactions: (transactions: PointTransaction[]): void => writeJsonFile(POINTS_FILE, transactions),
  
  getCurrentPoints: (): number => {
    const transactions = pointsStorage.getTransactions();
    return transactions.reduce((total, t) => {
      return total + (t.type === 'earn' ? t.amount : -t.amount);
    }, 0);
  },
  
  addPoints: (amount: number, description: string): number => {
    const transactions = pointsStorage.getTransactions();
    const transaction: PointTransaction = {
      id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: 'earn',
      description,
      createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    pointsStorage.saveTransactions(transactions);
    
    return pointsStorage.getCurrentPoints();
  },
  
  spendPoints: (amount: number, description: string): number => {
    const currentPoints = pointsStorage.getCurrentPoints();
    if (currentPoints < amount) {
      throw new Error('积分不足');
    }
    
    const transactions = pointsStorage.getTransactions();
    const transaction: PointTransaction = {
      id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: 'spend',
      description,
      createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    pointsStorage.saveTransactions(transactions);
    
    return pointsStorage.getCurrentPoints();
  }
};

// 习惯相关操作
export const habitStorage = {
  getAll: (): Habit[] => readJsonFile(HABITS_FILE, []),
  save: (habits: Habit[]): void => writeJsonFile(HABITS_FILE, habits),
  
  add: (habit: Habit): Habit[] => {
    const habits = habitStorage.getAll();
    habits.push(habit);
    habitStorage.save(habits);
    return habits;
  },
  
  update: (habitId: string, updates: Partial<Habit>): Habit[] => {
    const habits = habitStorage.getAll();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      habitStorage.save(habits);
    }
    return habits;
  },
  
  delete: (habitId: string): Habit[] => {
    const habits = habitStorage.getAll().filter(h => h.id !== habitId);
    habitStorage.save(habits);
    return habits;
  }
};

// 任务完成记录
export interface TaskCompletion {
  id: string;
  taskId: string;
  habitId: string;
  completedAt: string;
  date: string; // YYYY-MM-DD 格式
  pointsEarned: number;
}

export const taskStorage = {
  getCompletions: (): TaskCompletion[] => readJsonFile(TASKS_FILE, []),
  saveCompletions: (completions: TaskCompletion[]): void => writeJsonFile(TASKS_FILE, completions),
  
  completeTask: (taskId: string, habitId: string, pointsEarned: number = 100): TaskCompletion => {
    const completions = taskStorage.getCompletions();
    const today = new Date().toISOString().split('T')[0];
    
    // 检查今天是否已经完成过这个任务
    const existingCompletion = completions.find(
      c => c.taskId === taskId && c.date === today
    );
    
    if (existingCompletion) {
      return existingCompletion;
    }
    
    const completion: TaskCompletion = {
      id: `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      habitId,
      completedAt: new Date().toISOString(),
      date: today,
      pointsEarned
    };
    
    completions.push(completion);
    taskStorage.saveCompletions(completions);
    
    return completion;
  },
  
  getCompletionsForDate: (date: string): TaskCompletion[] => {
    return taskStorage.getCompletions().filter(c => c.date === date);
  },
  
  isTaskCompletedToday: (taskId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return taskStorage.getCompletions().some(
      c => c.taskId === taskId && c.date === today
    );
  }
};

// 奖励系统
export const rewardStorage = {
  getAll: (): Reward[] => readJsonFile(REWARDS_FILE, []),
  save: (rewards: Reward[]): void => writeJsonFile(REWARDS_FILE, rewards),
  
  redeemReward: (rewardId: string): Reward => {
    const rewards = rewardStorage.getAll();
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      throw new Error('奖励不存在');
    }
    
    if (reward.earned) {
      throw new Error('奖励已经兑换过了');
    }
    
    const currentPoints = pointsStorage.getCurrentPoints();
    if (currentPoints < reward.points) {
      throw new Error('积分不足');
    }
    
    // 扣除积分
    pointsStorage.spendPoints(reward.points, `兑换奖励: ${reward.name}`);
    
    // 标记奖励为已获得
    const updatedRewards = rewards.map(r => 
      r.id === rewardId ? { ...r, earned: true } : r
    );
    rewardStorage.save(updatedRewards);
    
    return { ...reward, earned: true };
  }
}; 