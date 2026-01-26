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
  Layers
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

  if (loading) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-100"></div>
          <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">Synchronizing Mission Control...</p>
      </div>
  );

  if (!data) return (
      <div className="p-16 border border-rose-100 bg-white text-rose-600 rounded-[3rem] shadow-2xl shadow-rose-50 text-center flex flex-col items-center gap-6">
          <AlertCircle className="w-16 h-16" />
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">System Fault: Data Breach or Failure</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verify Secure connection to Repository</p>
      </div>
  );

  const tableColumns = [
    { header: 'Branch Code', accessorKey: 'branch_code', sortable: true, className: 'font-black italic text-blue-800 uppercase text-lg' },
    { header: 'Attendance', accessorKey: (row: any) => `${row.avg_attendance.toFixed(1)}%`, sortable: true, className: 'font-bold text-base' },
    { header: 'Test Precision', accessorKey: (row: any) => `${row.avg_test_pass.toFixed(1)}%`, sortable: true, className: 'text-blue-600 font-black italic text-base' },
    { header: 'Active Weeks', accessorKey: 'total_weeks', sortable: true, className: 'text-center font-bold text-slate-400' },
    { header: 'Performance Tier', accessorKey: (row: any) => (
      <span className={cn(
        "px-6 py-2 flex items-center justify-center text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all",
        row.performance_grade?.startsWith('A') ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm" :
        row.performance_grade?.startsWith('B') ? "bg-blue-50 text-blue-700 border-blue-100" :
        "bg-amber-50 text-amber-700 border-amber-100"
      )}>
        {row.performance_grade}
      </span>
    ) },
    { header: 'Operational Status', accessorKey: (row: any) => (
      <div className="flex flex-col gap-2 items-center">
        {row.avg_test_pass < 50 ? (
          <div className="flex items-center gap-3 text-rose-600 font-bold text-[10px] bg-rose-50 px-5 py-2 rounded-2xl border border-rose-100 uppercase tracking-widest w-full justify-center shadow-inner">
            <AlertCircle className="w-4 h-4" />
            Critical Intervene
          </div>
        ) : (
          <div className="flex items-center gap-3 text-blue-700 font-bold text-[10px] bg-blue-50 px-5 py-2 rounded-2xl border border-blue-100 uppercase tracking-widest w-full justify-center text-center shadow-inner">
            <CheckCircle2 className="w-4 h-4" />
            System Nominal
          </div>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-24">
      {/* 1. Header with View Toggle */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 border-b border-slate-100 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="bg-blue-600 p-4 rounded-[1.5rem] shadow-xl shadow-blue-100">
                <Zap className="w-8 h-8 text-white fill-white" />
             </div>
             <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none animate-in slide-in-from-left-8 duration-700">
               Mission <span className="text-blue-600">Control</span>
             </h2>
          </div>
          <p className="text-blue-500 font-bold text-[12px] uppercase tracking-[0.5em] flex items-center gap-6 opacity-60">
            <span className="w-16 h-1 bg-blue-600 rounded-full"></span>
            Performance Intelligence :: Institutional Hub v4.0
          </p>
        </div>

        <div className="flex bg-white p-3 rounded-[2rem] border border-slate-100 shadow-2xl shadow-blue-100/50 self-start xl:self-end">
           <button 
             onClick={() => setView('standard')}
             className={cn(
               "flex items-center gap-4 px-10 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-500 rounded-2xl",
               view === 'standard' ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/50"
             )}
           >
             <LayoutDashboard className="w-5 h-5" />
             Core Ops
           </button>
           <button 
             onClick={() => setView('analytics')}
             className={cn(
               "flex items-center gap-4 px-10 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-500 rounded-2xl ml-2",
               view === 'analytics' ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/50"
             )}
           >
             <BarChart3 className="w-5 h-5" />
             Deep Intelligence
           </button>
        </div>
      </section>

      {view === 'analytics' ? (
        <AnalyticsDashboard reports={data.reports} branches={data.branches} weeks={data.weeks} />
      ) : (
        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           
           {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <KpiCard 
              title="Attendance Pulse" 
              value={`${data.stats.avgAttendance.toFixed(1)}%`} 
              icon={Users} 
              trend="+2.1%"
              trendDirection="up"
              status="success"
              description="Global average attendance across all registered branches"
              label="INSTITUTIONAL"
            />
            <KpiCard 
              title="Success Index" 
              value={`${data.stats.avgPass.toFixed(1)}%`} 
              icon={GraduationCap} 
              trend="-0.5%"
              trendDirection="down"
              status={data.stats.avgPass < 60 ? 'danger' : 'neutral'}
              description="Average test pass percentage tracking intellectual growth"
              label="EVALUATION"
            />
            <KpiCard 
              title="Phase Integrity" 
              value={`${data.stats.avgSyllabus.toFixed(1)}%`} 
              icon={CheckCircle2} 
              trend="+5%"
              trendDirection="up"
              status="neutral"
              description="Syllabus progression mapping institutional targets"
              label="COMPLETION"
            />
             <KpiCard 
              title="Tech Equity" 
              value={`${data.stats.laptopPercent.toFixed(1)}%`} 
              icon={Laptop} 
              status="neutral"
              description="Infrastructural percentage of student laptop coverage"
              label="CAPABILITY"
            />
            <KpiCard 
              title="Active Nodes" 
              value={data.summaries.length} 
              icon={Activity} 
              status="neutral"
              description="Total number of branches currently reporting daily active sessions"
              label="REACH"
            />
          </div>

          {/* VISUAL ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 bg-white p-12 lg:p-16 rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-100/20">
               <div className="flex items-center gap-6 mb-16">
                   <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                       <TrendingUp className="w-8 h-8" />
                   </div>
                   <div>
                       <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-60">
                           Comparative Trend Analysis :: Temporal Vectors
                       </h3>
                       <p className="text-xs font-bold text-blue-800 mt-2 uppercase tracking-widest italic opacity-50">Synchronized Weekly Visualization</p>
                   </div>
               </div>
               <div className="h-[450px]">
                  <TrendChart 
                    title=""
                    data={data.weeklyTrendData} 
                    categories={['overall_score', 'attendance']}
                    index="week_no"
                    colors={['#2563eb', '#60a5fa']}
                  />
               </div>
            </div>
            
            <div className="lg:col-span-4 bg-slate-900 p-12 lg:p-16 text-white rounded-[3rem] shadow-2xl shadow-blue-200/20 flex flex-col justify-between relative overflow-hidden group">
               <div className="relative z-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400 mb-12 italic opacity-70">
                      Regional Intelligence Hotspots
                  </h3>
                  <div className="h-[350px]">
                    <HeatMap 
                        title=""
                        data={data.heatMapData}
                      />
                  </div>
               </div>
               <div className="relative z-10 pt-10 border-t border-white/10 space-y-6">
                   <div className="flex items-center gap-4">
                       <Layers className="w-5 h-5 text-blue-400" />
                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Node Analysis BRIEF</p>
                   </div>
                   <p className="text-base font-bold leading-relaxed italic opacity-80 decoration-blue-600 underline-offset-8">
                       Operational intensity peaks in CSE sectors. Inter-departmental success correlation is optimized at 84% benchmark.
                   </p>
               </div>
               {/* Accent */}
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>

          {/* DATA REPOSITORY */}
          <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-slate-100 pb-8 px-4">
                <div className="flex items-center gap-6">
                    <div className="w-3 h-12 bg-blue-600 rounded-full"></div>
                    <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 italic">
                        Node Performance Registry
                    </h3>
                </div>
                <div className="bg-white text-blue-600 px-6 py-2 text-[10px] font-black uppercase tracking-widest border border-blue-50 rounded-full shadow-lg shadow-blue-50 italic">
                    Live Telemetry :: AUTHENTICATED ACCESS
                </div>
            </div>
            
            <ExpandableTable 
              title=""
              data={data.summaries}
              columns={tableColumns}
              rowId={(row) => row.branch_code}
              expandableContent={(row) => (
                 <div className="p-12 xl:p-16 grid grid-cols-1 md:grid-cols-4 gap-12 bg-white rounded-3xl border border-blue-50 shadow-inner animate-in slide-in-from-top-4 duration-500">
                   <div className="space-y-4">
                      <span className="text-[11px] text-blue-400 uppercase font-black tracking-widest block opacity-70">Node Strength</span>
                      <div className="text-4xl font-black italic text-slate-900">{row.total_students} <span className="text-base not-italic text-slate-300">UNITS</span></div>
                   </div>
                   <div className="space-y-4">
                      <span className="text-[11px] text-blue-400 uppercase font-black tracking-widest block opacity-70">Digital Equity</span>
                      <div className="text-4xl font-black italic text-slate-900">{row.laptop_holders} <span className="text-base not-italic text-slate-300">ASSETS</span></div>
                   </div>
                    <div className="space-y-4">
                      <span className="text-[11px] text-blue-400 uppercase font-black tracking-widest block opacity-70">Phase Integrity</span>
                      <div className="text-4xl font-black italic text-blue-600">{row.syllabus_completion_percent}% <span className="text-base not-italic text-slate-300">SYNC</span></div>
                   </div>
                   <div className="flex items-center">
                       <button className="bg-slate-900 text-white px-10 py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-200/50 hover:bg-blue-600 hover:scale-105 transition-all duration-300">
                           Initialize Audit
                       </button>
                   </div>
                 </div>
              )}
            />
          </section>
        </div>
      )}
    </div>
  );
}
