"use client"

import React, { useState } from 'react';
import { 
  Save, 
  X, 
  Trophy, 
  Building2, 
  Target,
  ShieldCheck,
  Plus,
  Trash2,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlacementEntry {
  branch: string;
  students: number;
  enrolled: number;
  offers: number;
  placed: number;
  drives: number;
  max_ctc: number;
}

interface Props {
  initialData?: PlacementEntry[];
  onSave: (data: PlacementEntry[]) => void;
  onClose: () => void;
}

export default function CompactPlacementEntryForm({ initialData, onSave, onClose }: Props) {
  const [data, setData] = useState<PlacementEntry[]>(initialData || [
    { branch: 'CSE', students: 180, enrolled: 175, offers: 210, placed: 165, drives: 42, max_ctc: 12.5 },
    { branch: 'ECE', students: 140, enrolled: 130, offers: 115, placed: 98, drives: 35, max_ctc: 8.2 }
  ]);

  const handleUpdate = (idx: number, field: keyof PlacementEntry, value: any) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    setData(newData);
  };

  const addNewRow = () => {
    setData([...data, { branch: '', students: 0, enrolled: 0, offers: 0, placed: 0, drives: 0, max_ctc: 0 }]);
  };

  const removeRow = (idx: number) => {
    setData(data.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* HEADER */}
      <div className="bg-[#1E3A8A] px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-widest leading-none">Placement Summary Ledger</h3>
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-60">Yearly Performance :: Institutional Commit</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Institutional placement stream verified. Zero-latency sync enabled.
          </p>
        </div>

        <div className="border border-slate-100 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-[#F8FAFC] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Dept</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Total</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Enrolled</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Offers</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Placed</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Drives</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Max CTC</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#1E3A8A] uppercase tracking-widest text-center">%</th>
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
                      className="w-20 bg-transparent text-[12px] font-black text-[#1E3A8A] uppercase outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      value={row.students} 
                      onChange={(e) => handleUpdate(idx, 'students', parseInt(e.target.value) || 0)}
                      className="w-16 text-center bg-transparent text-[12px] font-bold text-slate-600 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input type="number" value={row.enrolled} onChange={(e) => handleUpdate(idx, 'enrolled', parseInt(e.target.value) || 0)} className="w-12 text-center border-b border-slate-100 py-1 text-[11px] font-bold outline-none" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input type="number" value={row.offers} onChange={(e) => handleUpdate(idx, 'offers', parseInt(e.target.value) || 0)} className="w-12 text-center border-b border-slate-100 py-1 text-[11px] font-bold outline-none" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input type="number" value={row.placed} onChange={(e) => handleUpdate(idx, 'placed', parseInt(e.target.value) || 0)} className="w-12 text-center border-b border-slate-100 py-1 text-[11px] font-bold outline-none font-black text-[#1E3A8A]" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input type="number" value={row.drives} onChange={(e) => handleUpdate(idx, 'drives', parseInt(e.target.value) || 0)} className="w-12 text-center border-b border-slate-100 py-1 text-[11px] font-bold outline-none" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input type="number" step="0.1" value={row.max_ctc} onChange={(e) => handleUpdate(idx, 'max_ctc', parseFloat(e.target.value) || 0)} className="w-16 text-center border-b border-slate-100 py-1 text-[11px] font-black text-amber-600 outline-none" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="text-[11px] font-black text-emerald-600">
                      {row.enrolled > 0 ? Math.round((row.placed / row.enrolled) * 100) : 0}%
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeRow(idx)} className="text-slate-200 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
           <button onClick={addNewRow} className="flex items-center gap-2 text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded transition-all">
             <Plus className="w-3.5 h-3.5" /> ADD DEPARTMENT
           </button>
           
           <div className="flex gap-4">
              <button onClick={onClose} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">CANCEL</button>
              <button onClick={() => onSave(data)} className="flex items-center gap-2 bg-[#1E3A8A] text-white px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-900 transition-all">
                <Database className="w-3.5 h-3.5" /> COMMIT YEARLY DATA
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
