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
  Trash2,
  RefreshCw,
  Lock,
  Unlock
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
  onSave: (data: BranchEntry[], isLocked: boolean) => void;
  onClose: () => void;
}

export default function CompactCrtEntryForm({ weekNumber, initialData, onSave, onClose }: Props) {
  const [data, setData] = useState<BranchEntry[]>(initialData || [
    { branch: 'CSE-A', strength: 71, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0 },
    { branch: 'CSE-B', strength: 70, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0 }
  ]);
  const [locked, setLocked] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const handleUpdate = (idx: number, field: keyof BranchEntry, value: any) => {
    if (locked) return;
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    setData(newData);
  };

  const addNewRow = () => {
    if (locked) return;
    setData([...data, { branch: '', strength: 0, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0 }]);
  };

  const handleBulkImport = () => {
    if (locked) return;
    const lines = bulkText.split('\n').filter(l => l.trim());
    const newEntries: BranchEntry[] = lines.map(line => {
      const parts = line.split(/[,\t]/);
      return {
        branch: (parts[0] || '').trim().toUpperCase(),
        strength: parseInt(parts[1]) || 0,
        d1: parts[2] || 0,
        d2: parts[3] || 0,
        d3: parts[4] || 0,
        d4: parts[5] || 0,
        d5: parts[6] || 0,
        d6: parts[7] || 0
      };
    });
    setData([...data, ...newEntries]);
    setShowBulk(false);
    setBulkText("");
  };

  const clonePreviousWeek = async () => {
    if (locked) return;
    try {
      const res = await fetch(`/api/crt/records?week_number=${weekNumber - 1}`);
      const records = await res.json();
      if (records && records.length > 0) {
        const cloned = records.map((r: any) => ({
          branch: r.branch_code,
          strength: r.total_strength,
          d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0
        }));
        setData(cloned);
        alert(`Master Schema from Week ${weekNumber - 1} synchronized.`);
      } else {
        alert("No previous epoch data found to replicate.");
      }
    } catch (e) {
      alert("Synchronization failure.");
    }
  };

  const removeRow = (idx: number) => {
    if (locked) return;
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

  // Keyboard Navigation: Use IDs cell-{row}-{col}
  // Cols: 0=Branch, 1=Strength, 2..7=D1..D6
  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let nextR = r;
      let nextC = c;
      if (e.key === 'ArrowUp') nextR = Math.max(0, r - 1);
      if (e.key === 'ArrowDown') nextR = Math.min(data.length - 1, r + 1);
      if (e.key === 'ArrowLeft') nextC = Math.max(0, c - 1);
      if (e.key === 'ArrowRight') nextC = Math.min(7, c + 1);

      const el = document.getElementById(`cell-${nextR}-${nextC}`);
      if (el) el.focus();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* HEADER */}
      <div className="bg-[#1E3A8A] px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-300" />
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-widest leading-none">CRT Attendance Registry</h3>
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-60">Epoch {weekNumber} :: Fixed Entry Port</p>
          </div>
        </div>
        <div className="flex gap-2">
            {!locked && (
                <button 
                    onClick={clonePreviousWeek}
                    title="Clone Master Schema from Previous Week"
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-[9px] font-black uppercase flex items-center gap-2 transition-all"
                >
                    <RefreshCw className="w-3 h-3" /> Sync Prev.
                </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* BULK OVERLAY */}
        {showBulk && (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-300 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest">Bulk Import (Excel/TSV)</h4>
            <textarea 
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Branch	Strength	D1	D2	D3	D4	D5	D6 (Tab separated)"
              className="w-full h-32 bg-white border border-slate-200 p-4 rounded text-[12px] font-mono outline-none focus:border-[#1E3A8A]"
            />
            <div className="flex gap-4">
              <button 
                onClick={handleBulkImport}
                className="bg-[#1E3A8A] text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest"
              >
                PROCEED IMPORT
              </button>
              <button onClick={() => setShowBulk(false)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CANCEL</button>
            </div>
          </div>
        )}

        {/* CONTROLS BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
           {/* LOCK TOGGLE */}
           <div className="flex items-center gap-2">
             <button
               onClick={() => setLocked(!locked)}
               className={cn(
                 "flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                 locked 
                   ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                   : "bg-slate-200 text-slate-600 hover:bg-slate-300"
               )}
             >
               {locked ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>}
               {locked ? "Records Locked" : "Draft Mode"}
             </button>
             {locked && <span className="text-[9px] text-emerald-600 font-bold uppercase">Ready for Final Commit</span>}
           </div>

           {!locked && (
             <button 
                onClick={() => setShowBulk(true)}
                className="flex items-center gap-2 text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest hover:underline px-2"
              >
                <Plus className="w-3.5 h-3.5" /> Bulk Add (Excel)
             </button>
           )}
        </div>

        {/* EXCEL GRID */}
        <div className={cn(
            "border rounded-lg overflow-hidden transition-all",
            locked ? "border-emerald-100 ring-2 ring-emerald-50" : "border-slate-200"
        )}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F1F5F9] border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-slate-200">Branch</th>
                <th className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest w-16 text-center border-r border-slate-200">Total</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <th key={d} className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center border-r border-slate-200 w-16">
                    {d} <span className="text-slate-300">D{i+1}</span>
                  </th>
                ))}
                <th className="px-3 py-2 text-[9px] font-black text-[#1E3A8A] uppercase tracking-widest text-center w-20">Avg %</th>
                {!locked && <th className="w-8"></th>}
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  {/* Branch */}
                  <td className="p-0 border-r border-slate-100 border-b border-slate-100">
                    <input 
                      id={`cell-${idx}-0`}
                      type="text" 
                      value={row.branch} 
                      onChange={(e) => handleUpdate(idx, 'branch', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, 0)}
                      disabled={locked}
                      placeholder="BRANCH"
                      className="w-full h-full px-3 py-2.5 bg-transparent text-[11px] font-bold text-[#1E3A8A] uppercase outline-none focus:bg-blue-50/50 focus:ring-2 focus:ring-inset focus:ring-blue-500/20 transition-all disabled:text-slate-500 disabled:bg-slate-50"
                    />
                  </td>
                  {/* Strength */}
                  <td className="p-0 border-r border-slate-100 border-b border-slate-100">
                    <input 
                      id={`cell-${idx}-1`}
                      type="number" 
                      value={row.strength} 
                      onChange={(e) => handleUpdate(idx, 'strength', parseInt(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, idx, 1)}
                      disabled={locked}
                      className="w-full h-full text-center bg-transparent px-1 py-1 text-[11px] font-medium text-slate-700 outline-none focus:bg-blue-50/50 focus:ring-2 focus:ring-inset focus:ring-blue-500/20 transition-all disabled:text-slate-500 disabled:bg-slate-50"
                    />
                  </td>
                  {/* Days */}
                  {[1, 2, 3, 4, 5, 6].map((d, colOffset) => (
                    <td key={d} className="p-0 border-r border-slate-100 border-b border-slate-100">
                      <input 
                        id={`cell-${idx}-${colOffset + 2}`}
                        type="text" 
                        value={row[`d${d}` as keyof BranchEntry]} 
                        onChange={(e) => handleUpdate(idx, `d${d}` as keyof BranchEntry, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx, colOffset + 2)}
                        disabled={locked}
                        className={cn(
                            "w-full h-full text-center bg-transparent px-1 py-1 text-[11px] font-medium outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/20 transition-all disabled:bg-slate-50",
                            // Highlight if 0
                            row[`d${d}` as keyof BranchEntry] === 0 ? "text-slate-300" : "text-slate-700 font-bold"
                        )}
                      />
                    </td>
                  ))}
                  {/* Average */}
                  <td className="p-0 border-b border-slate-100 text-center bg-slate-50/30">
                    <div className={cn(
                        "text-[11px] font-black italic py-2",
                        calculateAvg(row) < 50 ? "text-rose-500" : "text-[#1E3A8A]"
                    )}>
                      {calculateAvg(row)}%
                    </div>
                  </td>
                  {/* Actions */}
                  {!locked && (
                    <td className="p-0 border-b border-slate-100 text-center">
                        <button onClick={() => removeRow(idx)} className="w-full h-full flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
           {!locked ? (
               <button 
                onClick={addNewRow}
                className="flex items-center gap-2 text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded transition-all"
               >
                 <Plus className="w-3.5 h-3.5" /> Append Branch
               </button>
           ) : (
                <div className="flex items-center gap-2 text-emerald-600 px-4 py-2 bg-emerald-50 rounded-lg">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Data Entry Locked</span>
                </div>
           )}
           
           <div className="flex gap-4">
              <button onClick={onClose} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
              <button 
                onClick={() => onSave(data, locked)}
                className={cn(
                    "flex items-center gap-2 text-white px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
                    locked 
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" 
                        : "bg-[#1E3A8A] hover:bg-blue-900 shadow-blue-100"
                )}
              >
                <Save className="w-3.5 h-3.5" /> {locked ? "Commit Final Record" : "Save as Draft"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
