"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { INSTITUTIONAL_SCHEMAS } from '@/config/SchemaManager';

export default function OverviewPage() {
  const [activeDomain, setActiveDomain] = useState('crt_attendance');
  const [view, setView] = useState<'standard' | 'analytics'>('standard');
  const [isPresented, setIsPresented] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = INSTITUTIONAL_SCHEMAS[activeDomain];

  const groupedSchemas = useMemo(() => {
    const groups: Record<string, typeof INSTITUTIONAL_SCHEMAS[string][]> = {};
    Object.values(INSTITUTIONAL_SCHEMAS).forEach(s => {
        if (!groups[s.category]) groups[s.category] = [];
        groups[s.category].push(s);
    });
    return groups;
  }, []);

  // Toggle Presentation Mode with Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isPresented) {
            setIsPresented(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresented]);

  // Simulate domain-specific KPIs
  const domainKPIs = useMemo(() => {
    switch(activeDomain) {
        case 'placement_summary':
            return [
                { title: "Placement Rate", value: "84%", icon: Trophy, status: "success", label: "INSTITUTIONAL" },
                { title: "Avg CTC", value: "6.2 LPA", icon: Target, status: "neutral", label: "MARKET" },
                { title: "Total Offers", value: "482", icon: Layers, status: "neutral", label: "VOLUME" },
                { title: "Active Drives", value: "12", icon: Zap, status: "success", label: "REACH" },
                { title: "Top Offer", value: "18 LPA", icon: Star, status: "success", label: "PEAK" }
            ];
        case 'drive_log':
            return [
                { title: "Drives Today", value: "03", icon: Zap, status: "success", label: "OPS" },
                { title: "Success Rate", value: "24%", icon: Activity, status: "warning", label: "EFFICIENCY" },
                { title: "Total Eligible", value: "1.2k", icon: Users, status: "neutral", label: "REACH" },
                { title: "Online Mode", value: "85%", icon: Laptop, status: "neutral", label: "INFRA" },
                { title: "Avg CTC", value: "4.8 LPA", icon: Database, status: "neutral", label: "VALUE" }
            ];
        default:
            return [
                { title: "Avg Attendance", value: "92.4%", icon: Users, status: "success", label: "INSTITUTIONAL" },
                { title: "Success Index", value: "78.2%", icon: GraduationCap, status: "neutral", label: "EVALUATION" },
                { title: "Phase Integrity", value: "94%", icon: CheckCircle2, status: "success", label: "COMPLETION" },
                { title: "Tech Density", value: "85.4%", icon: Laptop, status: "neutral", label: "EQUITY" },
                { title: "Active Nodes", value: "12", icon: Database, status: "neutral", label: "REACH" }
            ];
    }
  }, [activeDomain]);

  if (loading) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#1E3A8A] opacity-60">Synchronizing Session...</p>
      </div>
  );

  return (
    <div className={cn(
        "min-h-screen transition-all duration-700",
        isPresented ? "presentation-mode-active p-0" : "p-8 md:p-12"
    )}>
        <div id="main-content" className={cn(
            "space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500",
            isPresented && "animate-presentation-slide"
        )}>
        {/* MASTER HEADER SECTION */}
        <div className={cn(
            "flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b pb-10",
            isPresented ? "border-white/10" : "border-slate-100"
        )}>
            <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "p-2 rounded shadow-sm transition-colors",
                    isPresented ? "bg-blue-500 text-white" : "bg-[#1E3A8A] text-white"
                )}>
                    <LayoutDashboard className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight uppercase">
                {isPresented ? "Executive Review" : "Master Dashboard"} <span className="font-light opacity-60 font-mono">:: v5.0</span>
                </h2>
            </div>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Institutional Solution Mastery :: {schema.category} Intelligence
            </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* PRESENTATION TOGGLE */}
                <button 
                    onClick={() => setIsPresented(!isPresented)}
                    className={cn(
                        "flex items-center gap-3 px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded border-2 shadow-xl",
                        isPresented 
                            ? "bg-rose-600 border-rose-500 text-white hover:bg-rose-700 animate-pulse" 
                            : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700"
                    )}
                >
                    <Monitor className="w-4 h-4" />
                    {isPresented ? "Exit Review Mode" : "Start Presentation"}
                </button>

                {/* DOMAIN SELECTOR */}
                <div className={cn(
                    "p-1.5 rounded border shadow-sm flex items-center pr-6 overflow-hidden transition-all",
                    isPresented ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}>
                    <div className={cn(
                        "border-r px-4 py-2 mr-4",
                        isPresented ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
                    )}>
                        <Database className="w-4 h-4 text-[#1E3A8A]" />
                    </div>
                    <div className="relative">
                        <select 
                            value={activeDomain}
                            onChange={(e) => setActiveDomain(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 font-extrabold uppercase tracking-tighter text-lg p-0 cursor-pointer appearance-none pr-10"
                        >
                            {Object.entries(groupedSchemas).map(([cat, schemas]) => (
                                <optgroup key={cat} label={cat.toUpperCase()} className="font-bold text-slate-400">
                                    {schemas.map(s => (
                                        <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className={cn(
                    "flex p-1.5 rounded border shadow-sm hide-in-presentation",
                    isPresented ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}>
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
                        Deep Drill
                    </button>
                </div>
            </div>
        </div>

      {view === 'analytics' ? (
        <div className="min-h-[500px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-20 gap-6">
             <div className="w-20 h-20 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center shadow-inner">
                <Layers className="w-10 h-10 animate-pulse" />
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl font-black text-[#1E3A8A] uppercase tracking-tighter">Domain Intelligence Layer</h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                    AI-Powered deep analysis for <span className="text-[#1E3A8A]">{schema.name}</span> currently under institutional calibration.
                </p>
             </div>
             <button className="mt-8 flex items-center gap-3 px-10 py-3.5 bg-[#1E3A8A] text-white rounded font-black text-[11px] tracking-[0.2em] shadow-2xl hover:bg-blue-900 transition-all uppercase">
                <Zap className="w-4 h-4" /> Initialize Core Engine
             </button>
        </div>
      ) : (
        <div className="space-y-12">
           
           {/* KPI GRID */}
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6",
            isPresented && "lg:grid-cols-3 xl:grid-cols-5"
          )}>
            {domainKPIs.map((kpi, i) => (
                <KpiCard 
                    key={i}
                    title={kpi.title} 
                    value={kpi.value} 
                    icon={kpi.icon} 
                    status={kpi.status as any} 
                    label={kpi.label} 
                    description={`${schema.name} ${kpi.title.toLowerCase()} benchmark.`} 
                />
            ))}
          </div>

          {/* VISUAL ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className={cn(isPresented ? "lg:col-span-12" : "lg:col-span-8")}>
                <TrendChart 
                    title={`${schema.name} Velocity Trend`}
                    data={[
                        { name: 'Week 1', value: 45 },
                        { name: 'Week 2', value: 52 },
                        { name: 'Week 3', value: 48 },
                        { name: 'Week 4', value: 65 },
                        { name: 'Week 5', value: 82 },
                    ]} 
                />
            </div>
            
            <div className={cn(isPresented ? "lg:col-span-12" : "lg:col-span-4")}>
                <HeatMap 
                    title={`${schema.category} Hotspots`}
                    data={[
                        { id: 'CSE', label: 'CSE', value: 92, secondaryValue: 88 },
                        { id: 'ECE', label: 'ECE', value: 65, secondaryValue: 72 },
                        { id: 'IT', label: 'IT', value: 84, secondaryValue: 80 },
                    ]}
                />
            </div>
          </div>

          {/* DATA REPOSITORY OVERVIEW */}
          <div className={cn(
             "bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm",
             isPresented && "border-white/10"
          )}>
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                    <Building2 className="w-5 h-5 text-[#1E3A8A]" />
                    <h3 className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-slate-800">
                        Top Performing Clusters :: {schema.name}
                    </h3>
                </div>
                {!isPresented && (
                    <button className="flex items-center gap-2 text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest hover:underline">
                        View Registry <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {schema.defaultData.slice(0, 3).map((row, i) => (
                    <div key={i} className={cn(
                        "group p-8 border rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all",
                        isPresented ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
                    )}>
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Rank 0{i + 1}</span>
                            <div className="p-2 bg-white rounded shadow-sm group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                                <Trophy className="w-4 h-4 text-amber-500 group-hover:text-white" />
                            </div>
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tighter mb-2">
                            {row.branch || row.company || row.factor || row.metric}
                        </h4>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Reached</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* REAL-TIME TRANSACTION LEDGER */}
          <div className={cn(
            "rounded-2xl p-10 shadow-2xl relative overflow-hidden",
            isPresented ? "bg-blue-900/40 border border-white/10" : "bg-slate-900 text-white"
          )}>
                <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-center border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-[14px] font-black uppercase tracking-[0.2em]">Real-Time Transaction Ledger</h3>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-1 bg-white/10 rounded text-[9px] font-bold text-blue-300">
                             <RefreshCw className="w-3 h-3 animate-spin-slow" /> LIVE STREAM ACTIVE
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { event: "CRT ATTENDANCE COMMIT", node: "CSE-A", time: "Just Now", status: "SYNCED" },
                            { event: "PLACEMENT LOG UPDATE", node: "TCS DRIVE", time: "2m ago", status: "VERIFIED" },
                            { event: "ASSESSMENT REGISTRY SYNC", node: "ECE-B", time: "15m ago", status: "SYNCED" },
                            { event: "SYSTEM BOOTSTRAP", node: "CORE v5.0", time: "1h ago", status: "MASTER" }
                        ].map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="text-[10px] font-black text-slate-500 font-mono tracking-tighter">
                                        [{new Date().toLocaleTimeString()}]
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-blue-300">{tx.event}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">NODE :: {tx.node}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{tx.time}</span>
                                    <div className="px-3 py-1 bg-white/10 rounded text-[8px] font-black uppercase tracking-widest border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {tx.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"></div>
          </div>
        </div>
      )}

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
    </div>
  );
}
