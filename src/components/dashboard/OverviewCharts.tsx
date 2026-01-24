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
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  data: any[];
}

const COLORS = ['#10b981', '#f59e0b', '#f43f5e']; // Green, Amber, Rose

export function RiskPieChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">Risk Distribution</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">Weekly Performance Trend</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="week_no" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="overall_score" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
            name="Overall Score"
          />
          <Line 
            type="monotone" 
            dataKey="attendance" 
            stroke="#06b6d4" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
            name="Attendance %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BranchBarChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">Branch Comparison</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="branch_code" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="avg_attendance" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Avg Attendance" />
          <Bar dataKey="avg_test_pass" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Avg Pass %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
