"use client"

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Database, 
  Calendar, 
  Users, 
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchEntry {
  branch: string;
  strength: number;
  d1: number | string;
  d2: number | string;
  d3: number | string;
  d4: number | string;
  d5: number | string;
  d6: number | string;
}

interface Props {
  weekNumber: number;
  initialData?: BranchEntry[];
  onSave: (data: BranchEntry[]) => void;
  onClose: () => void;
}

export default function CompactCrtEntryForm({ weekNumber, initialData, onSave, onClose }: Props) {
  const [data, setData] = useState<BranchEntry[]>(initialData || [
    { branch: 'CSE-A', strength: 71, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0 },
    { branch: 'CSE-B', strength: 70, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0 }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (idx: number, field: keyof BranchEntry, value: any) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    setData(newData);
  };

  const addNewRow = () => {
    setData([...data, { branch: '', strength: 0, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0 }]);
  };

  const removeRow = (idx: number) => {
    setData(data.filter((_, i) => i !== idx));
  };

  const calculateAvg = (row: BranchEntry) => {
    const values = [row.d1, row.d2, row.d3, row.d4, row.d5, row.d6]
      .map(v => typeof v === 'string' ? 0 : v)
      .filter(v => typeof v === 'number');
    const sum = values.reduce((a, b) => a + (b || 0), 0);
    const avg = values.length > 0 ? (sum / (values.length * (row.strength || 1))) * 100 : 0;
    return Math.round(avg);
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* HEADER: COMPACT & FORMAL */}
      <div className="bg-[#1E3A8A] px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-300" />
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-widest leading-none">CRT Attendance Registry</h3>
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-60">Epoch {weekNumber} :: Fixed Entry Port</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* INFO BAR */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Stream connected to institutional repository. Automated parity check active.
          </p>
        </div>

        {/* COMPACT GRID */}
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Branch</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Str</th>
                {['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].map(d => (
                  <th key={d} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{d}</th>
                ))}
                <th className="px-4 py-3 text-[9px] font-black text-[#1E3A8A] uppercase tracking-widest text-center">Avg</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2">
                    <input 
                      type="text" 
                      value={row.branch} 
                      onChange={(e) => handleUpdate(idx, 'branch', e.target.value)}
                      placeholder="BRANCH"
                      className="w-24 bg-transparent text-[12px] font-extrabold text-[#1E3A8A] uppercase outline-none focus:ring-1 focus:ring-blue-100 rounded px-1 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      value={row.strength} 
                      onChange={(e) => handleUpdate(idx, 'strength', parseInt(e.target.value) || 0)}
                      className="w-16 text-center bg-transparent text-[12px] font-bold text-slate-600 outline-none hover:bg-white"
                    />
                  </td>
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <td key={d} className="px-2 py-2">
                      <input 
                        type="text" 
                        value={row[`d${d}` as keyof BranchEntry]} 
                        onChange={(e) => handleUpdate(idx, `d${d}` as keyof BranchEntry, e.target.value)}
                        className="w-12 text-center bg-white border border-slate-100 rounded py-1.5 text-[11px] font-black text-slate-700 outline-none focus:border-[#1E3A8A] focus:ring-0 transition-all shadow-sm"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <div className="text-[12px] font-black text-[#1E3A8A] italic bg-blue-50 rounded py-1">
                      {calculateAvg(row)}%
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeRow(idx)} className="text-slate-200 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
           <button 
             onClick={addNewRow}
             className="flex items-center gap-2 text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded transition-all"
           >
             <Plus className="w-3.5 h-3.5" /> Append Branch
           </button>
           
           <div className="flex gap-4">
              <button onClick={onClose} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
              <button 
                onClick={() => onSave(data)}
                className="flex items-center gap-2 bg-[#1E3A8A] text-white px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-900 active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Commit Stream
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
