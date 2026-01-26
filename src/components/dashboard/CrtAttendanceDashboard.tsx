"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Download, 
  Filter, 
  Calendar,
  Database,
  ShieldCheck,
  Zap,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KpiCard } from './KpiCard';
import { ExpandableTable } from './ExpandableTable';
import { TrendChart } from './TrendChart';
import { HeatMap } from './HeatMap';

export default function CrtAttendanceDashboard() {
  const [records, setRecords] = useState<any[]>([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/crt/records?week_number=${weekNumber}`);
        const data = await res.json();
        setRecords(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [weekNumber]);

  const handleExport = async () => {
    setExporting(true);
    try {
        window.location.href = `/api/crt/export?week_number=${weekNumber}`;
        setTimeout(() => setExporting(false), 2000);
    } catch (err) {
        console.error(err);
        setExporting(false);
    }
  };

  const metrics = useMemo(() => {
    if (records.length === 0) return null;
    
    const avgAttendance = Math.round(records.reduce((acc, r) => acc + r.weekly_average_percent, 0) / records.length);
    const sorted = [...records].sort((a, b) => b.weekly_average_percent - a.weekly_average_percent);
    
    return {
      avgAttendance,
      highestBranch: { name: sorted[0]?.branch_code, percent: sorted[0]?.weekly_average_percent },
      totalSessions: records.reduce((acc, r) => acc + (6 - r.no_crt_days), 0),
      missedSessions: records.reduce((acc, r) => acc + r.no_crt_days, 0)
    };
  }, [records]);

  const heatMapData = useMemo(() => {
    return records.map(r => ({
      id: r.branch_code,
      label: r.branch_code,
      value: r.weekly_average_percent,
      secondaryValue: r.total_strength
    })).sort((a, b) => b.value - a.value);
  }, [records]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-pulse text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-100"></div>
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">Synchronizing Intelligence Flow...</p>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic mt-2">Connecting to Secure Repository v5.0</p>
      </div>
    </div>
  );

  const columns = [
    { header: 'Branch Identifier', accessorKey: 'branch_code', sortable: true, className: "font-black italic text-blue-900 uppercase text-lg" },
    { header: 'Capacity', accessorKey: 'total_strength', sortable: true, className: "font-bold text-slate-400" },
    { 
        header: 'Weekly Avg', 
        accessorKey: (row: any) => (
            <div className="flex items-center gap-4">
                <span className={cn(
                    "font-black text-2xl italic",
                    row.weekly_average_percent < 50 ? "text-rose-600" : (row.weekly_average_percent >= 75 ? "text-emerald-600" : "text-amber-500")
                )}>{row.weekly_average_percent}%</span>
                <span className={cn(
                    "text-[10px] font-black uppercase flex items-center gap-1",
                    row.trend.includes('Improving') ? "text-emerald-500" : (row.trend.includes('Dropping') ? "text-rose-500" : "text-slate-400")
                )}>
                    {row.trend.includes('Improving') ? <ArrowUpRight className="w-3.5 h-3.5" /> : (row.trend.includes('Dropping') ? <ArrowDownRight className="w-3.5 h-3.5" /> : null)}
                    {row.trend.split(' ')[0]}
                </span>
            </div>
        ), 
        sortable: true 
    },
    { 
        header: 'Risk Profile', 
        accessorKey: (row: any) => (
            <div className={cn(
                "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border text-center shadow-sm",
                row.risk_flag === 'OK' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100 animate-pulse font-black"
            )}>
                {row.risk_flag}
            </div>
        )
    }
  ];

  return (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 border-b border-slate-100 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-8">
             <div className="bg-blue-600 p-5 rounded-[1.8rem] shadow-2xl shadow-blue-500/20">
                <Layers className="w-10 h-10 text-white" />
             </div>
             <div>
                <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none animate-in slide-in-from-left-8 duration-700">
                Performance <span className="text-blue-600">Hub</span>
                </h2>
                <div className="flex items-center gap-4 mt-6">
                    <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
                    <p className="text-blue-500 font-black text-[11px] uppercase tracking-[0.4em] opacity-60">
                        Institutional Intelligence Matrix :: Secure Stream
                    </p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
             <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-2xl shadow-blue-100/10">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                    <Calendar className="w-6 h-6" />
                </div>
                <div className="pr-10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Temporal Scope</span>
                    <select 
                        value={weekNumber}
                        onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                        className="bg-transparent border-none focus:ring-0 font-black text-blue-900 uppercase italic tracking-tighter text-2xl p-0 cursor-pointer"
                    >
                        {[1,2,3,4,5,6,7,8,9,10].map(w => (
                            <option key={w} value={w}>Reporting Week {w}</option>
                        ))}
                    </select>
                </div>
             </div>
             
             <div className="flex gap-4">
                <button 
                    onClick={handleExport}
                    disabled={exporting || records.length === 0}
                    className={cn(
                        "flex items-center gap-3 px-10 py-5 bg-white border border-slate-100 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-100/50",
                        exporting ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 hover:text-blue-600"
                    )}
                >
                    <Download className={cn("w-5 h-5", exporting ? "animate-bounce" : "")} /> 
                    {exporting ? 'GENERATING...' : 'EXPORT EXCEL'}
                </button>
             </div>
        </div>
      </section>

      {records.length === 0 ? (
          <div className="p-24 bg-white border border-slate-100 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 text-center space-y-8 flex flex-col items-center">
              <Database className="w-20 h-20 text-slate-100" />
              <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-300">Repository Offline for Week {weekNumber}</h3>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-4 max-w-lg mx-auto">Access the Data Entry gateway to initialize institutional performance vectors for this temporal scope.</p>
              </div>
          </div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <KpiCard title="Consolidated Average" value={`${metrics?.avgAttendance}%`} icon={Users} status="success" label="INSTITUTIONAL" description="Global attendance average across all branches for the selected week." />
                <KpiCard title="Elite Cluster" value={`${metrics?.highestBranch.percent}%`} icon={ShieldCheck} label={metrics?.highestBranch.name} description="The highest performing node based on participation precision." />
                <KpiCard title="Attrition Vectors" value={metrics?.missedSessions || 0} icon={AlertTriangle} status={metrics?.missedSessions && metrics.missedSessions > 0 ? "danger" : "neutral"} label="MISSED SESSIONS" description="Total number of 'No CRT' blocks detected in the stream." />
                <KpiCard title="Stream Integrity" value={metrics?.totalSessions || 0} icon={Zap} label="REAL-TIME FEED" description="Total verified training session blocks synchronized for this week." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8">
                    <ExpandableTable 
                        title="Node Performance Registry"
                        data={records}
                        columns={columns}
                        rowId={(row) => row.branch_code}
                        expandableContent={(row) => (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-4">
                                <div className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-blue-50 shadow-inner">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] italic">Session Timeline :: Vectors D1–D6</h4>
                                    <div className="grid grid-cols-6 gap-3">
                                        {[1,2,3,4,5,6].map((dayNo) => {
                                            const attended = row[`day${dayNo}_attended`];
                                            const percent = row[`day${dayNo}_percent`];
                                            return (
                                                <div key={dayNo} className="flex flex-col items-center gap-4">
                                                    <div className={cn(
                                                        "w-full h-24 rounded-2xl flex items-end p-1.5 border border-slate-50 transition-all group/bar shadow-sm",
                                                        attended === 'No CRT' ? "bg-slate-50/50" : "bg-blue-50/30"
                                                    )}>
                                                        {typeof percent === 'number' && (
                                                            <div className={cn("w-full rounded-xl shadow-lg transition-all duration-700", percent < 50 ? "bg-rose-500 shadow-rose-200" : (percent >= 75 ? "bg-emerald-500 shadow-emerald-200" : "bg-blue-600 shadow-blue-200"))} style={{ height: `${percent}%` }}></div>
                                                        )}
                                                        {attended === 'No CRT' && (
                                                            <div className="w-full h-full flex items-center justify-center opacity-10 rotate-90 scale-75">
                                                                <Zap className="w-6 h-6 text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">D{dayNo}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8 opacity-60">Intelligence Remarks</h4>
                                            <p className="text-xl font-bold italic tracking-tight leading-relaxed text-blue-50 italic opacity-90 mb-10 border-l border-blue-600 pl-8 capitalize">
                                                "{row.remarks}"
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Node ID: {row.branch_code}</p>
                                            </div>
                                        </div>
                                        <Activity className="absolute -bottom-12 -right-12 w-48 h-48 opacity-5 text-white group-hover:scale-110 transition-transform duration-1000" />
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </div>

                <div className="lg:col-span-4 space-y-12">
                     <div className="bg-white p-12 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-blue-100/10">
                        <div className="flex items-center gap-6 mb-16">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200/50">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 italic">Regional Analytics</h3>
                        </div>
                        <div className="h-[400px]">
                            <HeatMap title="" data={heatMapData} />
                        </div>
                     </div>

                     <div className="bg-slate-900 p-12 lg:p-14 rounded-[3.5rem] text-white shadow-2xl shadow-blue-500/10 relative overflow-hidden">
                        <div className="relative z-10 text-center py-10">
                            <ShieldCheck className="w-16 h-16 text-blue-400 mx-auto mb-8 opacity-40" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400 mb-6 italic opacity-60">System Observations</h3>
                            <p className="text-sm font-bold text-blue-200 italic opacity-80 leading-relaxed px-8">
                                Weekly participation targets matched at {metrics?.avgAttendance}%. No significant attrition risks detected in the active feed.
                            </p>
                        </div>
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
                     </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
}
