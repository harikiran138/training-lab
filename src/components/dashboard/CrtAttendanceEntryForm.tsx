"use client"

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, X, Info, Database, Layers, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, ChevronRight, FileEdit } from 'lucide-react';
import { CrtAttendanceService, BranchAttendanceInput, CalculatedRecord } from '@/services/CrtAttendanceService';
import { cn } from '@/lib/utils';

interface Props {
  initialData: BranchAttendanceInput[];
  onSave: (data: BranchAttendanceInput[]) => void;
  onClose: () => void;
}

export default function CrtAttendanceEntryForm({ initialData, onSave, onClose }: Props) {
  const [data, setData] = useState<BranchAttendanceInput[]>(initialData);

  // Real-time calculation engine
  const calculatedRecords = useMemo(() => {
    return CrtAttendanceService.processData(data);
  }, [data]);

  const handleAddBranch = () => {
    setData([...data, { branch_code: "", strength: 0, daily: Array(6).fill(0) }]);
  };

  const handleRemoveBranch = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleUpdateBranch = (index: number, field: string, value: any) => {
    const newData = [...data];
    if (field === 'branch_code' || field === 'strength') {
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
        daily[dayIndex] = Math.max(0, Math.min(num, strength));
      }
    }
    
    newData[branchIndex] = { ...newData[branchIndex], daily };
    setData(newData);
  };

  const getPercentColor = (percent: number | "No CRT") => {
    if (percent === "No CRT") return "text-slate-300";
    if (percent < 50) return "text-rose-600 font-bold";
    if (percent < 75) return "text-amber-600 font-bold";
    return "text-emerald-700 font-bold";
  };

  return (
    <div className="bg-white rounded overflow-hidden">
      {/* FORM HEADER */}
      <div className="bg-[#1E3A8A] px-8 py-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest leading-none">
              Attendance Registry Matrix
            </h3>
            <p className="text-[10px] text-blue-200 mt-1.5 font-bold uppercase tracking-widest opacity-60">
                Official Operational Stream :: Write-Access Mode
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-8 space-y-10">
        {/* VALIDATION BOX */}
        <div className="bg-blue-50 border-l-4 border-[#1E3A8A] p-5 flex gap-4 items-center">
          <Info className="w-5 h-5 text-[#1E3A8A] shrink-0" />
          <p className="text-[12px] font-bold text-slate-700 leading-none">
            Enter physical attendance counts (0 to capacity). Use <span className="text-[#1E3A8A] font-black underline underline-offset-4">N</span> for session closure. Intelligence fields are read-only.
          </p>
        </div>

        {/* DATA GRID */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-12">#</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[180px]">Branch</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">Cap.</th>
                {[1, 2, 3, 4, 5, 6].map(d => (
                  <th key={d} className="px-3 py-4 text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest text-center bg-blue-50/30 border-l border-slate-100 italic">Day {d}</th>
                ))}
                <th className="px-6 py-4 text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest text-center border-l-2 border-[#1E3A8A]/20 bg-[#1E3A8A]/5 w-40">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculatedRecords.map((rec, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-300">0{i + 1}</td>
                  <td className="px-6 py-5">
                    <input 
                      type="text" 
                      value={rec.branch_code}
                      onChange={(e) => handleUpdateBranch(i, 'branch_code', e.target.value.toUpperCase())}
                      placeholder="BRANCH CODE"
                      className="w-full bg-white border border-slate-200 px-3 py-2 text-[13px] font-bold text-[#1E3A8A] focus:border-[#1E3A8A] rounded transition-all shadow-sm uppercase placeholder:opacity-20"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <input 
                      type="number" 
                      value={rec.total_strength || ""}
                      onChange={(e) => handleUpdateBranch(i, 'strength', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 px-3 py-2 text-[13px] font-bold text-[#1E3A8A] text-center focus:border-[#1E3A8A] rounded transition-all shadow-sm"
                    />
                  </td>
                  
                  {rec.days.attended.map((att, dIdx) => (
                    <td key={dIdx} className="px-2 py-5 border-l border-slate-50">
                      <div className="flex flex-col items-center gap-1.5">
                        <input 
                            type="text" 
                            value={att === "No CRT" ? "N" : att}
                            onChange={(e) => handleUpdateDaily(i, dIdx, e.target.value)}
                            className={cn(
                            "w-10 h-10 border border-slate-200 text-[12px] font-bold text-center transition-all rounded shadow-sm",
                            att === "No CRT" 
                                ? "bg-slate-50 text-slate-300" 
                                : "bg-white text-slate-900 focus:border-[#1E3A8A]"
                            )}
                        />
                        <span className={cn("text-[9px] font-bold", getPercentColor(rec.days.percent[dIdx]))}>
                            {rec.days.percent[dIdx] === "No CRT" ? "–" : `${rec.days.percent[dIdx]}%`}
                        </span>
                      </div>
                    </td>
                  ))}

                  <td className="px-6 py-5 bg-[#1E3A8A]/5 border-l-2 border-[#1E3A8A]/20">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Weekly Avg</span>
                            <span className={cn("text-lg font-black italic", getPercentColor(rec.weekly_average_percent))}>
                                {rec.weekly_average_percent}%
                            </span>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-center border",
                            rec.risk_flag === 'GREEN' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                        )}>
                            {rec.risk_flag}
                        </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-100">
          <button 
            onClick={handleAddBranch}
            className="flex items-center gap-3 text-[#1E3A8A] font-bold text-[11px] uppercase tracking-widest px-6 py-3 bg-white border border-[#1E3A8A]/20 rounded hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Append Branch Ledger
          </button>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(data)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-[#1E3A8A] text-white px-10 py-3 text-[11px] font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-100 hover:bg-blue-900 transition-all"
            >
              <Save className="w-4 h-4" />
              Commit To Repository
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
