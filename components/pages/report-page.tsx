"use client"

import { useState } from 'react';
import { Award, BarChart3, Book, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { generateReport, ReportData } from '@/lib/data';

export default function ReportPage() {
  const [report, setReport] = useState<ReportData>(generateReport());
  
  return (
    <div className="p-4 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">本周成长报告</h1>
      </div>
      
      <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">习惯完成情况</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-4xl font-bold">{report.overallCompletion}%</div>
            <p className="text-sm text-muted-foreground">本周总体完成率</p>
          </div>
          
          <div className="mt-4 space-y-4">
            {report.habitCompletions.map(habit => (
              <div key={habit.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{habit.name}</Badge>
                    <span className="text-sm font-medium">{habit.completion}%</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{habit.completed}/{habit.total}天</span>
                </div>
                <Progress value={habit.completion} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">AI习惯建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5">
                  {suggestion.type === 'positive' ? (
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <Book className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{suggestion.title}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.content}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">本周成就</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{report.achievement.title}</p>
              <p className="text-sm text-muted-foreground">{report.achievement.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-8">
        <Button className="flex items-center gap-2">
          <BarChart3 size={16} />
          <span>调整习惯计划</span>
        </Button>
      </div>
    </div>
  );
}