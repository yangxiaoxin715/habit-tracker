"use client"

import { cn } from '@/lib/utils';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  className?: string;
  height?: number;
}

export function BarChart({ data, className, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative" style={{ height }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
            const x = (index * barWidth) + (barWidth - 8) / 2;
            const y = height - barHeight - 20;
            
            return (
              <g key={index}>
                {/* 柱子 */}
                <rect
                  x={`${x}%`}
                  y={y}
                  width="8%"
                  height={barHeight}
                  fill={item.color || 'hsl(var(--primary))'}
                  className="transition-all duration-300 hover:opacity-80"
                  rx="2"
                />
                {/* 数值标签 */}
                <text
                  x={`${x + 4}%`}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-current text-muted-foreground"
                >
                  {item.value}
                </text>
                {/* 底部标签 */}
                <text
                  x={`${x + 4}%`}
                  y={height - 5}
                  textAnchor="middle"
                  className="text-xs fill-current text-muted-foreground"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  className?: string;
  height?: number;
  color?: string;
}

export function LineChart({ data, className, height = 200, color = 'hsl(var(--primary))' }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const width = 100;
  const pointWidth = width / (data.length - 1 || 1);

  const points = data.map((item, index) => {
    const x = index * pointWidth;
    const y = height - 40 - ((item.value - minValue) / range) * (height - 60);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={cn("w-full", className)}>
      <div className="relative" style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* 网格线 */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* 折线 */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          
          {/* 数据点 */}
          {data.map((item, index) => {
            const x = index * pointWidth;
            const y = height - 40 - ((item.value - minValue) / range) * (height - 60);
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  className="transition-all duration-300 hover:r-4"
                />
                {/* 悬停时显示数值 */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-xs fill-current text-muted-foreground opacity-0 hover:opacity-100 transition-opacity"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
          
          {/* 底部标签 */}
          {data.map((item, index) => {
            const x = index * pointWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - 5}
                textAnchor="middle"
                className="text-xs fill-current text-muted-foreground"
              >
                {item.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  className?: string;
  size?: number;
}

export function DonutChart({ data, className, size = 200 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - 40) / 2;
  const innerRadius = radius * 0.6;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90; // 从顶部开始

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = item.value / total;
          const angle = percentage * 360;
          const startAngle = (currentAngle * Math.PI) / 180;
          const endAngle = ((currentAngle + angle) * Math.PI) / 180;
          
          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          
          const x3 = centerX + innerRadius * Math.cos(endAngle);
          const y3 = centerY + innerRadius * Math.sin(endAngle);
          const x4 = centerX + innerRadius * Math.cos(startAngle);
          const y4 = centerY + innerRadius * Math.sin(startAngle);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              className="transition-all duration-300 hover:opacity-80"
            />
          );
        })}
        
        {/* 中心文字 */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-xl font-bold fill-current"
        >
          {total}
        </text>
        <text
          x={centerX}
          y={centerY + 12}
          textAnchor="middle"
          className="text-xs fill-current text-muted-foreground"
        >
          总计
        </text>
      </svg>
      
      {/* 图例 */}
      <div className="w-full space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 