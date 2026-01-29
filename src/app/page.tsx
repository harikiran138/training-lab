"use client"

import React, { useState, useEffect } from 'react';
import {
  Users,
  Laptop,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  LayoutDashboard,
  BarChart3,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  FileText,
  ShieldCheck,
  Database,
  ChevronDown,
  Building2,
  Trophy,
  Target,
  RefreshCw,
  Star,
  Monitor
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { HeatMap } from '@/components/dashboard/HeatMap';
import { ExpandableTable } from '@/components/dashboard/ExpandableTable';
import { cn } from '@/lib/utils';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsCharts';
import { LiveAnalytics } from '@/components/dashboard/LiveAnalytics';

import { INSTITUTIONAL_SCHEMAS } from '@/config/SchemaManager';

export default function OverviewPage() {
  const [activeDomain, setActiveDomain] = useState('crt_attendance');
  const [view, setView] = useState<'standard' | 'analytics'>('standard');
  const [isPresented, setIsPresented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [data, setData] = useState<any>({
    stats: {
      totalStudents: 0,
      laptopPercent: 0,
      avgAttendance: 0,
      avgPass: 0,
      avgSyllabus: 0
    },
    summaries: [],
    reports: [],
    weeks: [],
    branches: [],
    weeklyTrendData: [],
    heatMapData: []
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
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
          branches,
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

  const tableColumns = [
    { header: 'Branch', accessorKey: 'branch_code', sortable: true, className: 'font-bold text-slate-700' },
    { header: 'Avg Attendance', accessorKey: (row: any) => `${row.avg_attendance.toFixed(1)}%`, sortable: true },
    { header: 'Test Pass', accessorKey: (row: any) => `${row.avg_test_pass.toFixed(1)}%`, sortable: true, className: 'text-indigo-600 font-semibold' },
    { header: 'Weekly Reports', accessorKey: 'total_weeks', sortable: true },
    {
      header: 'Grade', accessorKey: (row: any) => (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold border",
          row.performance_grade?.startsWith('A') ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            row.performance_grade?.startsWith('B') ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
        )}>
          {row.performance_grade}
        </span>
      )
    },
    {
      header: 'Status', accessorKey: (row: any) => (
        <div className="flex flex-col gap-1">
          {row.avg_test_pass < 50 ? (
            <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs bg-rose-50 px-2 py-1 rounded-md border border-rose-100 w-fit">
              <AlertCircle className="w-3.5 h-3.5" />
              Critical
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Stable
            </div>
          )}
          {row.ai_risk_level && (
            <div className={cn(
              "text-[9px] font-black uppercase px-2 py-0.5 rounded border w-fit",
              row.ai_risk_level === 'High' ? "bg-rose-900/10 text-rose-600 border-rose-200" :
                row.ai_risk_level === 'Medium' ? "bg-amber-900/10 text-amber-600 border-amber-200" :
                  "bg-emerald-900/10 text-emerald-600 border-emerald-200"
            )}>
              AI: {row.ai_risk_level}
            </div>
          )}
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[12px] font-bold uppercase tracking-widest text-[#1E3A8A] opacity-60">Synchronizing Session...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header with Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Institutional Intelligence</h2>
          <div className="flex items-center gap-4">
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span>
              Performance Auditor v2.0
            </p>
            {data.summaries[0]?.ai_risk_level && (
              <div className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border animate-pulse",
                data.summaries[0].ai_risk_level === 'High' ? "bg-rose-50 text-rose-600 border-rose-200" :
                  "bg-emerald-50 text-emerald-600 border-emerald-200"
              )}>
                System Risk: {data.summaries[0].ai_risk_level}
              </div>
            )}
          </div>
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-[20px] border border-slate-200">
          <button
            onClick={() => setView('standard')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all",
              view === 'standard' ? "bg-white text-slate-900 shadow-md border border-slate-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Core Metrics
          </button>
          <button
            onClick={() => setView('analytics')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all",
              view === 'analytics' ? "bg-blue-700 text-white shadow-xl shadow-blue-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Insight Analytics
          </button>
        </div>
      </div>

      {view === 'analytics' ? (
        <AnalyticsDashboard />
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

      {/* LiveAnalytics for real-time insights */}
      <LiveAnalytics initialData={{
        weeklyTrendData: data.weeklyTrendData,
        branchComparisonData: data.summaries,
        departmentSummaryData: [],
        stats: data.stats
      }} />

      {/* FOOTER */}
      <footer className="pt-20 flex flex-col items-center gap-6 pb-12 opacity-30">
        <div className="flex items-center gap-10">
          <div className="w-px h-12 bg-slate-300"></div>
          <div className="flex items-center gap-6">
            <Database className="w-6 h-6" />
            <ShieldCheck className="w-6 h-6" />
            <Activity className="w-6 h-6" />
          </div>
          <div className="w-px h-12 bg-slate-300"></div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-center">
          Institutional Analytics v5.0 // Synchronized Repository
        </p>
      </footer>
    </div>
  );
}
