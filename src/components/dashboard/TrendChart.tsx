"use client"

import React from 'react';
import { 
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
  colors = ["#1e40af", "#3b82f6"], // Blue 800, Blue 500
  title,
  className,
  valueFormatter = (value: number) => `${value}`
}: TrendChartProps) {
  
  return (
    <div className={cn("p-0 h-full flex flex-col", className)}>
      {title && (
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 italic">
          {title}
        </h3>
      )}
      <div className="h-full w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {categories.map((category, i) => (
                <linearGradient key={category} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey={index} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
              dy={15}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
              tickFormatter={valueFormatter}
              width={40}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '0px', 
                border: '2px solid #0f172a',
                boxShadow: '8px 8px 0px 0px rgba(0, 0, 0, 0.05)',
                padding: '12px'
              }}
              labelStyle={{ color: '#0f172a', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}
              itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            {categories.map((category, i) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[i % colors.length]}
                strokeWidth={3}
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
