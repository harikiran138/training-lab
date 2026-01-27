"use client"

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { cn } from "@/lib/utils";

interface TrendChartProps {
  title: string;
  data: Record<string, any>[];
  categories?: string[];
  index?: string;
  colors?: string[];
  className?: string; // Added className
}

export function TrendChart({ title, data, className }: TrendChartProps) {
  return (
    <div className={cn("bg-white border border-slate-200 p-8 rounded shadow-sm", className)}>
      <h3 className="text-[14px] font-extrabold text-[#1E3A8A] uppercase tracking-wider mb-10 border-l-4 border-[#1E3A8A] pl-4">
        {title}
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                dy={15}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                dx={-15}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '4px', 
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              labelStyle={{ fontWeight: 800, color: '#1E3A8A', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}
            />
            <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#1E3A8A" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
