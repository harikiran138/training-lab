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
import { ScientificCard } from '@/components/ui/ScientificCard';
import { PieChart as PieIcon, Activity, BarChart as BarIcon } from 'lucide-react';

interface ChartProps {
  data: any[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4']; // Emerald, Amber, Red, Cyan

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
        <p className="text-slate-300 text-xs font-mono mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RiskPieChart({ data }: ChartProps) {
  return (
    <ScientificCard title="Risk Distribution Profile" icon={PieIcon} className="h-full">
      <div className="h-[250px] w-full">
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
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ScientificCard>
  );
}

export function TrendLineChart({ data }: ChartProps) {
  return (
    <ScientificCard title="Longitudinal Performance Velocity" icon={Activity} className="h-full">
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="week_no" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              domain={[0, 100]}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="overall_score" 
              stroke="#06b6d4" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#fff' }}
              name="Overall Score"
            />
            <Line 
              type="monotone" 
              dataKey="attendance" 
              stroke="#6366f1" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              dot={false}
              name="Attendance %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ScientificCard>
  );
}

export function BranchBarChart({ data }: ChartProps) {
  return (
    <ScientificCard title="Departmental Efficiency Metrics" icon={BarIcon} className="h-full">
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="branch_code" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
            <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontFamily: 'monospace' }} />
            <Bar dataKey="avg_attendance" fill="#06b6d4" radius={[2, 2, 0, 0]} name="Attendance Mean" />
            <Bar dataKey="avg_test_pass" fill="#10b981" radius={[2, 2, 0, 0]} name="Pass Rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ScientificCard>
  );
}
