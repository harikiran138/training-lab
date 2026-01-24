"use client"

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Table as TableIcon, LayoutPanelLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DataEntryPage() {
  const [branches, setBranches] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Matrix of data [branch_code]: { metrics }
  const [gridData, setGridData] = useState<any>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [bRes, wRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/weeks')
        ]);
        const bData = await bRes.json();
        const wData = await wRes.json();
        setBranches(bData);
        setWeeks(wData.slice(0, 15));
        
        // Initialize grid data with default values
        const initialGrid: any = {};
        bData.forEach((b: any) => {
          initialGrid[b.branch_code] = {
            sessions: 5,
            strength: 0,
            total_training_hours: 0,
            attendance: { avg_attendance_percent: 0 },
            tests: { avg_test_attendance_percent: 0, avg_test_pass_percent: 0 },
            syllabus: { covered: 0, total: 100 },
            personality_development: { avg_score: 0, sessions_conducted: 1 },
            motivation: { avg_score: 0 },
            reading_time: { total_minutes: 0, avg_minutes_per_student: 0 },
            laptop_holders: { count: 0, percent: 0 }
          };
        });
        setGridData(initialGrid);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  // When week changes, fetch existing data for that week
  useEffect(() => {
    if (!selectedWeek) return;
    
    async function fetchWeekData() {
        try {
            const res = await fetch(`/api/reports?week_no=${selectedWeek}`);
            const existingReports = await res.json();
            
            setGridData((prev: any) => {
                const next = { ...prev };
                existingReports.forEach((r: any) => {
                    if (next[r.branch_code]) {
                        next[r.branch_code] = { 
                            ...prev[r.branch_code], 
                            ...r,
                            attendance: r.attendance || { avg_attendance_percent: 0 },
                            tests: r.tests || { avg_test_attendance_percent: 0, avg_test_pass_percent: 0 },
                            syllabus: r.syllabus || { covered: 0, total: 100 },
                            personality_development: r.personality_development || { avg_score: 0, sessions_conducted: 1 },
                            motivation: r.motivation || { avg_score: 0 },
                            reading_time: r.reading_time || { total_minutes: 0, avg_minutes_per_student: 0 },
                            laptop_holders: r.laptop_holders || { count: 0, percent: 0 }
                        };
                    }
                });
                return next;
            });
        } catch (err) {
            console.error("Failed to fetch week data", err);
        }
    }
    fetchWeekData();
  }, [selectedWeek]);

  const updateCell = (branchCode: string, section: string, field: string | null, value: any) => {
    setGridData((prev: any) => {
      const branchRef = { ...prev[branchCode] };
      if (field) {
        branchRef[section] = { ...branchRef[section], [field]: value };
      } else {
        branchRef[section] = value;
      }
      return { ...prev, [branchCode]: branchRef };
    });
  };

  const handleBulkSave = async () => {
    if (!selectedWeek) {
        setMessage({ text: 'Please select a week first', type: 'error' });
        return;
    }
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = Object.entries(gridData).map(([code, data]: [string, any]) => ({
        branch_code: code,
        week_no: parseInt(selectedWeek),
        ...data
      }));

      const res = await fetch('/api/reports/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ text: `Successfully saved ${payload.length} reports!`, type: 'success' });
        fetch('/api/summary?refresh=true');
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading configuration...</div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <TableIcon className="w-8 h-8 text-indigo-600" />
                Bulk Data Entry
            </h2>
            <p className="text-slate-500 font-medium">Matrix-style input for all branches simultaneously</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
            <div className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Select Week</div>
            <select 
                className="p-2.5 bg-slate-50 border-none font-bold text-slate-800 rounded-lg outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
            >
                <option value="">-- Choose Week --</option>
                {weeks.map((w: any) => (
                    <option key={w.week_no} value={w.week_no}>{w.label}</option>
                ))}
            </select>
            <button 
                onClick={handleBulkSave}
                disabled={saving || !selectedWeek}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-indigo-600 transition-all flex items-center gap-2 disabled:opacity-30"
            >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save All Changes'}
            </button>
        </div>
      </div>

      {message.text && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
          message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {!selectedWeek ? (
          <div className="h-96 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
            <LayoutPanelLeft className="w-16 h-16 text-slate-300" />
            <p className="text-slate-400 font-bold text-lg">Select a week from the dropdown to start entering data</p>
          </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="px-6 py-5 text-xs font-black uppercase tracking-widest sticky left-0 z-10 bg-slate-900">Branch</th>
                            <th className="px-4 py-5 text-center text-xs font-black uppercase tracking-widest border-l border-slate-800">Attendance %</th>
                            <th className="px-4 py-5 text-center text-xs font-black uppercase tracking-widest border-l border-slate-800">Pass %</th>
                            <th className="px-4 py-5 text-center text-xs font-black uppercase tracking-widest border-l border-slate-800">Motivation</th>
                            <th className="px-4 py-5 text-center text-xs font-black uppercase tracking-widest border-l border-slate-800">Personality</th>
                            <th className="px-4 py-5 text-center text-xs font-black uppercase tracking-widest border-l border-slate-800">Laptop Cnt</th>
                            <th className="px-4 py-5 text-center text-xs font-black uppercase tracking-widest border-l border-slate-800">Reading (Min)</th>
                            <th className="px-4 py-5 text-center text-xs font-black uppercase tracking-widest border-l border-slate-800">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {branches.map((b: any) => (
                            <tr key={b.branch_code} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-50">
                                    <div>
                                        <span className="text-lg font-black text-slate-900">{b.branch_code}</span>
                                        <p className="text-[10px] font-bold text-slate-400 block uppercase truncate w-32">{b.branch_name}</p>
                                    </div>
                                </td>
                                <GridInput 
                                    value={gridData[b.branch_code]?.attendance?.avg_attendance_percent} 
                                    onChange={(v) => updateCell(b.branch_code, 'attendance', 'avg_attendance_percent', v)}
                                    color="text-indigo-600"
                                />
                                <GridInput 
                                    value={gridData[b.branch_code]?.tests?.avg_test_pass_percent} 
                                    onChange={(v) => updateCell(b.branch_code, 'tests', 'avg_test_pass_percent', v)}
                                    color="text-emerald-600"
                                />
                                <GridInput 
                                    value={gridData[b.branch_code]?.motivation?.avg_score} 
                                    onChange={(v) => updateCell(b.branch_code, 'motivation', 'avg_score', v)}
                                    color="text-amber-600"
                                    max={10}
                                />
                                <GridInput 
                                    value={gridData[b.branch_code]?.personality_development?.avg_score} 
                                    onChange={(v) => updateCell(b.branch_code, 'personality_development', 'avg_score', v)}
                                    color="text-purple-600"
                                    max={10}
                                />
                                <GridInput 
                                    value={gridData[b.branch_code]?.laptop_holders?.count} 
                                    onChange={(v) => updateCell(b.branch_code, 'laptop_holders', 'count', v)}
                                    color="text-slate-600"
                                    max={1000}
                                />
                                <GridInput 
                                    value={gridData[b.branch_code]?.reading_time?.avg_minutes_per_student} 
                                    onChange={(v) => updateCell(b.branch_code, 'reading_time', 'avg_minutes_per_student', v)}
                                    color="text-cyan-600"
                                    max={300}
                                />
                                <td className="px-4 py-4 text-center border-l border-slate-50">
                                   <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            className="w-16 p-2 bg-slate-50 border-none font-bold text-slate-700 text-center rounded-lg"
                                            value={gridData[b.branch_code]?.syllabus?.covered}
                                            onChange={(e) => updateCell(b.branch_code, 'syllabus', 'covered', parseFloat(e.target.value))}
                                        />
                                        <span className="text-slate-300">/</span>
                                        <span className="text-xs font-bold text-slate-400">100</span>
                                   </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                    onClick={handleBulkSave}
                    disabled={saving}
                    className="px-10 py-4 bg-indigo-600 text-white font-black text-lg rounded-2xl hover:bg-slate-900 shadow-xl shadow-indigo-100 hover:shadow-none translate-y-0 active:translate-y-1 transition-all flex items-center gap-3"
                >
                    <Save className="w-6 h-6" />
                    {saving ? 'Processing...' : 'Confirm & Save All Branch Data'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

function GridInput({ value, onChange, color, max = 100 }: any) {
    return (
        <td className="px-2 py-4 text-center border-l border-slate-50">
            <input 
                type="number" 
                step="0.1"
                min="0"
                max={max}
                className={cn(
                    "w-20 p-3 bg-white border border-slate-100 font-black rounded-xl text-center outline-none ring-2 ring-transparent focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                    color
                )}
                value={value || 0}
                onChange={(e) => onChange(parseFloat(e.target.value))}
            />
        </td>
    );
}
