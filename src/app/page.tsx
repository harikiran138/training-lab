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
  BarChart3,
  ArrowRight,
  Zap,
  Activity
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Operational Data...</p>
      </div>
  );

  if (!data) return (
      <div className="p-12 border-4 border-rose-900 bg-rose-50 text-rose-900 font-bold uppercase tracking-widest text-center shadow-[12px_12px_0px_0px_rgba(225,29,72,1)]">
          System Fault: Data Acquisition Failure
      </div>
  );

  const tableColumns = [
    { header: 'Branch Code', accessorKey: 'branch_code', sortable: true, className: 'font-black italic text-blue-900 uppercase' },
    { header: 'Attendance', accessorKey: (row: any) => `${row.avg_attendance.toFixed(1)}%`, sortable: true, className: 'font-bold' },
    { header: 'Test Precision', accessorKey: (row: any) => `${row.avg_test_pass.toFixed(1)}%`, sortable: true, className: 'text-blue-700 font-black italic' },
    { header: 'Active Weeks', accessorKey: 'total_weeks', sortable: true, className: 'text-center' },
    { header: 'Performance Tier', accessorKey: (row: any) => (
      <span className={cn(
        "px-4 py-1 flex items-center justify-center text-[9px] font-black uppercase tracking-widest border-2",
        row.performance_grade?.startsWith('A') ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
        row.performance_grade?.startsWith('B') ? "bg-blue-50 text-blue-700 border-blue-200" :
        "bg-amber-50 text-amber-700 border-amber-200"
      )}>
        {row.performance_grade}
      </span>
    ) },
    { header: 'Operational Status', accessorKey: (row: any) => (
      <div className="flex flex-col gap-1.5 items-center">
        {row.avg_test_pass < 50 ? (
          <div className="flex items-center gap-2 text-rose-600 font-black text-[9px] bg-rose-50 px-3 py-1 border-2 border-rose-200 uppercase tracking-tighter w-full justify-center">
            <AlertCircle className="w-3 h-3" />
            Critical Intervene
          </div>
        ) : (
          <div className="flex items-center gap-2 text-blue-700 font-black text-[9px] bg-blue-50 px-3 py-1 border-2 border-blue-200 uppercase tracking-tighter w-full justify-center text-center">
            <CheckCircle2 className="w-3 h-3" />
            System Nominal
          </div>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-16">
      {/* 1. Header with View Toggle */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-slate-900 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Zap className="w-6 h-6 text-blue-800 fill-blue-800" />
             <h2 className="text-6xl font-black text-slate-900 tracking-[calc(0.0125em*-1)] uppercase italic leading-none">
               Mission Control
             </h2>
          </div>
          <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.5em] flex items-center gap-4">
            <span className="w-12 h-1 bg-blue-800"></span>
            Global Performance Intelligence :: Institutional Hub v3.5
          </p>
        </div>

        <div className="flex bg-white p-2 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(30,64,175,1)]">
           <button 
             onClick={() => setView('standard')}
             className={cn(
               "flex items-center gap-3 px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
               view === 'standard' ? "bg-blue-800 text-white italic" : "text-slate-400 hover:text-slate-900"
             )}
           >
             <LayoutDashboard className="w-4 h-4" />
             Core Ops
           </button>
           <button 
             onClick={() => setView('analytics')}
             className={cn(
               "flex items-center gap-3 px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-l-2 border-slate-100",
               view === 'analytics' ? "bg-blue-800 text-white italic" : "text-slate-400 hover:text-slate-900"
             )}
           >
             <BarChart3 className="w-4 h-4" />
             Deep Analytics
           </button>
        </div>
      </section>

      {view === 'analytics' ? (
        <AnalyticsDashboard reports={data.reports} branches={data.branches} weeks={data.weeks} />
      ) : (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
           
           {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <KpiCard 
              title="Institution Attendance" 
              value={`${data.stats.avgAttendance.toFixed(1)}%`} 
              icon={Users} 
              trend="+2.1%"
              trendDirection="up"
              status="success"
              description="Global average attendance across all registered branches"
              label="WEEKLY AVG"
            />
            <KpiCard 
              title="Test Accuracy" 
              value={`${data.stats.avgPass.toFixed(1)}%`} 
              icon={GraduationCap} 
              trend="-0.5%"
              trendDirection="down"
              status={data.stats.avgPass < 60 ? 'danger' : 'neutral'}
              description="Average test pass percentage tracking intellectual growth"
              label="INSTITUTIONAL"
            />
            <KpiCard 
              title="Phase Completion" 
              value={`${data.stats.avgSyllabus.toFixed(1)}%`} 
              icon={CheckCircle2} 
              trend="+5%"
              trendDirection="up"
              status="neutral"
              description="Syllabus progression mapping institutional targets"
              label="TOTAL RADIUS"
            />
             <KpiCard 
              title="Digital Readiness" 
              value={`${data.stats.laptopPercent.toFixed(1)}%`} 
              icon={Laptop} 
              status="neutral"
              description="Infrastructural percentage of student laptop coverage"
              label="COMPLIANCE"
            />
            <KpiCard 
              title="Total Enrolled" 
              value={data.stats.totalStudents} 
              icon={Activity} 
              status="neutral"
              description="Total active student population currently in training"
              label="STUDENTS"
            />
          </div>

          {/* VISUAL ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 bg-white p-12 border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
               <div className="flex items-center gap-4 mb-12">
                   <div className="p-3 bg-blue-800 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                       <TrendingUp className="w-6 h-6" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                       Success Metrics Over Time :: Comparative Trend Analysis
                   </h3>
               </div>
               <div className="h-[400px]">
                  <TrendChart 
                    title=""
                    data={data.weeklyTrendData} 
                    categories={['overall_score', 'attendance']}
                    index="week_no"
                    colors={['#1e40af', '#3b82f6']}
                  />
               </div>
            </div>
            
            <div className="lg:col-span-4 bg-slate-900 p-12 text-white shadow-[20px_20px_0px_0px_rgba(30,64,175,1)] flex flex-col justify-between">
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 mb-8 italic">
                      Regional Hotspots
                  </h3>
                  <div className="h-[300px]">
                    <HeatMap 
                        title=""
                        data={data.heatMapData}
                      />
                  </div>
               </div>
               <div className="pt-8 border-t border-white/10 space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Intelligence Brief</p>
                   <p className="text-sm font-bold leading-relaxed italic opacity-80">
                       The Heatmap highlights the correlation between technical engagement and test precision across all 13 branches. 
                       Blue clusters indicate high performing centers.
                   </p>
               </div>
            </div>
          </div>

          {/* DATA REPOSITORY */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
                    <ArrowRight className="w-5 h-5 text-blue-800" />
                    Branch Performance Registry
                </h3>
                <div className="bg-blue-50 text-blue-800 px-4 py-1 text-[9px] font-black uppercase tracking-widest border border-blue-100 italic">
                    Live Data :: {new Date().toLocaleDateString()}
                </div>
            </div>
            
            <ExpandableTable 
              title=""
              data={data.summaries}
              columns={tableColumns}
              rowId={(row) => row.branch_code}
              expandableContent={(row) => (
                 <div className="p-10 grid grid-cols-1 md:grid-cols-4 gap-12 bg-blue-50 animate-in slide-in-from-top-4 duration-300">
                   <div className="space-y-2">
                      <span className="text-[9px] text-blue-800 uppercase font-black tracking-widest block opacity-60">Base Strength</span>
                      <div className="text-2xl font-black italic">{row.total_students}</div>
                   </div>
                   <div className="space-y-2">
                      <span className="text-[9px] text-blue-800 uppercase font-black tracking-widest block opacity-60">Tech Equity</span>
                      <div className="text-2xl font-black italic">{row.laptop_holders} Laptops</div>
                   </div>
                    <div className="space-y-2">
                      <span className="text-[9px] text-blue-800 uppercase font-black tracking-widest block opacity-60">Phase Integrity</span>
                      <div className="text-2xl font-black italic">{row.syllabus_completion_percent}% Completed</div>
                   </div>
                   <div className="flex items-center">
                       <button className="bg-slate-900 text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(30,64,175,1)] hover:bg-black transition-all">
                           Detailed Audit
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
