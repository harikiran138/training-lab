"use client"

import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Info, Database, Layers } from 'lucide-react';
import { BranchAttendance } from '@/services/CrtAttendanceService';
import { cn } from '@/lib/utils';

interface Props {
  initialData: BranchAttendance[];
  onSave: (data: BranchAttendance[]) => void;
  onClose: () => void;
}

export default function CrtAttendanceEntryForm({ initialData, onSave, onClose }: Props) {
  const [data, setData] = useState<BranchAttendance[]>(initialData);

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
    
    if (value.toLowerCase() === 'n' || value.toLowerCase() === 'no') {
      daily[dayIndex] = "No CRT";
    } else {
      const num = parseInt(value);
      daily[dayIndex] = isNaN(num) ? 0 : num;
    }
    
    newData[branchIndex] = { ...newData[branchIndex], daily };
    setData(newData);
  };

  return (
    <div className="bg-white rounded-none border-2 border-slate-900 shadow-[20px_20px_0px_0px_rgba(30,64,175,1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-blue-800 p-8 text-white border-b-4 border-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="bg-white text-blue-800 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">
              Attendance Records <span className="text-blue-200">v3.0</span>
            </h3>
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Institutional Administrative Grid :: Read/Write Mode
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 bg-slate-900 hover:bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-10 space-y-10">
        <div className="bg-blue-50/50 p-6 border-l-8 border-blue-600 flex gap-4 items-center">
          <Info className="w-6 h-6 text-blue-700 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Entry Protocol</p>
            <p className="text-sm font-bold text-slate-700">
              Numeric entry for student counts. Use <span className="bg-blue-700 text-white px-2 py-0.5 rounded whitespace-nowrap">'N'</span> for session cancellation / No CRT status.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border-2 border-slate-100 p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b-2 border-slate-100">
                <th className="px-6 py-5">Branch Identifier</th>
                <th className="px-6 py-5 text-center">Base Strength</th>
                {[1, 2, 3, 4, 5, 6].map(d => (
                  <th key={d} className="px-3 py-5 text-center border-l border-slate-100">Day {d}</th>
                ))}
                <th className="px-6 py-5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((b, bIdx) => (
                <tr key={bIdx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <input 
                      type="text" 
                      value={b.branch}
                      onChange={(e) => handleUpdateBranch(bIdx, 'branch', e.target.value.toUpperCase())}
                      placeholder="e.g. CSE-A"
                      className="w-full bg-white border-2 border-slate-200 px-4 py-3 text-sm font-black text-blue-900 focus:border-blue-600 focus:ring-0 transition-all placeholder:text-slate-300 rounded-none shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <input 
                      type="number" 
                      value={b.strength || ""}
                      onChange={(e) => handleUpdateBranch(bIdx, 'strength', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-24 bg-white border-2 border-slate-200 px-4 py-3 text-sm font-black text-blue-900 focus:border-blue-600 focus:ring-0 transition-all text-center rounded-none shadow-sm"
                    />
                  </td>
                  {b.daily.map((day, dIdx) => (
                    <td key={dIdx} className="px-2 py-5 border-l border-slate-50">
                      <input 
                        type="text" 
                        value={day === "No CRT" ? "N" : day}
                        onChange={(e) => handleUpdateDaily(bIdx, dIdx, e.target.value)}
                        className={cn(
                          "w-12 h-12 border-2 text-xs font-black text-center transition-all bg-white rounded-none shadow-sm",
                          day === "No CRT" 
                            ? "border-blue-700 bg-blue-50 text-blue-700" 
                            : "border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-0"
                        )}
                      />
                    </td>
                  ))}
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleRemoveBranch(bIdx)}
                      className="p-3 text-slate-300 hover:text-white hover:bg-red-600 border-2 border-transparent hover:border-slate-900 transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t-2 border-slate-100">
          <button 
            onClick={handleAddBranch}
            className="flex items-center gap-3 text-blue-700 font-black text-sm uppercase tracking-[0.2em] px-8 py-4 border-2 border-blue-700 hover:bg-blue-700 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(30,64,175,0.1)] hover:shadow-none translate-y-0 active:translate-x-1 active:translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Append New Branch
          </button>
          
          <div className="flex gap-6 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              Abort Entry
            </button>
            <button 
              onClick={() => onSave(data)}
              className="flex-1 md:flex-none flex items-center justify-center gap-4 bg-blue-700 text-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:bg-blue-800 transition-all active:translate-x-1 active:translate-y-1"
            >
              <Save className="w-5 h-5" />
              Commit Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
