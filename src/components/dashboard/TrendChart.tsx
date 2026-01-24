"use client"

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: any[];
  categories: string[];
  index: string; 
  colors?: string[];
  title?: string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export function TrendChart({
  data,
  categories,
  index,
  colors = ["#3b82f6", "#10b981"],
  title,
  className,
  valueFormatter = (value: number) => `${value}`
}: TrendChartProps) {
  
  return (
    <div className={cn("dashboard-card p-6 h-full", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">
          {title}
        </h3>
      )}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {categories.map((category, i) => (
                <linearGradient key={category} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey={index} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={valueFormatter}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#1e293b', fontWeight: 600, marginBottom: '0.5rem' }}
            />
            {categories.map((category, i) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color-${i})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
