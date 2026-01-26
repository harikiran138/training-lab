"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CrtAttendanceEntryForm from '@/components/dashboard/CrtAttendanceEntryForm';
import { BranchAttendance } from '@/services/CrtAttendanceService';
import { LayoutGrid, ArrowLeft, ShieldCheck, Database, Zap, Calendar } from 'lucide-react';

const DEFAULT_NSRIT_DATA: BranchAttendance[] = [
  { branch: "CSE-A", strength: 71, daily: [46, 49, 44, 50, 52, 48] },
  { branch: "CSE-B", strength: 70, daily: [26, 40, 45, 48, 53, 50] },
  { branch: "CSM", strength: 72, daily: [27, 39, 43, 38, 45, 40] },
  { branch: "ECE-A", strength: 69, daily: [34, 35, "No CRT", 53, 54, 50] }
];

export default function DataEntryPage() {
  const router = useRouter();
  const [data, setData] = useState<BranchAttendance[]>([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/crt/records?week_number=${weekNumber}`);
        const records = await res.json();
        
        if (records && records.length > 0) {
          // Map DB records back to UI format
          const uiData = records.map((r: any) => ({
            branch: r.branch_code,
            strength: r.total_strength,
            daily: [
              r.day1_attended, r.day2_attended, r.day3_attended,
              r.day4_attended, r.day5_attended, r.day6_attended
            ]
          }));
          setData(uiData);
        } else {
          setData(DEFAULT_NSRIT_DATA);
        }
      } catch (e) {
        setData(DEFAULT_NSRIT_DATA);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, [weekNumber]);

  const handleSave = async (newData: BranchAttendance[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/crt/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: newData,
          week_number: weekNumber
        })
      });
      
      if (res.ok) {
        router.push('/crt/attendance');
      } else {
        alert('Transmission Failure :: Secure Repository rejected the update.');
      }
    } catch (e) {
      console.error(e);
      alert('Network Fault :: Repository unreachable.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isSaving) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-8 animate-pulse text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div>
            <p className="text-blue-800 font-black uppercase tracking-[0.5em] mb-4">
                {isSaving ? 'Synchronizing Repository...' : 'Accessing Data Gateway...'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Secure institutional connection established</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-slate-100 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-8">
                <button 
                onClick={() => router.back()}
                className="p-4 bg-white border border-slate-200 shadow-xl shadow-slate-100 hover:bg-slate-50 transition-all rounded-2xl group"
                >
                <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
                <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                Data <span className="text-blue-600">Entry</span>
                </h1>
            </div>
            <p className="text-blue-600 font-black text-[12px] uppercase tracking-[0.5em] flex items-center gap-6 opacity-60">
                <span className="w-16 h-1 bg-blue-600 rounded-full"></span>
                Institutional Repository Management :: Secure Write-Access v4.5
            </p>
          </div>
          
          <div className="flex flex-col gap-6 w-full md:w-auto">
             <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-xl shadow-blue-100/10">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                    <Calendar className="w-6 h-6" />
                </div>
                <div className="pr-10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Epoch</span>
                    <select 
                        value={weekNumber}
                        onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                        className="bg-transparent border-none focus:ring-0 font-black text-blue-900 uppercase italic tracking-tighter text-2xl p-0 cursor-pointer"
                    >
                        {[1,2,3,4,5,6,7,8,9,10].map(w => (
                            <option key={w} value={w}>Reporting Week {w}</option>
                        ))}
                    </select>
                </div>
             </div>
             <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-8 py-4 border border-slate-100 rounded-3xl italic shadow-sm self-end">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Auth Verification Active
             </div>
          </div>
        </header>

        <section className="bg-slate-50/50 p-2 rounded-[3.5rem] border border-slate-100 shadow-inner">
            <CrtAttendanceEntryForm 
                initialData={data} 
                onSave={handleSave}
                onClose={() => router.push('/crt/attendance')}
            />
        </section>

        <footer className="pt-16 flex justify-center">
             <div className="flex items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-none">
                 <Zap className="w-4 h-4" />
                 Institutional Performance Framework 2026 :: All Vectors Synchronized
             </div>
        </footer>
    </div>
  );
}
