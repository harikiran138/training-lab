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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ScientificCard } from '@/components/ui/ScientificCard';
import { PieChart as PieIcon, Activity, BarChart as BarIcon } from 'lucide-react';

interface ChartProps {
  data: Record<string, any>[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4']; // Emerald, Amber, Red, Cyan

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
<<<<<<< HEAD
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
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
=======
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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
  );
}

export function TrendLineChart({ data }: ChartProps) {
  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
  );
}

export function BranchBarChart({ data }: ChartProps) {
  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
  );
}

export function TestPassTrendChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">Test Performance Trend</h4>
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
            dataKey="test_pass"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
            name="Test Pass %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentRadarChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
      <h4 className="text-sm font-semibold text-slate-700 mb-4 w-full text-left">Department Summary</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Institution Avg"
            dataKey="A"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
