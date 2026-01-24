"use client"

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Table as TableIcon, LayoutPanelLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DataEntryPage() {
  const [branches, setBranches] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
      if (!branchRef) return prev;

      if (field) {
        if (typeof branchRef[section] === 'object' && branchRef[section] !== null) {
          branchRef[section] = { ...branchRef[section], [field]: (isNaN(value) ? 0 : value) };
        } else {
          branchRef[section] = { [field]: (isNaN(value) ? 0 : value) };
        }
      } else {
        branchRef[section] = (isNaN(value) ? 0 : value);
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

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Audit Week</div>
          <select
            className="p-2.5 bg-slate-50 border-none font-black text-blue-700 rounded-xl outline-none cursor-pointer hover:bg-blue-50 transition-colors"
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
            className="px-6 py-2.5 bg-blue-700 text-white font-black rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2 disabled:opacity-30 shadow-lg shadow-blue-100"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Secure Sync'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <a href="/data-entry/bulk" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          <span className="text-sm">Switch to Bulk Upload</span>
          <ArrowRight className="w-4 h-4" />
        </a>
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
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest sticky left-0 z-10 bg-slate-900">Branch</th>
                  <th className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest border-l border-slate-800">Attendance %</th>
                  <th className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest border-l border-slate-800">Pass %</th>
                  <th className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest border-l border-slate-800">Motivation</th>
                  <th className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest border-l border-slate-800">Personality</th>
                  <th className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest border-l border-slate-800">Laptops</th>
                  <th className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest border-l border-slate-800">Reading (M)</th>
                  <th className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest border-l border-slate-800">Syllabus Ph</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((b: any) => (
                  <tr key={b.branch_code} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-100">
                      <div>
                        <span className="text-base font-black text-slate-900 tracking-tighter">{b.branch_code}</span>
                        <p className="text-[9px] font-black text-slate-400 block uppercase truncate w-24 tracking-widest">{b.branch_name}</p>
                      </div>
                    </td>
                    <GridInput
                      value={gridData[b.branch_code]?.attendance?.avg_attendance_percent}
                      onChange={(v: number) => updateCell(b.branch_code, 'attendance', 'avg_attendance_percent', v)}
                      color="text-blue-700"
                    />
                    <GridInput
                      value={gridData[b.branch_code]?.tests?.avg_test_pass_percent}
                      onChange={(v: number) => updateCell(b.branch_code, 'tests', 'avg_test_pass_percent', v)}
                      color="text-blue-600"
                    />
                    <GridInput
                      value={gridData[b.branch_code]?.motivation?.avg_score}
                      onChange={(v: number) => updateCell(b.branch_code, 'motivation', 'avg_score', v)}
                      color="text-slate-700"
                      max={10}
                    />
                    <GridInput
                      value={gridData[b.branch_code]?.personality_development?.avg_score}
                      onChange={(v: number) => updateCell(b.branch_code, 'personality_development', 'avg_score', v)}
                      color="text-slate-700"
                      max={10}
                    />
                    <GridInput
                      value={gridData[b.branch_code]?.laptop_holders?.count}
                      onChange={(v: number) => updateCell(b.branch_code, 'laptop_holders', 'count', v)}
                      color="text-slate-600"
                      max={2000}
                    />
                    <GridInput
                      value={gridData[b.branch_code]?.reading_time?.avg_minutes_per_student}
                      onChange={(v: number) => updateCell(b.branch_code, 'reading_time', 'avg_minutes_per_student', v)}
                      color="text-slate-600"
                      max={300}
                    />
                    <td className="px-4 py-4 text-center border-l border-slate-50">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          className="w-14 p-2 bg-slate-50 border border-slate-100 font-bold text-slate-700 text-center rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                          value={gridData[b.branch_code]?.syllabus?.covered || 0}
                          onChange={(e) => updateCell(b.branch_code, 'syllabus', 'covered', parseFloat(e.target.value))}
                        />
                        <span className="text-slate-300 font-light text-xs">/</span>
                        <span className="text-[10px] font-black text-slate-400">100</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleBulkSave}
              disabled={saving}
              className="px-12 py-5 bg-blue-700 text-white font-black text-xl rounded-2xl hover:bg-slate-900 shadow-2xl shadow-blue-200 hover:shadow-none translate-y-0 active:translate-y-1 transition-all flex items-center gap-4"
            >
              <Save className="w-6 h-6" />
              {saving ? 'Saving Data...' : 'Finalize & Sync Records'}
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
          "w-20 p-2.5 bg-white border border-slate-200 font-black rounded-xl text-center outline-none ring-2 ring-transparent focus:ring-blue-500/20 focus:border-blue-600 transition-all text-xs",
          color
        )}
        value={value || 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </td>
  );
}
