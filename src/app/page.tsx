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
  ShieldCheck
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

        const totalStudents = branches.reduce((sum: number, b: any) => sum + (b.total_students || 0), 0);
        const totalLaptops = branches.reduce((sum: number, b: any) => sum + (b.laptop_holders || 0), 0);
        const avgAttendance = summaries.reduce((sum: number, s: any) => sum + s.avg_attendance, 0) / (summaries.length || 1);
        const avgPass = summaries.reduce((sum: number, s: any) => sum + s.avg_test_pass, 0) / (summaries.length || 1);
        const avgSyllabus = summaries.reduce((sum: number, s: any) => sum + s.syllabus_completion_percent, 0) / (summaries.length || 1);

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
          name: `Week ${d.week_no}`,
          value: parseFloat((d.overall_score / d.count).toFixed(1))
        })).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));

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

  if (loading) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#1E3A8A] opacity-60">Synchronizing Session...</p>
      </div>
  );

  const tableColumns = [
    { header: 'Branch Code', accessorKey: 'branch_code', className: 'font-extrabold text-[#1E3A8A]' },
    { header: 'Attendance', accessorKey: (row: any) => `${row.avg_attendance.toFixed(1)}%`, className: 'font-bold' },
    { header: 'Pass rate', accessorKey: (row: any) => `${row.avg_test_pass.toFixed(1)}%`, className: 'text-[#3B82F6] font-bold' },
    { 
        header: 'Tier', 
        accessorKey: (row: any) => (
            <span className={cn(
                "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded border",
                row.performance_grade?.startsWith('A') ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                row.performance_grade?.startsWith('B') ? "bg-blue-50 text-blue-700 border-blue-100" :
                "bg-amber-50 text-amber-700 border-amber-100"
            )}>
                Grade {row.performance_grade}
            </span>
        ) 
    },
    { 
        header: 'Risk', 
        accessorKey: (row: any) => (
            <div className={cn(
                "flex items-center gap-2 text-[10px] font-bold px-4 py-1.5 rounded border uppercase tracking-widest",
                row.avg_test_pass < 50 ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-blue-50 text-[#1E3A8A] border-blue-100"
            )}>
                {row.avg_test_pass < 50 ? <AlertCircle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {row.avg_test_pass < 50 ? 'Critical' : 'Secure'}
            </div>
        )
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="bg-[#1E3A8A] p-2 rounded text-white shadow-sm">
                <LayoutDashboard className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight uppercase">
               Executive <span className="font-light opacity-60">Overview</span>
             </h2>
          </div>
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Institutional Performance Intelligence :: All Nodes Active
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded border border-slate-200 shadow-sm">
           <button 
             onClick={() => setView('standard')}
             className={cn(
               "flex items-center gap-3 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all rounded",
               view === 'standard' ? "bg-[#1E3A8A] text-white shadow-md" : "text-slate-400 hover:text-[#1E3A8A] hover:bg-slate-50"
             )}
           >
             <Activity className="w-4 h-4" />
             Core Ops
           </button>
           <button 
             onClick={() => setView('analytics')}
             className={cn(
               "flex items-center gap-3 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all rounded ml-1",
               view === 'analytics' ? "bg-[#1E3A8A] text-white shadow-md" : "text-slate-400 hover:text-[#1E3A8A] hover:bg-slate-50"
             )}
           >
             <BarChart3 className="w-4 h-4" />
             Intelligence
           </button>
        </div>
      </div>

      {view === 'analytics' ? (
        <AnalyticsDashboard reports={data.reports} branches={data.branches} weeks={data.weeks} />
      ) : (
        <div className="space-y-12">
           
           {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KpiCard title="Avg Attendance" value={`${data.stats.avgAttendance.toFixed(1)}%`} icon={Users} status="success" label="INSTITUTIONAL" description="System-wide participation benchmark across all branches." />
            <KpiCard title="Success Index" value={`${data.stats.avgPass.toFixed(1)}%`} icon={GraduationCap} status={data.stats.avgPass < 60 ? 'warning' : 'neutral'} label="EVALUATION" description="Average precision score in active test sessions." />
            <KpiCard title="Phase Integrity" value={`${data.stats.avgSyllabus.toFixed(1)}%`} icon={CheckCircle2} label="COMPLETION" description="Institutional syllabus progression mapping." />
            <KpiCard title="Tech Density" value={`${data.stats.laptopPercent.toFixed(1)}%`} icon={Laptop} label="EQUITY" description="Verified student laptop coverage percentage." />
            <KpiCard title="Active Nodes" value={data.summaries.length} icon={Database} label="REACH" description="Total reporting clusters in this session." />
          </div>

          {/* VISUAL ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
                <TrendChart 
                    title="Institutional Score Velocity"
                    data={data.weeklyTrendData} 
                />
            </div>
            
            <div className="lg:col-span-4">
                <HeatMap 
                    title="Regional Heatmap"
                    data={data.heatMapData}
                />
            </div>
          </div>

          {/* DATA REPOSITORY */}
          <div className="space-y-8">
            <div className="flex items-center gap-6 border-b border-slate-50 pb-6">
                <FileText className="w-5 h-5 text-[#1E3A8A]" />
                <h3 className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-slate-800">
                    Departmental Performance Registry
                </h3>
            </div>
            
            <ExpandableTable 
              data={data.summaries}
              columns={tableColumns}
              rowId={(row) => row.branch_code}
              expandableContent={(row) => (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="p-6 bg-slate-50 rounded border border-slate-100 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Total Units</span>
                      <div className="text-2xl font-black text-[#1E3A8A]">{row.total_students}</div>
                   </div>
                   <div className="p-6 bg-slate-50 rounded border border-slate-100 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Asset Density</span>
                      <div className="text-2xl font-black text-[#1E3A8A]">{row.laptop_holders}</div>
                   </div>
                    <div className="p-6 bg-slate-50 rounded border border-slate-100 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Sync Progress</span>
                      <div className="text-2xl font-black text-[#1E3A8A]">{row.syllabus_completion_percent}%</div>
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
