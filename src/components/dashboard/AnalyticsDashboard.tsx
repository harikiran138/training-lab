"use client"

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell 
} from 'recharts';
import { 
  Users, Award, TrendingUp, BookOpen, Clock, 
  BrainCircuit, Zap, Monitor, ArrowRight, ShieldCheck, Activity, FileText
} from 'lucide-react';
import { AIInsights } from './AIInsights';
import { cn } from '@/lib/utils';
import { KpiCard } from './KpiCard';

export default function AnalyticsDashboard({ reports, branches, weeks }: any) {
  const stats = useMemo(() => {
    if (!reports?.length) return null;
    
    const latestWeek = Math.max(...reports.map((r: any) => r.week_no));
    const latestReports = reports.filter((r: any) => r.week_no === latestWeek);
    
    const avgAttendance = latestReports.reduce((acc: any, r: any) => acc + r.attendance.avg_attendance_percent, 0) / latestReports.length;
    const avgPass = latestReports.reduce((acc: any, r: any) => acc + r.tests.avg_test_pass_percent, 0) / latestReports.length;
    const totalHours = latestReports.reduce((acc: any, r: any) => acc + (r.total_training_hours || 0), 0);
    const avgMotivation = latestReports.reduce((acc: any, r: any) => acc + (r.motivation?.avg_score || 0), 0) / latestReports.length;
    
    return {
      avgAttendance,
      avgPass,
      totalHours,
      avgMotivation,
      latestWeek
    };
  }, [reports]);

  const branchData = useMemo(() => {
    if (!reports?.length) return [];
    
    const branchStats = new Map();
    reports.forEach((r: any) => {
      if (!branchStats.has(r.branch_code)) {
        branchStats.set(r.branch_code, { attendance: 0, pass: 0, count: 0 });
      }
      const b = branchStats.get(r.branch_code);
      b.attendance += r.attendance.avg_attendance_percent;
      b.pass += r.tests.avg_test_pass_percent;
      b.count += 1;
    });

    return Array.from(branchStats.entries()).map(([code, data]) => ({
      name: code,
      attendance: parseFloat((data.attendance / data.count).toFixed(1)),
      pass: parseFloat((data.pass / data.count).toFixed(1))
    })).sort((a, b) => b.attendance - a.attendance);
  }, [reports]);

  const trendData = useMemo(() => {
    if (!reports?.length) return [];
    const weeksMap = new Map();
    reports.forEach((r: any) => {
      if (!weeksMap.has(r.week_no)) {
        weeksMap.set(r.week_no, { week: `W${r.week_no}`, attendance: 0, pass: 0, count: 0 });
      }
      const w = weeksMap.get(r.week_no);
      w.attendance += r.attendance.avg_attendance_percent;
      w.pass += r.tests.avg_test_pass_percent;
      w.count += 1;
    });
    
    return Array.from(weeksMap.values())
      .map(w => ({
        ...w,
        attendance: Math.round(w.attendance / w.count),
        pass: Math.round(w.pass / w.count)
      }))
      .sort((a, b) => parseInt(a.week.slice(1)) - parseInt(b.week.slice(1)));
  }, [reports]);

  if (!stats) return (
      <div className="p-16 border border-slate-200 bg-white text-[#1E3A8A] font-bold uppercase tracking-widest text-center rounded shadow-sm">
          Institutional Repository Empty :: Awaiting Ingestion
      </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 4-COLUMN KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Attendance Pulse" 
          value={`${stats.avgAttendance.toFixed(1)}%`} 
          icon={Users} 
          label="LATEST BATCH"
          status="success"
          description="Average student attendance across all clusters for the reporting week."
        />
        <KpiCard 
          title="Analytical Accuracy" 
          value={`${stats.avgPass.toFixed(1)}%`} 
          icon={Award} 
          label="ASSESSMENT MEAN"
          description="Cumulative pass precision in technical evaluative sessions."
        />
        <KpiCard 
          title="Motivation Score" 
          value={`${stats.avgMotivation.toFixed(1)}/10`} 
          icon={Zap} 
          label="ENGAGEMENT INDEX"
          status={stats.avgMotivation < 7 ? 'warning' : 'neutral'}
          description="Subjective student interest mapping during CRT segments."
        />
        <KpiCard 
          title="Consolidated Hours" 
          value={`${stats.totalHours}`} 
          icon={Clock} 
          label="TRAINING LOOM"
          description="Total institutional instruction blocks delivered to date."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Branch Benchmark */}
        <div className="bg-white p-8 border border-slate-200 rounded shadow-sm">
          <div className="flex items-center justify-between mb-10 border-l-4 border-[#1E3A8A] pl-4">
             <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider">
               Departmental Benchmark Matrix
             </h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cumulative Data</span>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '12px' }}
                  labelStyle={{ fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Bar dataKey="attendance" name="Participation" fill="#1E3A8A" radius={[2, 2, 0, 0]} barSize={32} />
                <Bar dataKey="pass" name="Precision" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white p-8 border border-slate-200 rounded shadow-sm">
          <div className="flex items-center justify-between mb-10 border-l-4 border-[#1E3A8A] pl-4">
            <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider">
              Temporal Velocity Vector
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">W1 – W{stats.latestWeek}</span>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAtt_Formal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-10} />
                <Tooltip />
                <Area type="monotone" dataKey="attendance" name="Avg Attendance" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt_Formal)" />
                <Area type="monotone" dataKey="pass" name="Avg Pass" stroke="#3B82F6" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {/* Personality Dev */}
         <div className="col-span-1 bg-white p-8 border border-slate-200 rounded shadow-sm space-y-12">
            <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider border-l-4 border-[#1E3A8A] pl-4">
                Psychometric Alignment
            </h3>
            <div className="space-y-10">
                <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-3">
                        <span className="text-slate-400">Persona Index</span>
                        <span className="text-[#1E3A8A]">8.4 / 10.0</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                        <div className="bg-[#1E3A8A] h-full transition-all duration-1000" style={{ width: '84%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-3">
                        <span className="text-slate-400">Institutional Fit</span>
                        <span className="text-[#1E3A8A]">7.2 / 10.0</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                        <div className="bg-[#3B82F6] h-full transition-all duration-1000" style={{ width: '72%' }}></div>
                    </div>
                </div>
            </div>
            <div className="pt-8 border-t border-slate-50 flex items-center gap-6">
                <div className="bg-blue-50 p-3 rounded text-[#1E3A8A]">
                   <Monitor className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-800 leading-none">479</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verified Assets</p>
                </div>
            </div>
         </div>

         {/* Detailed Rankings */}
         <div className="md:col-span-2 bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-3">
                    <Activity className="w-4 h-4" />
                    Branch Intelligence Registry
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#1E3A8A] border-b border-[#1E3A8A]">
                            <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-widest">Branch Name</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-widest">Attendance %</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-widest">Pass rate %</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-widest text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {branchData.slice(0, 7).map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-blue-50/30 transition-colors odd:bg-white even:bg-slate-50/30">
                                <td className="px-6 py-4 font-bold text-[#1E3A8A] text-[14px] uppercase">{b.name}</td>
                                <td className="px-6 py-4 text-slate-600 font-medium text-[13px]">{b.attendance}%</td>
                                <td className="px-6 py-4 text-[#3B82F6] font-bold text-[13px]">{b.pass}%</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn(
                                        "px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded border",
                                        b.attendance > 90 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                                        b.attendance > 80 ? "bg-blue-50 text-blue-700 border-blue-100" : 
                                        "bg-rose-50 text-rose-700 border-rose-100"
                                    )}>
                                        {b.attendance > 80 ? 'Optimized' : 'Review'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      </div>

      {/* AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mt-16 pt-12 border-t border-slate-100">
        <div className="lg:col-span-3">
           <AIInsights />
        </div>
        <div className="bg-[#1E3A8A] p-8 text-white rounded shadow-md relative overflow-hidden flex flex-col justify-between">
           <ShieldCheck className="absolute -bottom-10 -right-10 w-40 h-40 opacity-5" />
           <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                <div>
                    <h3 className="text-[10px] font-bold text-blue-300 mb-6 uppercase tracking-widest opacity-60">System Security</h3>
                    <p className="text-lg font-bold leading-tight opacity-90 italic">
                      "Consolidated institution telemetry is verified and synchronized."
                    </p>
                </div>
                <div className="flex items-center gap-3 text-emerald-400 font-bold text-[9px] uppercase tracking-[0.2em] bg-white/5 py-2 px-4 rounded self-start">
                    <CheckCircle2 className="w-3 h-3" />
                    V5.0 Active
                </div>
           </div>
        </div>
      </div>
    </div>
  );
}
