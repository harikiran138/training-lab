import React from 'react';
import {
    ArrowLeft,
    Users,
    Award,
    Calendar,
    CheckCircle2,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Branch from '@/models/Branch';
import AggregateSummary from '@/models/AggregateSummary';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendLineChart } from '@/components/dashboard/OverviewCharts';
import { SectionInsightPanel } from '@/components/dashboard/SectionInsightPanel';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getBranchDetail(branchCode: string) {
    await dbConnect();

    const branch = await Branch.findOne({ branch_code: branchCode }).lean();
    if (!branch) return null;

    const summary = await AggregateSummary.findOne({ branch_code: branchCode }).lean();
    const reports = await CRTWeeklyReport.find({ branch_code: branchCode }).sort({ week_no: 1 }).lean();

    // Process weekly trend data
    const weeklyTrends = reports.map((r: any) => ({
        week_no: `W${r.week_no}`,
        overall_score: r.computed.overall_score,
        attendance: r.attendance.avg_attendance_percent,
        pass: r.tests.avg_test_pass_percent
    }));

    return {
        branch: JSON.parse(JSON.stringify(branch)),
        summary: summary ? JSON.parse(JSON.stringify(summary)) : null,
        reports: JSON.parse(JSON.stringify(reports)),
        weeklyTrends
    };
}

export default async function BranchDetailPage({ params }: { params: Promise<{ branch_code: string }> }) {
    const { branch_code } = await params;
    const data = await getBranchDetail(branch_code);

    if (!data) {
        notFound();
    }

    const { branch, summary, reports, weeklyTrends } = data;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/branches"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Branches
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            {branch.branch_name}
                            <span className="text-lg font-medium text-slate-400">({branch.branch_code})</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Detailed performance tracking and weekly reports</p>
                    </div>

                    {summary && (
                        <div className="flex items-center gap-4">
                            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Overall Grade</div>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    summary.performance_grade.startsWith('A') ? "text-emerald-600" :
                                        summary.performance_grade.startsWith('B') ? "text-indigo-600" : "text-amber-600"
                                )}>
                                    {summary.performance_grade}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics Grid */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Avg Attendance"
                        value={`${summary.avg_attendance.toFixed(1)}%`}
                        icon={Users}
                        description="Average across all weeks"
                    />
                    <MetricCard
                        title="Avg Test Pass"
                        value={`${summary.avg_test_pass.toFixed(1)}%`}
                        icon={Award}
                        description="Overall pass percentage"
                    />
                    <MetricCard
                        title="Syllabus Status"
                        value={`${summary.syllabus_completion_percent.toFixed(1)}%`}
                        icon={CheckCircle2}
                        description="Total syllabus covered"
                    />
                    <MetricCard
                        title="Total Weeks"
                        value={summary.total_weeks}
                        icon={Calendar}
                        description="Weeks reported"
                    />
                </div>
            )}

            {/* Section AI Insights */}
            <SectionInsightPanel
                sectionData={weeklyTrends.map(t => ({
                    week: t.week_no,
                    attendance: t.attendance,
                    passRate: t.pass
                }))}
            />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-6">Weekly Performance Trend</h4>
                    <TrendLineChart data={weeklyTrends} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Syllabus Progress</h4>
                    {summary && (
                        <div className="flex flex-col justify-center h-full gap-4">
                            <div className="flex justify-between items-end">
                                <span className="text-4xl font-bold text-slate-900">{summary.syllabus_completion_percent.toFixed(1)}%</span>
                                <span className="text-sm text-slate-500 font-medium">Goal: 100%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${summary.syllabus_completion_percent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Reports Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900">Weekly Reports History</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-sm font-medium">
                                <th className="px-6 py-4">Week</th>
                                <th className="px-6 py-4">Attendance</th>
                                <th className="px-6 py-4">Test Pass %</th>
                                <th className="px-6 py-4">Syllabus</th>
                                <th className="px-6 py-4">Overall Score</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reports.map((report: any) => (
                                <tr key={report._id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">Week {report.week_no}</td>
                                    <td className="px-6 py-4 text-slate-600">{report.attendance.avg_attendance_percent.toFixed(1)}%</td>
                                    <td className="px-6 py-4 text-slate-600">{report.tests.avg_test_pass_percent.toFixed(1)}%</td>
                                    <td className="px-6 py-4 text-slate-600">{report.syllabus.covered} / {report.syllabus.total}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-700">{report.computed.overall_score.toFixed(1)}</span>
                                            {report.computed.overall_score >= 80 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No weekly reports found for this branch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
