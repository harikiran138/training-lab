"use client"

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  Users,
  Laptop,
  GraduationCap,
  CheckCircle2,
=======
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Laptop, 
  GraduationCap, 
  CheckCircle2,
  TrendingUp,
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
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
import DataHealthCard from '@/components/dashboard/DataHealthCard';
import { ExpandableTable } from '@/components/dashboard/ExpandableTable';
import { cn } from '@/lib/utils';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { LiveAnalytics } from '@/components/dashboard/LiveAnalytics';

import { INSTITUTIONAL_SCHEMAS } from '@/config/SchemaManager';

export default function OverviewPage() {
  const [activeDomain, setActiveDomain] = useState('crt_attendance');
  const [view, setView] = useState<'standard' | 'analytics'>('standard');
  const [isPresented, setIsPresented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [realData, setRealData] = useState<any[] | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
<<<<<<< HEAD
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
=======
    setCurrentTime(new Date().toLocaleTimeString());
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
  }, []);

  const schema = INSTITUTIONAL_SCHEMAS[activeDomain];

<<<<<<< HEAD
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
=======
  // Fetch Real Data for CRT Attendance
  useEffect(() => {
    if (activeDomain === 'crt_attendance') {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/crt/records?week_number=1'); // Defaulting to week 1 for demo
                const data = await res.json();
                
                // Transform API Key structure to Schema Key structure
                // API keys: branch_code, daily_stats (for days), total_strength, attendance_percentage
                // Schema keys: branch, strength, d1..d6
                const transformed = data.map((r: any) => ({
                    branch: r.branch_code,
                    strength: r.total_strength,
                    d1: r.daily_stats?.[0]?.attended || 0,
                    d2: r.daily_stats?.[1]?.attended || 0,
                    d3: r.daily_stats?.[2]?.attended || 0,
                    d4: r.daily_stats?.[3]?.attended || 0,
                    d5: r.daily_stats?.[4]?.attended || 0,
                    d6: r.daily_stats?.[5]?.attended || 0,
                    avg: r.attendance_percentage // Optionally override calculation if API provides it
                }));
                
                setRealData(transformed);
            } catch (err) {
                console.error("Failed to fetch CRT data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    } else {
        setRealData(null);
    }
  }, [activeDomain]);

  const activeData = realData || schema.defaultData;

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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
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
<<<<<<< HEAD
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
=======
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

          {/* MASTER DATA HEALTH & REPOSITORY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DataHealthCard />
              
              <div className={cn(
                "bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm",
                isPresented && "border-white/10"
              )}>
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <Building2 className="w-5 h-5 text-[#1E3A8A]" />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E3A8A]">
                            Top Cluster :: {schema.name}
                        </h3>
                    </div>
                </div>
                
                <div className="p-8 flex items-center justify-center h-full">
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        Select a domain to view granular cluster performance.
                     </p>
                </div>
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
                                    <div className="text-[10px] font-black text-slate-500 font-mono tracking-tighter w-20">
                                        [{currentTime || "..."}]
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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* LiveAnalytics for real-time insights */}
      <LiveAnalytics initialData={{
        weeklyTrendData: data.weeklyTrendData,
        branchComparisonData: data.summaries,
        departmentSummaryData: [], // Add required property
        stats: data.stats
      }} />
=======
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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
    </div>
  );
}
