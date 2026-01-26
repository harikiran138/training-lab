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
  CheckCircle2,
  FileText,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KpiCard } from './KpiCard';
import { ExpandableTable } from './ExpandableTable';
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[12px] font-bold uppercase tracking-widest text-[#1E3A8A] opacity-60">Initializing Stream...</p>
    </div>
  );

  const columns = [
    { header: 'Branch Code', accessorKey: 'branch_code', className: "font-bold text-[#1E3A8A]" },
    { header: 'Strength', accessorKey: 'total_strength', className: "text-slate-500" },
    { 
        header: 'Avg Attendance %', 
        accessorKey: (row: any) => (
            <div className="flex items-center gap-4">
                <span className={cn(
                    "font-extrabold text-lg",
                    row.weekly_average_percent < 50 ? "text-rose-600" : (row.weekly_average_percent >= 75 ? "text-emerald-600" : "text-amber-500")
                )}>{row.weekly_average_percent}%</span>
                <span className={cn(
                    "text-[10px] font-bold uppercase flex items-center gap-1",
                    row.trend.includes('Improving') ? "text-emerald-500" : (row.trend.includes('Dropping') ? "text-rose-500" : "text-slate-400")
                )}>
                    {row.trend.includes('Improving') ? <ArrowUpRight className="w-3 h-3" /> : (row.trend.includes('Dropping') ? <ArrowDownRight className="w-3 h-3" /> : null)}
                    {row.trend.split(' ')[0]}
                </span>
            </div>
        )
    },
    { 
        header: 'Status', 
        accessorKey: (row: any) => (
            <div className={cn(
                "px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border text-center font-bold",
                row.risk_flag === 'OK' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
            )}>
                {row.risk_flag}
            </div>
        )
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="bg-[#1E3A8A] p-2 rounded text-white shadow-sm">
                <BarChart3 className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight uppercase">
                CRT Attendance <span className="font-light opacity-60">Analytics</span>
             </h2>
          </div>
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-12">
            Weekly Performance Matrix :: Week {weekNumber}
          </p>
        </div>

        <div className="flex items-center gap-4">
             <button 
                onClick={handleExport}
                disabled={exporting || records.length === 0}
                className={cn(
                    "flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-[#1E3A8A] rounded text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm",
                    exporting ? "opacity-50" : "hover:bg-blue-50"
                )}
            >
                <Download className="w-4 h-4" /> 
                {exporting ? 'GENERATING...' : 'EXPORT REPORT'}
            </button>
        </div>
      </div>

      {records.length === 0 ? (
          <div className="p-20 bg-white border border-slate-200 rounded text-center space-y-6 flex flex-col items-center">
              <Database className="w-12 h-12 text-slate-200" />
              <div>
                  <h3 className="text-xl font-bold text-[#1E3A8A] uppercase tracking-wider">No Data Available for Week {weekNumber}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Initialize records in the Data Entry portal to populate this dashboard.</p>
              </div>
          </div>
      ) : (
        <>
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Avg Attendance" value={`${metrics?.avgAttendance}%`} icon={Users} status="success" label="GLOBAL" description="Combined participation across all reporting branches." />
                <KpiCard title="Top Performer" value={`${metrics?.highestBranch.percent}%`} icon={ShieldCheck} label={metrics?.highestBranch.name} description="Highest engagement node in current session." />
                <KpiCard title="Canceled Blocks" value={metrics?.missedSessions || 0} icon={AlertTriangle} status={metrics?.missedSessions && metrics.missedSessions > 0 ? "warning" : "neutral"} label="NO CRT ENTRIES" description="Total session closures detected in the stream." />
                <KpiCard title="Active Flux" value={metrics?.totalSessions || 0} icon={Zap} label="SYCHRONIZED" description="Total verified training segments blocks." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* TABLE SECTION */}
                <div className="lg:col-span-8">
                    <ExpandableTable 
                        title="Departmental Performance Ledger"
                        data={records}
                        columns={columns}
                        rowId={(row) => row.branch_code}
                        expandableContent={(row) => (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Attendance (D1-D6)</h4>
                                    <div className="flex items-end gap-2 h-24">
                                        {[1,2,3,4,5,6].map((dayNo) => {
                                            const attended = row[`day${dayNo}_attended`];
                                            const percent = row[`day${dayNo}_percent`];
                                            return (
                                                <div key={dayNo} className="flex-1 group/bar relative">
                                                    <div className={cn(
                                                        "w-full rounded-sm transition-all duration-300",
                                                        attended === 'No CRT' ? "bg-slate-100 h-2" : "bg-[#1E3A8A]"
                                                    )} 
                                                    style={{ height: attended === 'No CRT' ? '8px' : `${percent}%` }}
                                                    ></div>
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                                                        {percent === 'No CRT' ? 'NO CRT' : `${percent}%`}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                        <span>D1</span><span>D2</span><span>D3</span><span>D4</span><span>D5</span><span>D6</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded border border-slate-100 space-y-4">
                                    <h4 className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest opacity-60">Intelligence Remarks</h4>
                                    <p className="text-[13px] font-medium leading-relaxed text-slate-700 italic border-l-2 border-[#1E3A8A] pl-4">
                                        "{row.remarks}"
                                    </p>
                                </div>
                            </div>
                        )}
                    />
                </div>

                {/* VISUALS SIDEBAR */}
                <div className="lg:col-span-4 space-y-10">
                     <HeatMap 
                        title="Geospatial Hub"
                        data={heatMapData}
                     />

                     <div className="bg-[#1E3A8A] p-8 text-white rounded shadow-md relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-60">Executive Observations</h3>
                            <div className="space-y-6">
                                {records.filter(r => r.risk_flag === '⚠ Critical').length > 0 && (
                                    <div className="flex gap-4">
                                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                                        <p className="text-[12px] font-semibold leading-relaxed">
                                            {records.filter(r => r.risk_flag === '⚠ Critical').length} Branches identified with critical participation deficits.
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <p className="text-[12px] font-semibold leading-relaxed opacity-90">
                                        System-wide compliance verified at {metrics?.avgAttendance}% for Week {weekNumber}.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                     </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
}
