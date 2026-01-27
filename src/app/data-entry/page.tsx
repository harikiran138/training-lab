"use client"

<<<<<<< HEAD
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
=======
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CompactCrtEntryForm from '@/components/dashboard/CompactCrtEntryForm';
import CompactPlacementEntryForm from '@/components/dashboard/CompactPlacementEntryForm';
import GenericTableEntryForm from '@/components/dashboard/GenericTableEntryForm';
import VisionEntryCard from '@/components/dashboard/VisionEntryCard';
import { INSTITUTIONAL_SCHEMAS } from '@/config/SchemaManager';
import { 
    LayoutGrid, 
    ArrowLeft, 
    ShieldCheck, 
    Database, 
    Zap, 
    Calendar, 
    Save, 
    FileText,
    Activity,
    Users,
    ChevronDown,
    Building2,
    Lock,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DataEntryPage() {
  const router = useRouter();
  const [activeSchema, setActiveSchema] = useState('crt_attendance');
  const [data, setData] = useState<any[]>([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const groupedSchemas = useMemo(() => {
    const groups: Record<string, typeof INSTITUTIONAL_SCHEMAS[string][]> = {};
    Object.values(INSTITUTIONAL_SCHEMAS).forEach(s => {
        if (!groups[s.category]) groups[s.category] = [];
        groups[s.category].push(s);
    });
    return groups;
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoaded(false);
      try {
        const endpoint = activeSchema === 'crt_attendance' 
            ? `/api/crt/records?week_number=${weekNumber}`
            : `/api/records/${activeSchema}`; // Fallback for other domains
            
        const res = await fetch(endpoint);
        const records = await res.json();
        
        if (records && records.length > 0) {
          if (activeSchema === 'crt_attendance') {
            setData(records.map((r: any) => ({
              branch: r.branch_code,
              strength: r.total_strength,
              d1: r.day1_attended, d2: r.day2_attended, d3: r.day3_attended,
              d4: r.day4_attended, d5: r.day5_attended, d6: r.day6_attended
            })));
          } else {
            setData(records);
          }
        } else {
          setData(INSTITUTIONAL_SCHEMAS[activeSchema].defaultData);
        }
      } catch (e) {
        setData(INSTITUTIONAL_SCHEMAS[activeSchema].defaultData);
      } finally {
        setIsLoaded(true);
      }
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
    }
    loadData();
  }, [weekNumber, activeSchema]);

  const handleSave = async (newData: any[], isLocked: boolean = false) => {
    setIsSaving(true);
    try {
      const endpoint = activeSchema === 'crt_attendance' ? '/api/crt/records' : `/api/records/${activeSchema}`;
      const payload = activeSchema === 'crt_attendance' 
        ? {
            records: newData.map(n => ({
              branch_code: n.branch,
              strength: n.strength,
              daily: [n.d1, n.d2, n.d3, n.d4, n.d5, n.d6],
              academic_year: '2025-26', // Context padding
              batch: '3-2'
            })),
            week_number: weekNumber,
            status: isLocked ? 'LOCKED' : 'DRAFT'
          }
        : { records: newData, epoch: 1, status: isLocked ? 'LOCKED' : 'DRAFT' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Repository Synchronized :: Data committed.');
        router.push('/reports');
      } else {
        alert('Repository Reject :: Stream interrupted.');
      }
    } catch (e) {
      console.error(e);
      alert('Link Failure :: Repository offline.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isSaving) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#1E3A8A] opacity-60">
            {isSaving ? 'Synchronizing Repository...' : 'Authenticating Stream...'}
        </p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-slate-100 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 transition-colors hover:bg-white rounded border border-slate-200 shadow-sm">
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                </button>
                <h1 className="text-2xl font-black text-[#1E3A8A] tracking-tighter uppercase italic">
                    Data <span className="font-light opacity-60">Entry</span>
                </h1>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Institutional Registry Portal v5.0 Master
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-xl">
             <div className="pl-4 border-r border-slate-100 pr-10">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Domain</span>
                <div className="relative">
                    <select 
                        value={activeSchema}
                        onChange={(e) => setActiveSchema(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 font-black text-[#1E3A8A] uppercase tracking-tighter text-xl p-0 cursor-pointer appearance-none pr-10"
                    >
                        {Object.entries(groupedSchemas).map(([cat, schemas]) => (
                            <optgroup key={cat} label={cat.toUpperCase()} className="font-bold text-slate-400">
                                {schemas.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
             </div>

             <div className="px-6 py-2 flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
                Auth Active
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-12 xl:col-span-9 space-y-10">
                {/* VISION INGESTION PORT */}
                {activeSchema === 'crt_attendance' && (
                  <section className="animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-800">Visual Stream Ingestion</h3>
                    </div>
                    <VisionEntryCard onExtracted={(extracted) => {
                        setData(extracted);
                    }} />
                  </section>
                )}

                {activeSchema === 'crt_attendance' ? (
                  <CompactCrtEntryForm weekNumber={weekNumber} initialData={data} onSave={handleSave} onClose={() => router.push('/')} />
                ) : activeSchema === 'placement_summary' ? (
                  <CompactPlacementEntryForm initialData={data} onSave={handleSave} onClose={() => router.push('/')} />
                ) : INSTITUTIONAL_SCHEMAS[activeSchema] ? (
                  <GenericTableEntryForm 
                    schema={INSTITUTIONAL_SCHEMAS[activeSchema]} 
                    initialData={data} 
                    onSave={(newData) => handleSave(newData)} 
                    onClose={() => router.push('/')} 
                  />
                ) : (
                  <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-6 shadow-sm">
                    <Database className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Repository Domain "{activeSchema}" not initialized.</p>
                  </div>
                )}
            </div>

            <div className="lg:col-span-12 xl:col-span-3 space-y-8">
                <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Policies</span>
                        </div>
                        <h4 className="text-lg font-black tracking-tight leading-tight uppercase">"Data integrity is the baseline of our institution."</h4>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                </div>
            </div>
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
        </div>
    </div>
  );
}
<<<<<<< HEAD

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
=======
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
