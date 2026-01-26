"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CrtAttendanceEntryForm from '@/components/dashboard/CrtAttendanceEntryForm';
import { BranchAttendance } from '@/services/CrtAttendanceService';
import { LayoutGrid, ArrowLeft, ShieldCheck, Database, Zap, Calendar, Save, FileText } from 'lucide-react';

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
        alert('Repository Reject :: Institutional stream interrupted.');
      }
    } catch (e) {
      console.error(e);
      alert('Link Failure :: Unable to synchronize with repository.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isSaving) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#1E3A8A] opacity-60">
            {isSaving ? 'Synchronizing Repository...' : 'Authenticating Stream...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-100 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="p-2 transition-colors hover:bg-white rounded border border-transparent hover:border-slate-200"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <h1 className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight uppercase">
                    Data <span className="font-light opacity-60">Entry</span>
                </h1>
            </div>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-11">
                Institutional Data Management :: Secure Write-Access
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-1.5 rounded border border-slate-200 shadow-sm">
             <div className="pl-4 border-r border-slate-100 pr-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Epoch Selection</span>
                <select 
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                    className="bg-transparent border-none focus:ring-0 font-extrabold text-[#1E3A8A] uppercase tracking-tighter text-lg p-0 cursor-pointer"
                >
                    {[1,2,3,4,5,6,7,8,9,10].map(w => (
                        <option key={w} value={w}>Reporting Week {w}</option>
                    ))}
                </select>
             </div>
             <div className="px-6 py-2 flex items-center gap-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Auth Active
             </div>
          </div>
        </div>

        <section className="bg-white border border-slate-200 rounded">
            <CrtAttendanceEntryForm 
                initialData={data} 
                onSave={handleSave}
                onClose={() => router.push('/crt/attendance')}
            />
        </section>

        <footer className="pt-10 flex justify-center border-t border-slate-50">
             <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                 <Database className="w-3 h-3" />
                 Secure Management Portal v5.0 :: Institutional Analytics
             </div>
        </footer>
    </div>
  );
}
