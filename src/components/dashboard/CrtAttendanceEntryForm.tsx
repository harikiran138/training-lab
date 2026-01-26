"use client"

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, X, Info, Database, Layers, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CrtAttendanceService, BranchAttendance, CalculatedRecord } from '@/services/CrtAttendanceService';
import { cn } from '@/lib/utils';

interface Props {
  initialData: BranchAttendance[];
  onSave: (data: BranchAttendance[]) => void;
  onClose: () => void;
}

export default function CrtAttendanceEntryForm({ initialData, onSave, onClose }: Props) {
  const [data, setData] = useState<BranchAttendance[]>(initialData);

  // Real-time calculation engine
  const calculatedRecords = useMemo(() => {
    return CrtAttendanceService.processData(data);
  }, [data]);

  const handleAddBranch = () => {
    setData([...data, { branch: "", strength: 0, daily: Array(6).fill(0) }]);
  };

  const handleRemoveBranch = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleUpdateBranch = (index: number, field: string, value: any) => {
    const newData = [...data];
    if (field === 'branch' || field === 'strength') {
      newData[index] = { ...newData[index], [field]: value };
    }
    setData(newData);
  };

  const handleUpdateDaily = (branchIndex: number, dayIndex: number, value: string) => {
    const newData = [...data];
    const daily = [...newData[branchIndex].daily];
    const strength = newData[branchIndex].strength || 1;
    
    if (value.toLowerCase() === 'n' || value.toLowerCase() === 'no') {
      daily[dayIndex] = "No CRT";
    } else {
      const num = parseInt(value);
      if (isNaN(num)) {
        daily[dayIndex] = 0;
      } else {
        // Data Validation Rule: 0 <= count <= Total Strength
        daily[dayIndex] = Math.max(0, Math.min(num, strength));
      }
    }
    
    newData[branchIndex] = { ...newData[branchIndex], daily };
    setData(newData);
  };

  // Color Coding Logic (Part 4 of Master Prompt)
  const getPercentColor = (percent: number | "No CRT") => {
    if (percent === "No CRT") return "text-slate-300";
    if (percent < 50) return "text-rose-600 font-black";
    if (percent < 75) return "text-amber-500 font-black";
    return "text-emerald-600 font-black";
  };

  const getRiskColor = (risk: string) => {
      return risk === '⚠ Critical' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200';
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* HEADER */}
      <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
        <div className="flex items-center gap-8 relative z-10">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic">
              Attendance Intelligence <span className="text-blue-400">Master</span>
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 flex items-center gap-3">
              <Layers className="w-4 h-4 text-blue-500" />
              Operational Registry :: Excel-Synchronized Workflow
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all relative z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="p-12 space-y-12">
        {/* INFO BOX */}
        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 flex gap-6 items-center">
          <Info className="w-8 h-8 text-blue-600 shrink-0" />
          <div>
            <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-1">DATA VALIDATION PROTOCOL</p>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Numeric entry for student counts (0 to Capacity). Use <span className="bg-blue-600 text-white px-3 py-1 rounded-lg italic">N</span> for session cancellation. 
              <span className="hidden xl:inline ml-2 text-blue-400">Calculated metrics (Avg, Trend, Risk) update in real-time.</span>
            </p>
          </div>
        </div>

        {/* MASTER TABLE */}
        <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100 italic">
                <th className="px-8 py-8 w-16 text-center">S.No</th>
                <th className="px-8 py-8 min-w-[200px]">Branch Identifier</th>
                <th className="px-8 py-8 text-center min-w-[120px]">Capacity</th>
                {[1, 2, 3, 4, 5, 6].map(d => (
                  <th key={d} className="px-4 py-8 text-center border-l border-slate-50 text-blue-800 bg-blue-50/20">Day {d}</th>
                ))}
                <th className="px-8 py-8 text-center bg-slate-900 text-white rounded-t-3xl mx-2">Intelligence Matrix</th>
                <th className="px-8 py-8 text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {calculatedRecords.map((rec, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-8 text-center font-black text-slate-300">0{i + 1}</td>
                  <td className="px-8 py-8">
                    <input 
                      type="text" 
                      value={rec.branch_code}
                      onChange={(e) => handleUpdateBranch(i, 'branch', e.target.value.toUpperCase())}
                      placeholder="e.g. CSE-A"
                      className="w-full bg-white border border-slate-200 px-5 py-4 text-base font-black text-blue-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all rounded-2xl shadow-sm"
                    />
                  </td>
                  <td className="px-8 py-8">
                    <input 
                      type="number" 
                      value={rec.total_strength || ""}
                      onChange={(e) => handleUpdateBranch(i, 'strength', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 px-5 py-4 text-base font-black text-blue-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all text-center rounded-2xl shadow-sm"
                    />
                  </td>
                  
                  {/* Daily Input Cells */}
                  {rec.days.attended.map((att, dIdx) => (
                    <td key={dIdx} className="px-2 py-8 border-l border-slate-50">
                      <div className="flex flex-col items-center gap-3">
                        <input 
                            type="text" 
                            value={att === "No CRT" ? "N" : att}
                            onChange={(e) => handleUpdateDaily(i, dIdx, e.target.value)}
                            className={cn(
                            "w-12 h-12 border-2 text-sm font-black text-center transition-all bg-white rounded-xl shadow-sm",
                            att === "No CRT" 
                                ? "border-slate-100 bg-slate-50 text-slate-300 italic" 
                                : "border-slate-100 text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                            )}
                        />
                        <span className={cn("text-[10px] uppercase font-black", getPercentColor(rec.days.percent[dIdx]))}>
                            {rec.days.percent[dIdx] === "No CRT" ? "–" : `${rec.days.percent[dIdx]}%`}
                        </span>
                      </div>
                    </td>
                  ))}

                  {/* Intelligence Column (Part 1.S, T, U) */}
                  <td className="px-8 py-8 bg-slate-900/5 border-x-2 border-slate-900/10">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center gap-10">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Weekly Avg</span>
                                <span className={cn("text-2xl font-black italic", getPercentColor(rec.weekly_average_percent))}>
                                    {rec.weekly_average_percent}%
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Trend</span>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm bg-white",
                                    rec.trend.includes('Improving') ? "text-emerald-500 border-emerald-100" : (rec.trend.includes('Dropping') ? "text-rose-500 border-rose-100" : "text-slate-400 border-slate-100")
                                )}>
                                    {rec.trend.includes('Improving') ? <ArrowUpRight className="w-3.5 h-3.5" /> : (rec.trend.includes('Dropping') ? <ArrowDownRight className="w-3.5 h-3.5" /> : null)}
                                    {rec.trend.split(' ')[0]}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className={cn(
                                "flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2",
                                getRiskColor(rec.risk_flag)
                            )}>
                                {rec.risk_flag === '⚠ Critical' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                {rec.risk_flag}
                            </div>
                            <div className="flex-1 bg-white border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-center text-slate-500 italic shadow-sm">
                                {rec.performance_level}
                            </div>
                        </div>
                        
                        <p className="text-[10px] font-bold italic text-slate-400 border-t border-slate-200/50 pt-3 leading-tight">
                            {rec.remarks}
                        </p>
                    </div>
                  </td>

                  <td className="px-8 py-8 text-right">
                    <button 
                      onClick={() => handleRemoveBranch(i)}
                      className="p-4 text-slate-200 hover:text-rose-600 bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-10 border-t border-slate-100">
          <button 
            onClick={handleAddBranch}
            className="group flex items-center gap-4 text-blue-700 font-bold text-xs uppercase tracking-[0.2em] px-10 py-5 bg-white border border-blue-200 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-50"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            Append Branch Record
          </button>
          
          <div className="flex gap-6 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="px-10 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              Discard Changes
            </button>
            <button 
              onClick={() => onSave(data)}
              className="flex-1 md:flex-none flex items-center justify-center gap-4 bg-blue-600 text-white px-16 py-5 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-6 h-6" />
              Commit Intelligence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
