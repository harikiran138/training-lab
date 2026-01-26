"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CompactCrtEntryForm from '@/components/dashboard/CompactCrtEntryForm';
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
        const res = await fetch(`/api/crt/records?week_number=${weekNumber}`);
        const records = await res.json();
        
        if (records && records.length > 0) {
          const uiData = records.map((r: any) => ({
            branch: r.branch_code,
            strength: r.total_strength,
            d1: r.day1_attended,
            d2: r.day2_attended,
            d3: r.day3_attended,
            d4: r.day4_attended,
            d5: r.day5_attended,
            d6: r.day6_attended
          }));
          setData(uiData);
        } else {
          // Default data mapping for the compact form
          setData(INSTITUTIONAL_SCHEMAS[activeSchema].defaultData.map(d => ({
            branch: d.branch || '',
            strength: d.strength || 0,
            d1: d.d1 || 0, d2: d.d2 || 0, d3: d.d3 || 0, d4: d.d4 || 0, d5: d.d5 || 0, d6: d.d6 || 0
          })));
        }
      } catch (e) {
        setData([]);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, [weekNumber, activeSchema]);

  const handleSave = async (newData: any[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/crt/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: newData.map(n => ({
            branch_code: n.branch,
            total_strength: n.strength,
            day1_attended: n.d1, day2_attended: n.d2, day3_attended: n.d3,
            day4_attended: n.d4, day5_attended: n.d5, day6_attended: n.d6
          })),
          week_number: weekNumber
        })
      });
      
      if (res.ok) {
        alert('Repository Synchronized :: CRT entries committed.');
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
        {/* HEADER: CONSOLIDATED */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-slate-100 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="p-2 transition-colors hover:bg-white rounded border border-slate-200 shadow-sm"
                >
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
             <div className="pl-4 border-r border-slate-100 pr-8">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Target Epoch</span>
                <div className="relative">
                    <select 
                        value={weekNumber}
                        onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                        className="bg-transparent border-none focus:ring-0 font-black text-[#1E3A8A] uppercase tracking-tighter text-xl p-0 cursor-pointer appearance-none pr-8"
                    >
                        {[1,2,3,4,5,6,7,8,9,10].map(w => (
                            <option key={w} value={w}>WEEK {w.toString().padStart(2, '0')}</option>
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

        {/* COMPACT ENTRY ZONE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
                <CompactCrtEntryForm 
                    weekNumber={weekNumber}
                    initialData={data}
                    onSave={handleSave}
                    onClose={() => router.push('/')}
                />
            </div>

            {/* SIDEBAR OPS */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Entry Policies</span>
                        </div>
                        <h4 className="text-lg font-black tracking-tight leading-tight">"All data commits are immutable and verified by institutional board audits."</h4>
                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Auto-Sync Engaged</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Zero-Latency Commits</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
                    <h4 className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest border-l-4 border-[#1E3A8A] pl-4">Registry Summary</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Branches</span>
                            <span className="text-xl font-black text-[#1E3A8A]">{data.length}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Strength</span>
                            <span className="text-xl font-black text-[#1E3A8A]">{data.reduce((s, r) => s + (r.strength || 0), 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer className="pt-20 flex flex-col items-center gap-4 opacity-30">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Institutional Data Management :: Secure Write-Access v5.0
             </p>
             <div className="flex gap-6">
                 <Database className="w-4 h-4" />
                 <ShieldCheck className="w-4 h-4" />
                 <Building2 className="w-4 h-4" />
             </div>
        </footer>
    </div>
  );
}
