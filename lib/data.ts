export interface Task {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  tasks: Task[];
  active: boolean;
}

export interface TaskWithHabit extends Task {
  habitId: string;
  habitName: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'badge' | 'physical' | 'custom';
  image: string | null;
  earned: boolean;
}

export interface ReportData {
  overallCompletion: number;
  habitCompletions: {
    id: string;
    name: string;
    completion: number;
    completed: number;
    total: number;
  }[];
  suggestions: {
    type: 'positive' | 'improvement';
    title: string;
    content: string;
  }[];
  achievement: {
    title: string;
    description: string;
  };
}

// 初始习惯数据
export function getHabits(): Habit[] {
  return [
    {
      id: 'habit1',
      name: '每日阅读',
      description: '培养阅读兴趣，提高语言能力',
      category: '学习',
      active: true,
      tasks: [
        {
          id: 'task1-1',
          title: '阅读10分钟',
          description: '每天固定时间阅读课外书籍'
        },
        {
          id: 'task1-2',
          title: '分享阅读内容',
          description: '向家长简单分享今天读到的内容'
        },
        {
          id: 'task1-3',
          title: '提出一个问题',
          description: '针对阅读内容提出一个问题并思考'
        }
      ]
    },
    {
      id: 'habit2',
      name: '按时完成作业',
      description: '培养责任感和自主学习能力',
      category: '学习',
      active: true,
      tasks: [
        {
          id: 'task2-1',
          title: '整理今日作业',
          description: '确认并列出所有需要完成的作业'
        },
        {
          id: 'task2-2',
          title: '专注完成作业',
          description: '在固定时间内专注完成作业，不受干扰'
        },
        {
          id: 'task2-3',
          title: '自我检查',
          description: '完成后自行检查作业是否有错误'
        }
      ]
    },
    {
      id: 'habit3',
      name: '整理书包',
      description: '培养条理性和规划能力',
      category: '生活',
      active: false,
      tasks: [
        {
          id: 'task3-1',
          title: '清理不需要的物品',
          description: '将不需要的纸张和垃圾清理出书包'
        },
        {
          id: 'task3-2',
          title: '准备明天所需物品',
          description: '根据课程表准备明天需要的书本和文具'
        }
      ]
    },
    {
      id: 'habit4',
      name: '专注力训练',
      description: '提升学习效率和注意力',
      category: '学习',
      active: false,
      tasks: [
        {
          id: 'task4-1',
          title: '番茄工作法学习',
          description: '使用25分钟专注+5分钟休息的模式'
        },
        {
          id: 'task4-2',
          title: '减少干扰源',
          description: '学习时关闭手机和其他干扰设备'
        }
      ]
    },
    {
      id: 'habit5',
      name: '体育锻炼',
      description: '增强体质，培养运动习惯',
      category: '生活',
      active: false,
      tasks: [
        {
          id: 'task5-1',
          title: '运动15分钟',
          description: '跳绳、慢跑或其他喜欢的运动'
        },
        {
          id: 'task5-2',
          title: '伸展活动',
          description: '进行简单的伸展放松活动'
        }
      ]
    },
    {
      id: 'habit6',
      name: '感恩记录',
      description: '培养积极心态和感恩之心',
      category: '社交',
      active: false,
      tasks: [
        {
          id: 'task6-1',
          title: '记录三件感恩的事',
          description: '每天记录三件值得感恩的小事'
        },
        {
          id: 'task6-2',
          title: '表达谢意',
          description: '向帮助过自己的人表达谢意'
        }
      ]
    },
    {
      id: 'habit7',
      name: '早睡早起',
      description: '保证充足睡眠，培养规律作息',
      category: '生活',
      active: false,
      tasks: [
        {
          id: 'task7-1',
          title: '21:00准备睡觉',
          description: '在固定时间洗漱并准备睡觉'
        },
        {
          id: 'task7-2',
          title: '6:30按时起床',
          description: '不赖床，按时起床准备上学'
        }
      ]
    },
    {
      id: 'habit8',
      name: '主动提问',
      description: '培养好奇心和思考能力',
      category: '学习',
      active: true,
      tasks: [
        {
          id: 'task8-1',
          title: '课堂提问',
          description: '在课堂上至少提出一个问题'
        },
        {
          id: 'task8-2',
          title: '思考与讨论',
          description: '与家长讨论一个学习中的疑问'
        }
      ]
    },
    {
      id: 'habit9',
      name: '分享与沟通',
      description: '培养表达能力和社交技能',
      category: '社交',
      active: false,
      tasks: [
        {
          id: 'task9-1',
          title: '分享学校趣事',
          description: '每天与家人分享学校发生的有趣事情'
        },
        {
          id: 'task9-2',
          title: '倾听他人',
          description: '认真倾听他人说话，不打断'
        }
      ]
    },
    {
      id: 'habit10',
      name: '学习反思',
      description: '培养自我评估和改进能力',
      category: '学习',
      active: false,
      tasks: [
        {
          id: 'task10-1',
          title: '记录学习收获',
          description: '简单记录今天学到的新知识'
        },
        {
          id: 'task10-2',
          title: '反思改进',
          description: '思考学习中的困难和改进方法'
        }
      ]
    }
  ];
}

// 获取每日任务
export function getDayTasks(): TaskWithHabit[] {
  const habits = getHabits().filter(h => h.active);
  const tasks: TaskWithHabit[] = [];
  
  habits.forEach(habit => {
    habit.tasks.forEach(task => {
      tasks.push({
        ...task,
        habitId: habit.id,
        habitName: habit.name,
        completed: false // Changed from Math.random() > 0.7 to false for consistent server/client rendering
      });
    });
  });
  
  return tasks;
}

// 获取奖励列表
export function getRewards(): Reward[] {
  return [
    {
      id: 'reward1',
      name: '阅读达人',
      description: '连续完成阅读习惯7天',
      points: 300,
      type: 'badge',
      image: null,
      earned: false
    },
    {
      id: 'reward2',
      name: '自律小能手',
      description: '连续3天按时完成所有任务',
      points: 500,
      type: 'badge',
      image: null,
      earned: false
    },
    {
      id: 'reward3',
      name: '习惯养成者',
      description: '累计完成50个任务',
      points: 1000,
      type: 'badge',
      image: null,
      earned: false
    },
    {
      id: 'reward4',
      name: '冰淇淋',
      description: '周末可以兑换一次冰淇淋',
      points: 500,
      type: 'physical',
      image: 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg',
      earned: false
    },
    {
      id: 'reward5',
      name: '玩具',
      description: '可以挑选一个喜欢的玩具',
      points: 800,
      type: 'physical',
      image: 'https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg',
      earned: false
    },
    {
      id: 'reward6',
      name: '画画套装',
      description: '获得一套新的绘画工具',
      points: 1000,
      type: 'physical',
      image: 'https://images.pexels.com/photos/159644/art-supplies-brushes-rulers-scissors-159644.jpeg',
      earned: false
    },
    {
      id: 'reward7',
      name: '书籍',
      description: '可以选择一本想读的新书',
      points: 600,
      type: 'physical',
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
      earned: false
    }
  ];
}

// Generate report based on completed tasks and habits
export function generateReport(): ReportData {
  const habits = getHabits();
  const activeHabits = habits.filter(h => h.active);
  const tasks = getDayTasks();
  const completedTasks = tasks.filter(t => t.completed);
  
  // Calculate overall completion rate
  const overallCompletion = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  // Calculate completion rate for each habit
  const habitCompletions = activeHabits.map(habit => {
    const habitTasks = tasks.filter(t => t.habitId === habit.id);
    const completedHabitTasks = habitTasks.filter(t => t.completed);
    
    return {
      id: habit.id,
      name: habit.name,
      completion: habitTasks.length > 0 
        ? Math.round((completedHabitTasks.length / habitTasks.length) * 100)
        : 0,
      completed: completedHabitTasks.length,
      total: habitTasks.length
    };
  });

  // Generate suggestions based on completion rates
  const suggestions = [];
  
  if (overallCompletion >= 80) {
    suggestions.push({
      type: 'positive' as const,
      title: '继续保持',
      content: '你今天的完成度非常高，继续保持这样的好习惯！'
    });
  } else if (overallCompletion >= 50) {
    suggestions.push({
      type: 'improvement' as const,
      title: '还可以更好',
      content: '虽然完成了一半以上的任务，但还有提升的空间。'
    });
  } else {
    suggestions.push({
      type: 'improvement' as const,
      title: '需要加油',
      content: '今天的完成度较低，建议制定更详细的计划来提高效率。'
    });
  }

  // Add specific habit-related suggestions
  habitCompletions.forEach(habit => {
    if (habit.completion < 50) {
      suggestions.push({
        type: 'improvement' as const,
        title: `关于${habit.name}`,
        content: `在${habit.name}方面的完成度较低，建议多关注这个习惯的培养。`
      });
    }
  });

  // Generate achievement message
  let achievement = {
    title: '',
    description: ''
  };

  if (overallCompletion === 100) {
    achievement = {
      title: '完美达成',
      description: '太棒了！今天所有任务都完成了！'
    };
  } else if (overallCompletion >= 80) {
    achievement = {
      title: '优秀表现',
      description: '今天完成度很高，继续加油！'
    };
  } else if (overallCompletion >= 50) {
    achievement = {
      title: '稳步前进',
      description: '完成了一半以上的任务，继续努力！'
    };
  } else {
    achievement = {
      title: '开始起步',
      description: '今天是新的开始，明天继续加油！'
    };
  }

  return {
    overallCompletion,
    habitCompletions,
    suggestions,
    achievement
  };
}