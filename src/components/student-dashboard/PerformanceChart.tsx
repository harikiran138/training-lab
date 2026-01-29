"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const data = [
    { name: 'Mon', attendance: 85 },
    { name: 'Tue', attendance: 92 },
    { name: 'Wed', attendance: 88 },
    { name: 'Thu', attendance: 78 },
    { name: 'Fri', attendance: 50 }, // Low attendance example
    { name: 'Sat', attendance: 0 },
    { name: 'Sun', attendance: 0 },
];

export function PerformanceChart() {
    return (
        <div className="p-6 rounded-3xl bg-[#0F1115] text-white h-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-semibold">Weekly Attendance</h3>
                    <p className="text-xs text-gray-500">This week vs last week</p>
                </div>
                <button className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: 'white' }}
                        />
                        <Bar dataKey="attendance" radius={[4, 4, 4, 4]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.attendance > 0 ? "#3b82f6" : "transparent"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
