"use client"

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell 
} from 'recharts';
import { 
  Users, Award, TrendingUp, BookOpen, Clock, 
  BrainCircuit, Zap, Monitor, ArrowRight, ShieldCheck
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
      <div className="p-12 border-2 border-slate-200 text-slate-400 font-black uppercase tracking-widest text-center">
          Repository Empty :: Awaiting Data Feed
      </div>
  );

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 4-COLUMN STAT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Branch Benchmark */}
        <div className="bg-white p-12 border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-[10px] font-black text-slate-400 mb-10 flex items-center justify-between uppercase tracking-[0.4em] italic">
            <span className="flex items-center gap-4">
                <TrendingUp className="w-5 h-5 text-blue-800" />
                Branch Benchmark Analysis
            </span>
            <span className="bg-blue-800 text-white px-4 py-1 italic tracking-widest text-[9px]">CUMULATIVE</span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <Tooltip 
                  contentStyle={{ border: '2px solid #0f172a', borderRadius: '0', boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                />
                <Bar dataKey="attendance" name="Attendance" fill="#1e40af" radius={0} barSize={25} />
                <Bar dataKey="pass" name="Success Rate" fill="#3b82f6" radius={0} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white p-12 border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(30,64,175,0.05)]">
           <h3 className="text-[10px] font-black text-slate-400 mb-10 flex items-center gap-4 uppercase tracking-[0.4em] italic">
            <TrendingUp className="w-5 h-5 text-blue-800" />
            Institutional Progress Matrix
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <Tooltip containerStyle={{ border: '2px solid #0f172a', borderRadius: '0' }} />
                <Area type="stepAfter" dataKey="attendance" name="Avg Attendance" stroke="#1e40af" strokeWidth={4} fillOpacity={1} fill="url(#colorAtt)" />
                <Area type="stepAfter" dataKey="pass" name="Avg Pass" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
         {/* Personality Dev */}
         <div className="col-span-1 bg-white p-10 border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div>
               <h3 className="text-[10px] font-black text-slate-400 mb-10 flex items-center gap-4 uppercase tracking-[0.5em] italic">
                   <BrainCircuit className="w-5 h-5 text-blue-800" />
                   Psychometrics
               </h3>
               <div className="space-y-10">
                   <div>
                       <div className="flex justify-between text-[10px] uppercase font-black tracking-widest mb-3">
                           <span className="text-slate-500">Personality Quotient</span>
                           <span className="text-blue-800 italic">8.4 / 10.0</span>
                       </div>
                       <div className="w-full bg-slate-100 h-4 border border-slate-200">
                           <div className="bg-blue-800 h-full transition-all duration-1000" style={{ width: '84%' }}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-[10px] uppercase font-black tracking-widest mb-3">
                           <span className="text-slate-500">Cultural Alignment</span>
                           <span className="text-blue-800 italic">7.2 / 10.0</span>
                       </div>
                       <div className="w-full bg-slate-100 h-4 border border-slate-200">
                           <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: '72%' }}></div>
                       </div>
                   </div>
               </div>
            </div>
            <div className="mt-12 pt-10 border-t border-slate-100 italic">
                <div className="flex items-center gap-6">
                    <Monitor className="w-10 h-10 text-blue-200" />
                    <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">479</p>
                        <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">Digital Asset Holders</p>
                    </div>
                </div>
            </div>
         </div>

         {/* Detailed Rankings */}
         <div className="md:col-span-2 bg-white border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b-2 border-slate-900 flex justify-between items-center bg-slate-900 text-white">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    Top Performing Nodes
                </h3>
                <span className="text-[9px] font-black uppercase bg-blue-800 px-3 py-1">REAL-TIME RANKING</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Metric Identifier</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Participation</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Precision</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Index</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                        {branchData.slice(0, 8).map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-blue-50/50 transition-all group">
                                <td className="px-8 py-5 font-black text-blue-900 italic border-r border-slate-50 uppercase">{b.name}</td>
                                <td className="px-8 py-5 text-slate-600 border-r border-slate-50">{b.attendance}%</td>
                                <td className="px-8 py-5 text-blue-800 font-black border-r border-slate-50">{b.pass}%</td>
                                <td className="px-8 py-5">
                                    <div className={cn(
                                        "px-4 py-1 text-[9px] font-black uppercase tracking-widest border-2 text-center",
                                        b.attendance > 90 ? "bg-white text-emerald-600 border-emerald-600 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)]" : 
                                        b.attendance > 80 ? "bg-white text-blue-700 border-blue-700 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.1)]" : 
                                        "bg-white text-rose-600 border-rose-600 animate-pulse"
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

      {/* INTELLIGENCE PORTAL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-16 pt-16 border-t-4 border-slate-900">
        <div className="lg:col-span-3">
           <AIInsights />
        </div>
        <div className="bg-blue-800 p-10 text-white shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
           <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform" />
           <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <h3 className="text-[10px] font-black text-blue-300 mb-8 uppercase tracking-[0.4em] italic">Institutional Forecast</h3>
                    <p className="text-lg font-black leading-tight italic uppercase tracking-tighter">
                      "Real-time metadata ingestion enables predictive behavioral analytics."
                    </p>
                </div>
                <div className="pt-8 border-t border-blue-600 mt-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Security Clearance Level 4</p>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
}
