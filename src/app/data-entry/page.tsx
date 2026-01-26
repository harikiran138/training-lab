"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CompactCrtEntryForm from '@/components/dashboard/CompactCrtEntryForm';
import CompactPlacementEntryForm from '@/components/dashboard/CompactPlacementEntryForm';
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
                ) : (
                  <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-6 shadow-sm">
                    <Database className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Fixed Form for "{INSTITUTIONAL_SCHEMAS[activeSchema].name}" is being calibrated.</p>
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
        </div>
    </div>
  );
}
