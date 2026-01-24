"use client"

import React, { useEffect, useState } from 'react';
import { TrendLineChart, BranchBarChart, TestPassTrendChart, DepartmentRadarChart } from './OverviewCharts';
import { MetricCard } from './MetricCard';
import { AIInsightPanel } from './AIInsightPanel';
import { PerformanceTable } from './PerformanceTable';
import { Users, Laptop, GraduationCap, CheckCircle2 } from 'lucide-react';

interface LiveAnalyticsProps {
    initialData: {
        weeklyTrendData: any[];
        branchComparisonData: any[]; // summaries
        departmentSummaryData: any[];
        stats: any;
    }
}

export function LiveAnalytics({ initialData }: LiveAnalyticsProps) {
    const [data, setData] = useState(initialData);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/analytics');
            if (res.ok) {
                const newData = await res.json();
                setData(newData);
            }
        } catch (error) {
            console.error('Failed to poll analytics data:', error);
        }
    };

    useEffect(() => {
        // Poll every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const { weeklyTrendData, branchComparisonData, departmentSummaryData, stats } = data;

    return (
        <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    description="Enrolled in CRT programs"
                />
                <MetricCard
                    title="Laptop Holders"
                    value={`${stats.laptopPercent.toFixed(1)}%`}
                    icon={Laptop}
                    trend={{ value: stats.laptopPercent > 50 ? 5 : 2, isPositive: true }}
                    description="Students with laptops"
                />
                <MetricCard
                    title="Avg Attendance"
                    value={`${stats.avgAttendance.toFixed(1)}%`}
                    icon={GraduationCap}
                    trend={{ value: 2.3, isPositive: true }}
                    description="Across all branches"
                />
                <MetricCard
                    title="Syllabus Progress"
                    value={`${stats.avgSyllabus.toFixed(1)}%`}
                    icon={CheckCircle2}
                    description="Average completion"
                />
            </div>

            {/* AI Insights Section */}
            <AIInsightPanel
                data={{
                    stats,
                    summaries: branchComparisonData,
                    weeklyTrendData
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TrendLineChart data={weeklyTrendData} />
                <BranchBarChart data={branchComparisonData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TestPassTrendChart data={weeklyTrendData} />
                <DepartmentRadarChart data={departmentSummaryData} />
            </div>

            {/* Syllabus Progress Bar */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-semibold text-slate-900">Syllabus Completion by Branch</h4>
                    <span className="text-sm text-indigo-600 font-medium">Goal: 100% by Feb 2027</span>
                </div>
                <div className="space-y-6">
                    {branchComparisonData.map((branch: any) => (
                        <div key={branch.branch_code} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">{branch.branch_code}</span>
                                <span className="text-slate-500">{branch.syllabus_completion_percent?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${branch.syllabus_completion_percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Summary Table */}
            <PerformanceTable summaries={branchComparisonData} onRefresh={fetchData} />
        </div>
    );
}
