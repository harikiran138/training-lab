import React from 'react';
import { CalendarDays, Laptop, Users, Award, BookOpen } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { cn } from '@/lib/utils';

interface TopMetricsProps {
    sections: string[];
    selectedSection: string;
    onSelectSection: (section: string) => void;
    metrics: {
        crtDays: number;
        crtHours: number;
        laptopCount: number;
        laptopPercentage: number;
        overallAttendance: number;
        testPassPercentage: number;
    };
}

export function TopMetrics({ sections, selectedSection, onSelectSection, metrics }: TopMetricsProps) {
    return (
        <div className="space-y-6">
            {/* Section Selector */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sections</span>
                <div className="flex flex-wrap gap-2">
                    {sections.map((section) => (
                        <button
                            key={section}
                            onClick={() => onSelectSection(section)}
                            className={cn(
                                "h-10 w-10 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                                selectedSection === section
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                            )}
                        >
                            {section}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="CRTs Held"
                    value={`${metrics.crtDays} Days`}
                    icon={CalendarDays}
                    description={`${metrics.crtHours} Hours Total`}
                    className="lg:col-span-1"
                />

                <MetricCard
                    title="Laptop Holders"
                    value={metrics.laptopCount}
                    icon={Laptop}
                    description={`${metrics.laptopPercentage}% of students`}
                    trend={{ value: 2.5, isPositive: true }}
                />

                <MetricCard
                    title="Overall Attendance"
                    value={`${metrics.overallAttendance}%`}
                    icon={Users}
                    description="Average this semester"
                    trend={{ value: 0.8, isPositive: false }}
                />

                <MetricCard
                    title="Test Pass Rate"
                    value={`${metrics.testPassPercentage}%`}
                    icon={Award}
                    description="Last 3 assessments"
                    trend={{ value: 4.2, isPositive: true }}
                />
            </div>
        </div>
    );
}
