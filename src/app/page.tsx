import React from 'react';
import { 
  Users, 
  Laptop, 
  GraduationCap, 
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendLineChart, BranchBarChart } from '@/components/dashboard/OverviewCharts';
import dbConnect from '@/lib/mongodb';
import Branch from '@/models/Branch';
import AggregateSummary from '@/models/AggregateSummary';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import { refreshAggregateSummary } from '@/services/aggregation';
import { cn } from '@/lib/utils';

async function getData() {
  await dbConnect();
  
  // Refresh summaries to ensure accuracy
  await refreshAggregateSummary();

  const branches = await Branch.find({}).lean();
  const summaries = await AggregateSummary.find({}).lean();
  const reports = await CRTWeeklyReport.find({}).sort({ week_no: 1 }).lean();

  // Calculate institution-wide stats
  const totalStudents = branches.reduce((sum, b: any) => sum + b.total_students, 0);
  const totalLaptops = branches.reduce((sum, b: any) => sum + b.laptop_holders, 0);
  const avgAttendance = summaries.reduce((sum, s: any) => sum + s.avg_attendance, 0) / (summaries.length || 1);
  const avgPass = summaries.reduce((sum, s: any) => sum + s.avg_test_pass, 0) / (summaries.length || 1);
  const avgSyllabus = summaries.reduce((sum, s: any) => sum + s.syllabus_completion_percent, 0) / (summaries.length || 1);

  // Group reports by week for trend chart
  const weeklyTrendMap = new Map();
  reports.forEach((r: any) => {
    if (!weeklyTrendMap.has(r.week_no)) {
      weeklyTrendMap.set(r.week_no, { week_no: r.week_no, overall_score: 0, attendance: 0, count: 0 });
    }
    const data = weeklyTrendMap.get(r.week_no);
    data.overall_score += r.computed.overall_score;
    data.attendance += r.attendance.avg_attendance_percent;
    data.count += 1;
  });

  const weeklyTrendData = Array.from(weeklyTrendMap.values()).map(d => ({
    week_no: `W${d.week_no}`,
    overall_score: parseFloat((d.overall_score / d.count).toFixed(1)),
    attendance: parseFloat((d.attendance / d.count).toFixed(1))
  })).sort((a, b) => parseInt(a.week_no.slice(1)) - parseInt(b.week_no.slice(1)));

  return {
    stats: {
      totalStudents,
      laptopPercent: (totalLaptops / totalStudents) * 100,
      avgAttendance,
      avgPass,
      avgSyllabus
    },
    summaries: JSON.parse(JSON.stringify(summaries)),
    weeklyTrendData
  };
}

export default async function OverviewPage() {
  const { stats, summaries, weeklyTrendData } = await getData();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Institution Overview</h2>
        <p className="text-slate-500">Real-time performance metrics across all branches</p>
      </div>

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
          trend={{ value: 5, isPositive: true }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendLineChart data={weeklyTrendData} />
        <BranchBarChart data={summaries} />
      </div>

      {/* Syllabus Progress Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold text-slate-900">Syllabus Completion by Branch</h4>
          <span className="text-sm text-indigo-600 font-medium">Goal: 100% by Feb 2027</span>
        </div>
        <div className="space-y-6">
          {summaries.map((branch: any) => (
            <div key={branch.branch_code} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{branch.branch_code}</span>
                <span className="text-slate-500">{branch.syllabus_completion_percent.toFixed(1)}%</span>
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
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h4 className="font-semibold text-slate-900">Branch Performance Summary</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-sm font-medium">
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Test Pass %</th>
                <th className="px-6 py-4">Weeks</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summaries.map((branch: any) => (
                <tr key={branch.branch_code} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{branch.branch_code}</td>
                  <td className="px-6 py-4 text-slate-600">{branch.avg_attendance.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-slate-600">{branch.avg_test_pass.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-slate-600">{branch.total_weeks}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-bold",
                      branch.performance_grade.startsWith('A') ? "bg-emerald-100 text-emerald-700" :
                      branch.performance_grade.startsWith('B') ? "bg-indigo-100 text-indigo-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {branch.performance_grade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {branch.avg_test_pass < 50 ? (
                      <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Critical
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Stable
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
