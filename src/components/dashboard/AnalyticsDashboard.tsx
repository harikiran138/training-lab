"use client"

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell 
} from 'recharts';
import { 
  Users, Award, TrendingUp, BookOpen, Clock, 
  BrainCircuit, Zap, Monitor, ArrowRight, ShieldCheck, Activity
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
      <div className="p-16 border border-slate-100 bg-white text-slate-400 font-black uppercase tracking-[0.5em] text-center rounded-[3rem] shadow-2xl">
          Repository Empty :: Awaiting Data Feed
      </div>
  );

  return (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* 4-COLUMN ELITE KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <KpiCard 
          title="Attendance Pulse" 
          value={`${stats.avgAttendance.toFixed(1)}%`} 
          icon={Users} 
          label="LATEST WEEK"
          status="success"
        />
        <KpiCard 
          title="Analytical Pass" 
          value={`${stats.avgPass.toFixed(1)}%`} 
          icon={Award} 
          label="ASSESSMENT"
        />
        <KpiCard 
          title="Motivation Index" 
          value={`${stats.avgMotivation.toFixed(1)}/10`} 
          icon={Zap} 
          label="ENGAGEMENT"
        />
        <KpiCard 
          title="Total Training" 
          value={`${stats.totalHours}`} 
          icon={Clock} 
          label="HOURS"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Branch Benchmark */}
        <div className="bg-white p-12 lg:p-16 border border-slate-100 rounded-[3rem] shadow-2xl shadow-blue-100/10">
          <h3 className="text-[11px] font-black text-slate-400 mb-16 flex items-center justify-between uppercase tracking-[0.4em] italic">
            <span className="flex items-center gap-6">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
                Branch Analysis Matrix
            </span>
            <span className="bg-blue-600 text-white px-6 py-2 rounded-2xl italic tracking-widest text-[9px] shadow-lg shadow-blue-100">CUMULATIVE</span>
          </h3>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} dy={20} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} dx={-20} />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                />
                <Bar dataKey="attendance" name="Participation" fill="#2563eb" radius={[12, 12, 12, 12]} barSize={28} />
                <Bar dataKey="pass" name="Success Rate" fill="#93c5fd" radius={[12, 12, 12, 12]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white p-12 lg:p-16 border border-slate-100 rounded-[3rem] shadow-2xl shadow-blue-200/5">
           <h3 className="text-[11px] font-black text-slate-400 mb-16 flex items-center gap-6 uppercase tracking-[0.4em] italic">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
              <Activity className="w-6 h-6" />
            </div>
            Temporal Evolution Matrix
          </h3>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorAtt_A" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} dy={20} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} dx={-20} />
                <Tooltip containerStyle={{ border: 'none', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }} />
                <Area type="monotone" dataKey="attendance" name="Avg Attendance" stroke="#2563eb" strokeWidth={6} fillOpacity={1} fill="url(#colorAtt_A)" />
                <Area type="monotone" dataKey="pass" name="Avg Pass" stroke="#93c5fd" strokeWidth={3} fill="transparent" strokeDasharray="10 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
         {/* Personality Dev */}
         <div className="col-span-1 bg-white p-16 border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
               <h3 className="text-[11px] font-black text-slate-400 mb-16 flex items-center gap-6 uppercase tracking-[0.5em] italic">
                   <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                      <BrainCircuit className="w-6 h-6" />
                   </div>
                   Psychometrics
               </h3>
               <div className="space-y-12">
                   <div>
                       <div className="flex justify-between text-[11px] uppercase font-black tracking-widest mb-4">
                           <span className="text-slate-500">Personality Quotient</span>
                           <span className="text-blue-800 italic">8.4 / 10.0</span>
                       </div>
                       <div className="w-full bg-slate-50 h-5 rounded-full p-1 border border-slate-100">
                           <div className="bg-gradient-to-r from-blue-400 to-blue-700 h-full rounded-full transition-all duration-1000 shadow-lg shadow-blue-100" style={{ width: '84%' }}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-[11px] uppercase font-black tracking-widest mb-4">
                           <span className="text-slate-500">Cultural Alignment</span>
                           <span className="text-blue-800 italic">7.2 / 10.0</span>
                       </div>
                       <div className="w-full bg-slate-50 h-5 rounded-full p-1 border border-slate-100">
                           <div className="bg-gradient-to-r from-blue-300 to-blue-500 h-full rounded-full transition-all duration-1000 shadow-lg shadow-blue-50" style={{ width: '72%' }}></div>
                       </div>
                   </div>
               </div>
            </div>
            <div className="mt-16 pt-12 border-t border-slate-50 italic">
                <div className="flex items-center gap-8">
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                      <Monitor className="w-10 h-10" />
                    </div>
                    <div>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">479</p>
                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-2">Verified Digital Assets</p>
                    </div>
                </div>
            </div>
         </div>

         {/* Detailed Rankings */}
         <div className="md:col-span-2 bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-6 text-slate-900 italic">
                    <div className="w-3 h-10 bg-blue-600 rounded-full"></div>
                    Institutional High-Performers
                </h3>
                <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-6 py-2 rounded-full border border-blue-100">REAL-TIME RANKING</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50">Metric Identifier</th>
                            <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50">Participation</th>
                            <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50">Precision</th>
                            <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Risk Index</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold">
                        {branchData.slice(0, 8).map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-blue-50/50 transition-all duration-300 group">
                                <td className="px-12 py-8 font-black text-blue-900 italic border-r border-slate-50 uppercase text-lg">{b.name}</td>
                                <td className="px-12 py-8 text-slate-600 border-r border-slate-50 text-base">{b.attendance}%</td>
                                <td className="px-12 py-8 text-blue-600 font-black border-r border-slate-50 text-base">{b.pass}%</td>
                                <td className="px-12 py-8">
                                    <div className={cn(
                                        "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border text-center transition-all",
                                        b.attendance > 90 ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-lg shadow-emerald-50" : 
                                        b.attendance > 80 ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                        "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                                    )}>
                                        {b.attendance > 90 ? 'OPTIMAL' : b.attendance > 80 ? 'STANDARD' : 'INTERVENE'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      </div>

      {/* MISSION INTELLIGENCE PORTAL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mt-24 pt-24 border-t border-slate-100">
        <div className="lg:col-span-3">
           <AIInsights />
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-16 text-white rounded-[3rem] shadow-2xl shadow-blue-200 relative overflow-hidden group">
           <ShieldCheck className="absolute -bottom-16 -right-16 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <h3 className="text-[11px] font-black text-blue-400 mb-10 uppercase tracking-[0.4em] italic opacity-60">Architectural Forecast</h3>
                    <p className="text-2xl font-black leading-tight italic uppercase tracking-tighter">
                      "Metadata ingestion complete. Synthetic behavioral models initialized."
                    </p>
                </div>
                <div className="pt-10 border-t border-white/10 mt-16">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Authorization Code: DELTA-9</p>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
}
