"use client"

import React, { useMemo, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  Presentation,
  Calendar,
  ChevronRight,
  Target,
  Trophy,
  Activity,
  Maximize2,
  Minimize2,
  Settings,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Cell
} from 'recharts';
import { CrtAttendanceService, BranchAttendance } from '@/services/CrtAttendanceService';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  institutionName?: string;
  weekNumber: number;
  dateRange: string;
  subTitle?: string;
  rawData: BranchAttendance[];
  onDataUpdate?: (data: BranchAttendance[]) => void;
}

const BLUE_PALETTE = {
  primary: '#1e40af', // blue-800
  secondary: '#2563eb', // blue-600
  accent: '#3b82f6', // blue-500
  dark: '#0f172a', // slate-900
  light: '#eff6ff', // blue-50
  white: '#ffffff'
};

export default function CrtAttendanceDashboard({ 
  institutionName = "NSRIT Autonomous", 
  weekNumber, 
  dateRange,
  subTitle = "CRT PERFORMANCE ANALYTICS",
  rawData,
  onDataUpdate
}: Props) {
  const [isPresenting, setIsPresenting] = useState(false);

  const { calculatedBranches, metrics, insights, alerts } = useMemo(() => {
    return CrtAttendanceService.processData(rawData);
  }, [rawData]);

  const lineChartData = useMemo(() => {
    const days = [1, 2, 3, 4, 5, 6];
    return days.map(d => {
      let sum = 0;
      let strength = 0;
      calculatedBranches.forEach(b => {
        const val = b.attendancePercents[d-1];
        if (typeof val === 'number') {
          sum += (val * b.strength) / 100;
          strength += b.strength;
        }
      });
      return {
        day: `DAY ${d}`,
        avg: strength > 0 ? Math.round((sum / strength) * 100) : 0
      };
    });
  }, [calculatedBranches]);

  return (
    <div className={cn(
      "transition-all duration-300 font-sans selection:bg-blue-100 selection:text-blue-900",
      isPresenting ? "fixed inset-0 z-[100] bg-white p-12 overflow-y-auto" : "space-y-12"
    )}>
      
      {/* COMPACT ANALYTICAL DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-4 border-slate-900 pb-10">
        <div className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                {subTitle}
            </h2>
            <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    WEEK {weekNumber} :: PHASE 4 :: {dateRange}
                </div>
                <div className={cn(
                    "px-4 py-1 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[9px] font-black uppercase tracking-widest",
                    metrics.statusBadge === 'Excellent' ? "text-emerald-600 bg-white" :
                    metrics.statusBadge === 'Good' ? "text-blue-600 bg-white" : "text-rose-600 bg-white"
                )}>
                    {metrics.statusBadge}
                </div>
            </div>
        </div>
        
        <div className="flex gap-4">
            <Link 
                href="/data-entry"
                className="group flex items-center gap-3 bg-white border-2 border-slate-900 text-slate-900 px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
                <Database className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform" />
                Input Data
            </Link>

            <button 
                onClick={() => setIsPresenting(!isPresenting)}
                className="flex items-center gap-3 bg-blue-800 text-white px-8 py-4 text-xs font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:bg-blue-900 transition-all hover:scale-105 active:scale-95"
            >
                {isPresenting ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isPresenting ? "Exit View" : "Presentation"}
            </button>
        </div>
      </div>

      {!isPresenting && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <SharpKpi title="Core Enrollment" value={metrics.totalStudents.toString()} label="Students" icon={Users} trend="+2.4%" />
          <SharpKpi title="Global Participation" value={`${metrics.avgAttendance}%`} label="Attendance" icon={Activity} trend="Optimal" isHighlighted />
          <SharpKpi title="Peak Performance" value={`${metrics.highestBranch.percent}%`} label={metrics.highestBranch.name} icon={Trophy} />
          <SharpKpi title="Alert Index" value={metrics.missedSessions.toString()} label="Missed Sessions" icon={AlertTriangle} isAlert={metrics.missedSessions > 0} />
        </section>
      )}

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MAIN DATA TABLE */}
        <section className="lg:col-span-8 space-y-8">
            <div className="bg-white border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4">
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                        Branch Effectiveness Matrix :: Phase Compliance
                    </h3>
                    <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
                        <span className="flex items-center gap-2">H: &gt;75%</span>
                        <span className="flex items-center gap-2">M: 50-75%</span>
                        <span className="flex items-center gap-2">L: &lt;50%</span>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
                                <th className="px-6 py-6 border-r-2 border-slate-100">S.ID</th>
                                <th className="px-8 py-6 border-r-2 border-slate-100">Department</th>
                                <th className="px-6 py-6 border-r-2 border-slate-100 text-center">Base</th>
                                {[1, 2, 3, 4, 5, 6].map(d => (
                                    <th key={d} className="px-4 py-6 border-r border-slate-100 text-center">D{d}</th>
                                ))}
                                <th className="px-8 py-6 text-center bg-blue-800 text-white italic">WEEK %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {calculatedBranches.map((b, i) => (
                                <tr key={i} className="hover:bg-blue-50/50 transition-all group">
                                    <td className="px-6 py-5 text-center text-slate-300 font-black border-r-2 border-slate-50">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="px-8 py-5 font-black text-slate-900 border-r-2 border-slate-50 group-hover:text-blue-700 transition-colors uppercase italic">{b.branch}</td>
                                    <td className="px-6 py-5 text-center text-slate-500 font-bold border-r-2 border-slate-50 bg-slate-50/30">{b.strength}</td>
                                    
                                    {b.attendancePercents.map((p, idx) => (
                                        <td key={idx} className={cn(
                                            "px-4 py-5 text-center font-black border-r border-slate-50 text-xs",
                                            typeof p === 'string' ? "text-slate-200" :
                                            p >= 75 ? "text-blue-800 bg-blue-50/40" :
                                            p >= 50 ? "text-slate-600 bg-slate-50/40" : "text-rose-600 bg-rose-50/40"
                                        )}>
                                            {typeof p === 'number' ? `${p}%` : '-'}
                                        </td>
                                    ))}

                                    <td className={cn(
                                        "px-8 py-5 text-center font-black text-white italic transition-all group-hover:scale-105",
                                        b.weeklyAvg >= 75 ? "bg-blue-800" :
                                        b.weeklyAvg >= 50 ? "bg-slate-700" : "bg-rose-700"
                                    )}>
                                        {b.weeklyAvg}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-10 border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10 flex items-center gap-4">
                        <BarChart3 className="w-5 h-5 text-blue-700" />
                        Cross-Branch Efficiency
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={calculatedBranches}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                <Bar dataKey="weeklyAvg" radius={0} barSize={40}>
                                    {calculatedBranches.map((entry, index) => (
                                        <Cell key={index} fill={entry.weeklyAvg >= 75 ? BLUE_PALETTE.primary : BLUE_PALETTE.secondary} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-10 border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10 flex items-center gap-4">
                        <Activity className="w-5 h-5 text-blue-700" />
                        Institutional Pulse Trend
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                <Line type="stepAfter" dataKey="avg" stroke={BLUE_PALETTE.primary} strokeWidth={6} dot={{ r: 0 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>

        {/* SIDEBAR ANALYTICS */}
        <aside className="lg:col-span-4 space-y-12">
            
            <div className="bg-blue-800 p-10 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-56 h-56" />
                </div>
                <div className="relative z-10 space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-300">Administrative Summary</h4>
                    <div className="space-y-6">
                        {insights.map((insight, i) => (
                            <div key={i} className="flex gap-6 items-start pb-6 border-b border-blue-700/50 last:border-0 hover:translate-x-2 transition-transform cursor-default">
                                <Zap className="w-5 h-5 text-blue-300 shrink-0 mt-1" />
                                <p className="text-sm font-bold leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                    <button className="w-full bg-white text-blue-900 p-5 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-50 transition-all active:scale-95">
                        Download PDF Report
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-10 border-2 border-slate-900 bg-slate-50 space-y-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-4">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    Risk Assessment & Flags
                </h4>
                <div className="space-y-4">
                    {alerts.length > 0 ? alerts.map((alert, i) => (
                        <div key={i} className="bg-white p-6 border-l-4 border-rose-600 shadow-sm flex gap-4 animate-in slide-in-from-right duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="w-2 h-2 rounded-full bg-rose-600 mt-2 shrink-0" />
                            <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight leading-tight">{alert}</p>
                        </div>
                    )) : (
                        <div className="bg-white p-6 border-l-4 border-emerald-600 flex gap-4 items-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            <p className="text-sm font-black text-slate-800 uppercase">System Nominal :: No Risks Detected</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-10 bg-slate-900 text-white space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 italic">Strategic Compliance</h4>
                <p className="text-2xl font-black tracking-tighter leading-none uppercase">
                    "Consistent metrics reflect institutional excellence and readiness."
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/10 opacity-40">
                    <Layers className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Quality Assurance Division</span>
                </div>
            </div>
        </aside>
      </div>

    </div>
  );
}

function SharpKpi({ title, value, label, icon: Icon, trend, isHighlighted, isAlert }: { title: string, value: string, label: string, icon: any, trend?: string, isHighlighted?: boolean, isAlert?: boolean }) {
  return (
    <div className={cn(
      "p-10 border-2 transition-all group relative overflow-hidden",
      isHighlighted ? "bg-blue-800 text-white border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]" : 
      isAlert ? "bg-rose-50 text-rose-900 border-rose-600 shadow-[10px_10px_0px_0px_rgba(225,29,72,0.1)]" :
      "bg-white text-slate-900 border-slate-100 hover:border-blue-600 shadow-[10px_10px_0px_0px_rgba(30,64,175,0.03)] hover:shadow-[10px_10px_0px_0px_rgba(30,64,175,1)]"
    )}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn(
          "mb-8 p-4 border-2 transition-all group-hover:rotate-12",
          isHighlighted ? "bg-white text-blue-900 border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" : 
          isAlert ? "bg-rose-600 text-white border-transparent" :
          "bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-800 group-hover:text-white group-hover:border-slate-900"
        )}>
          <Icon className="w-8 h-8" />
        </div>
        <p className={cn(
          "text-[9px] font-black uppercase tracking-[0.4em] mb-4",
          isHighlighted ? "text-blue-200" : isAlert ? "text-rose-600" : "text-slate-400"
        )}>{title}</p>
        <p className="text-5xl font-black tracking-tighter leading-none uppercase italic">{value}</p>
        <p className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em] mt-4 opacity-60 rounded-full px-4 py-1 inline-block border",
          isHighlighted ? "border-white/20" : "border-slate-100"
        )}>{label}</p>
      </div>
      {trend && (
         <div className={cn(
           "absolute top-6 right-6 text-[9px] font-black uppercase tracking-widest",
           isHighlighted ? "text-emerald-400" : "text-blue-600"
         )}>
           {trend}
         </div>
      )}
    </div>
  );
}
