"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

const data = [
    { name: 'Computer Science', value: 400, color: '#3b82f6' }, // Blue
    { name: 'Engineering', value: 300, color: '#f97316' },      // Orange
    { name: 'Business', value: 300, color: '#eab308' },         // Yellow
    { name: 'Arts', value: 200, color: '#22c55e' },            // Green
];

// Custom label for the center of the donut
const CustomLabel = ({ viewBox }: any) => {
    const { cx, cy } = viewBox;
    return (
        <text x={cx} y={cy} fill="white" textAnchor="middle" dominantBaseline="central">
            <tspan x={cx} y={cy} dy="-10" fontSize="24" fontWeight="bold">1,200</tspan>
            <tspan x={cx} y={cy} dy="20" fontSize="12" fill="#9ca3af">Total Students</tspan>
        </text>
    );
};

export function DemographicsChart() {
    return (
        <div className="p-6 rounded-3xl bg-[#0F1115] text-white h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold">Student Demographics</h3>
                    <p className="text-xs text-gray-500">By Major/Department</p>
                </div>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                </button>
            </div>

            <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                            ))}
                            {/* <Label content={<CustomLabel />} position="center" /> */}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: 'white' }}
                            itemStyle={{ color: 'white' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Absolute center text overlay as Recharts Label can be tricky with types */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold">1.2k</span>
                    <span className="text-[10px] text-gray-500">Students</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-300">{item.name}</span>
                        </div>
                        <span className="font-medium text-white">{Math.round((item.value / 1200) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
