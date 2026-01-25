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
  colors = ["#06B6D4", "#10B981"], // Cyan, Emerald
  title,
  className,
  valueFormatter = (value: number) => `${value}`
}: TrendChartProps) {
  
  return (
    <div className={cn("p-0 h-full", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-100 mb-6">
          {title}
        </h3>
      )}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {categories.map((category, i) => (
                <linearGradient key={category} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey={index} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={valueFormatter}
              width={30}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '6px', 
                border: '1px solid #334155',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                fontFamily: 'monospace'
              }}
              labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
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
