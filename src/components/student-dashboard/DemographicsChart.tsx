"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const mockData = [
    { branch_code: 'CS', avg_attendance: 78, color: '#3b82f6' },
    { branch_code: 'ENG', avg_attendance: 82, color: '#f97316' },
    { branch_code: 'BUS', avg_attendance: 85, color: '#eab308' },
    { branch_code: 'ARTS', avg_attendance: 70, color: '#22c55e' },
];

const COLORS = ['#3b82f6', '#f97316', '#eab308', '#22c55e', '#a855f7', '#ec4899'];

interface DemographicsChartProps {
    data?: any[];
}

export function DemographicsChart({ data }: DemographicsChartProps) {
    const chartData = data && data.length > 0
        ? data.map((item, index) => ({
            branch_code: item.branch, // Map API 'branch' to 'branch_code'
            value: parseInt(item.count),
            color: COLORS[index % COLORS.length]
        }))
        : mockData.map(d => ({ ...d, value: d.avg_attendance })); // Fallback map

    const totalStudents = chartData.length > 0
        ? chartData.reduce((sum, item) => sum + (item.value || 0), 0)
        : 0;

    return (
        <div className="p-6 rounded-3xl bg-[#0F1115] text-white h-full relative overflow-hidden border border-white/5">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-100">Enrollment Distribution</h3>
                    <p className="text-xs text-gray-500 font-medium">Students per Department</p>
                </div>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
            </div>

            <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            nameKey="branch_code"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value: any) => [`${value} Students`, 'Enrollment']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-100">{totalStudents}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
                {chartData.slice(0, 4).map((item) => (
                    <div key={item.branch_code} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[11px] font-bold text-gray-400">{item.branch_code}</span>
                        </div>
                        <span className="text-[11px] font-bold text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
