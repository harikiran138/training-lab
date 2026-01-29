"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const mockData = [
    { week_no: 'Mon', attendance: 85 },
    { week_no: 'Tue', attendance: 92 },
    { week_no: 'Wed', attendance: 88 },
    { week_no: 'Thu', attendance: 78 },
    { week_no: 'Fri', attendance: 50 }, // Low attendance example
    { week_no: 'Sat', attendance: 0 },
    { week_no: 'Sun', attendance: 0 },
];

interface PerformanceChartProps {
    data?: any[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
    const chartData = data && data.length > 0
        ? data.map(d => ({
            ...d,
            week_no: d.period ? new Date(d.period).toLocaleDateString('en-US', { weekday: 'short' }) : d.week_no
        }))
        : mockData;

    return (
        <div className="p-6 rounded-3xl bg-[#0F1115] text-white h-full border border-white/5">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-100">Weekly Attendance</h3>
                    <p className="text-xs text-gray-500 font-medium">Trends from backend tracking</p>
                </div>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="week_no"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 500 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: '#3b82f6' }}
                        />
                        <Bar dataKey="attendance" radius={[6, 6, 6, 6]} barSize={24}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.attendance > 0 ? "#3b82f6" : "transparent"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
