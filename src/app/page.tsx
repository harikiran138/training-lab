"use client"

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Laptop, 
  GraduationCap, 
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { HeatMap } from '@/components/dashboard/HeatMap';
import { ExpandableTable } from '@/components/dashboard/ExpandableTable';
import { cn } from '@/lib/utils';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

export default function OverviewPage() {
  const [view, setView] = useState<'standard' | 'analytics'>('standard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bRes, sRes, rRes, wRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/summary'),
          fetch('/api/reports'),
          fetch('/api/weeks')
        ]);
        
        const branches = await bRes.json();
        const summaries = await sRes.json();
        const reports = await rRes.json();
        const weeks = await wRes.json();

        // Calculate institution-wide stats
        const totalStudents = branches.reduce((sum: number, b: any) => sum + (b.total_students || 0), 0);
        const totalLaptops = branches.reduce((sum: number, b: any) => sum + (b.laptop_holders || 0), 0);
        const avgAttendance = summaries.reduce((sum: number, s: any) => sum + s.avg_attendance, 0) / (summaries.length || 1);
        const avgPass = summaries.reduce((sum: number, s: any) => sum + s.avg_test_pass, 0) / (summaries.length || 1);
        const avgSyllabus = summaries.reduce((sum: number, s: any) => sum + s.syllabus_completion_percent, 0) / (summaries.length || 1);

        // Group reports by week for trend chart
        const weeklyTrendMap = new Map();
        reports.forEach((r: any) => {
          if (!weeklyTrendMap.has(r.week_no)) {
            weeklyTrendMap.set(r.week_no, { week_no: r.week_no, overall_score: 0, attendance: 0, count: 0 });
          }
          const wData = weeklyTrendMap.get(r.week_no);
          wData.overall_score += (r.computed?.overall_score || 0);
          wData.attendance += (r.attendance?.avg_attendance_percent || 0);
          wData.count += 1;
        });

        const weeklyTrendData = Array.from(weeklyTrendMap.values()).map(d => ({
          week_no: `W${d.week_no}`,
          overall_score: parseFloat((d.overall_score / d.count).toFixed(1)),
          attendance: parseFloat((d.attendance / d.count).toFixed(1))
        })).sort((a, b) => parseInt(a.week_no.slice(1)) - parseInt(b.week_no.slice(1)));

        setData({
          stats: {
            totalStudents,
            laptopPercent: totalStudents > 0 ? (totalLaptops / totalStudents) * 100 : 0,
            avgAttendance,
            avgPass,
            avgSyllabus
          },
          summaries,
          reports,
          weeks,
          weeklyTrendData,
          heatMapData: summaries.map((s: any) => ({
            id: s.branch_code,
            label: s.branch_code,
            value: Math.round(s.avg_test_pass),
            secondaryValue: Math.round(s.avg_attendance)
          })).sort((a: any, b: any) => b.value - a.value)
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading analytical data...</div>;
  if (!data) return <div className="p-12 text-center text-rose-500 font-bold">Failed to load dashboard. Please try again.</div>;

  const tableColumns = [
    { header: 'Branch', accessorKey: 'branch_code', sortable: true, className: 'font-bold text-slate-700' },
    { header: 'Avg Attendance', accessorKey: (row: any) => `${row.avg_attendance.toFixed(1)}%`, sortable: true },
    { header: 'Test Pass', accessorKey: (row: any) => `${row.avg_test_pass.toFixed(1)}%`, sortable: true, className: 'text-indigo-600 font-semibold' },
    { header: 'Weekly Reports', accessorKey: 'total_weeks', sortable: true },
    { header: 'Grade', accessorKey: (row: any) => (
      <span className={cn(
        "px-2.5 py-1 rounded-full text-xs font-bold border",
        row.performance_grade?.startsWith('A') ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
        row.performance_grade?.startsWith('B') ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
        "bg-amber-50 text-amber-700 border-amber-200"
      )}>
        {row.performance_grade}
      </span>
    ) },
    { header: 'Status', accessorKey: (row: any) => (
      row.avg_test_pass < 50 ? (
        <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs bg-rose-50 px-2 py-1 rounded-md border border-rose-100 w-fit">
          <AlertCircle className="w-3.5 h-3.5" />
          Critical
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Stable
        </div>
      )
    )}
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header with Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Performance Desk</h2>
          <p className="text-slate-500 font-medium">Real-time performance metrics across all branches</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
           <button 
             onClick={() => setView('standard')}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
               view === 'standard' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
             )}
           >
             <LayoutDashboard className="w-4 h-4" />
             Standard
           </button>
           <button 
             onClick={() => setView('analytics')}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
               view === 'analytics' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
             )}
           >
             <BarChart3 className="w-4 h-4" />
             Power BI v2
           </button>
        </div>
      </div>

      {view === 'analytics' ? (
        <AnalyticsDashboard reports={data.reports} branches={data.branches} weeks={data.weeks} />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
           {/* Top Section - KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard 
              title="Avg Attendance" 
              value={`${data.stats.avgAttendance.toFixed(1)}%`} 
              icon={Users} 
              trend="+2.1%"
              trendDirection="up"
              status="success"
              description="Average attendance across all branches this week"
            />
            <KpiCard 
              title="Test Pass Rate" 
              value={`${data.stats.avgPass.toFixed(1)}%`} 
              icon={GraduationCap} 
              trend="-0.5%"
              trendDirection="down"
              status={data.stats.avgPass < 60 ? 'warning' : 'neutral'}
              description="Average test pass percentage"
            />
            <KpiCard 
              title="Syllabus Completion" 
              value={`${data.stats.avgSyllabus.toFixed(1)}%`} 
              icon={CheckCircle2} 
              trend="+5%"
              trendDirection="up"
              status="neutral"
              description="Overall syllabus completion status"
            />
             <KpiCard 
              title="Laptop Coverage" 
              value={`${data.stats.laptopPercent.toFixed(1)}%`} 
              icon={Laptop} 
              status="neutral"
              description="Percentage of students with laptops"
            />
            <KpiCard 
              title="Total Students" 
              value={data.stats.totalStudents} 
              icon={Users} 
              status="neutral"
              description="Total active students"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            <div className="lg:col-span-2 h-full">
              <TrendChart 
                title="Performance Trends (Weekly)"
                data={data.weeklyTrendData} 
                categories={['overall_score', 'attendance']}
                index="week_no"
                colors={['#3b82f6', '#10b981']}
              />
            </div>
            <div className="h-full">
             <HeatMap 
                title="Branch Performance Heatmap (Pass %)"
                data={data.heatMapData}
              />
            </div>
          </div>

          <div className="mt-8">
            <ExpandableTable 
              title="Detailed Branch Performance"
              data={data.summaries}
              columns={tableColumns}
              rowId={(row) => row.branch_code}
              expandableContent={(row) => (
                 <div className="p-4 grid grid-cols-3 gap-4 bg-slate-50/50">
                   <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Total Students</span>
                      <div className="text-sm font-medium">{row.total_students}</div>
                   </div>
                   <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Laptop Holders</span>
                      <div className="text-sm font-medium">{row.laptop_holders}</div>
                   </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Syllabus</span>
                      <div className="text-sm font-medium">{row.syllabus_completion_percent}%</div>
                   </div>
                 </div>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
