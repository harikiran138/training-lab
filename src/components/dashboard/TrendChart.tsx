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
import { TrendingUp } from 'lucide-react';

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
  colors = ["#2563eb", "#60a5fa"], 
  title,
  className,
  valueFormatter = (value: number) => `${value}`
}: TrendChartProps) {
  
  return (
    <div className={cn("p-0 h-full flex flex-col", className)}>
      {title && (
        <div className="flex items-center gap-4 mb-10 px-2">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
                <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                {title}
            </h3>
        </div>
      )}
      <div className="h-full w-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <defs>
              {categories.map((category, i) => (
                <linearGradient key={category} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey={index} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }}
              dy={20}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }}
              tickFormatter={valueFormatter}
              width={50}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '1.5rem', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                padding: '20px'
              }}
              labelStyle={{ color: '#0f172a', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}
              itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            {categories.map((category, i) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[i % colors.length]}
                strokeWidth={5}
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
