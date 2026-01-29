"use client"

import React, { useEffect, useState } from 'react';
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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming these exist or use div if not
import { Loader2 } from 'lucide-react';

interface AnalyticsData {
    trends: any[];
    comparisons: any[];
    summary: any;
    lastUpdated: string;
}

export function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/analytics');
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError('Failed to load analytics data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Attendance & Performance Trend */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Weekly Performance Trends</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="week" tickFormatter={(value) => `W${value}`} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="attendance" name="Avg Attendance %" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="testPass" name="Test Pass %" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Branch Comparison */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Branch Comparison</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.comparisons}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="attendance" name="Attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="testPass" name="Test Pass" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Syllabus Completion by Branch */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Syllabus Completion</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.comparisons} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" width={50} />
                                <Tooltip />
                                <Bar dataKey="syllabus" name="Completed %" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department Summary Radar */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Department Summary Metrics</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: 'Attendance', A: data.summary.avgAttendance, fullMark: 100 },
                                { subject: 'Test Pass', A: data.summary.avgTestPass, fullMark: 100 },
                                { subject: 'Syllabus', A: data.summary.avgSyllabus, fullMark: 100 },
                                // Add dummy points for better shape if needed or normalize
                            ]}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Department Avg" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
            <div className="text-xs text-slate-400 text-right">
                Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </div>
        </div>
    );
}
