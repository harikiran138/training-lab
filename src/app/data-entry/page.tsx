"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CrtAttendanceEntryForm from '@/components/dashboard/CrtAttendanceEntryForm';
import { BranchAttendance } from '@/services/CrtAttendanceService';
import { LayoutGrid, ArrowLeft } from 'lucide-react';

const DEFAULT_NSRIT_DATA: BranchAttendance[] = [
  { branch: "CE", strength: 34, daily: ["No CRT", 19, "No CRT", 26, 17, 25] },
  { branch: "EEE", strength: 71, daily: ["No CRT", "No CRT", 60, 67, 62, "No CRT"] },
  { branch: "ME-A", strength: 52, daily: [32, 36, 33, 32, 21, "No CRT"] },
  { branch: "ME-B", strength: 53, daily: [25, 30, 27, 25, 31, "No CRT"] },
  { branch: "ECE-A", strength: 69, daily: [34, 35, "No CRT", 53, 54, 50] },
  { branch: "ECE-B", strength: 70, daily: [47, 40, "No CRT", 56, 57, 44] },
  { branch: "ECE-C", strength: 69, daily: [35, 40, "No CRT", 52, 58, 43] },
  { branch: "EVT", strength: 66, daily: [23, "No CRT", "No CRT", "No CRT", 45, 18] },
  { branch: "CSE-A", strength: 71, daily: [46, 49, 44, "No CRT", "No CRT", "No CRT"] },
  { branch: "CSE-B", strength: 70, daily: [26, "No CRT", "No CRT", 48, 53, "No CRT"] },
  { branch: "CSE-C", strength: 66, daily: ["No CRT", 17, 34, 36, 32, "No CRT"] },
  { branch: "CSM", strength: 72, daily: [27, 39, 43, 38, "No CRT", "No CRT"] },
  { branch: "CSD", strength: 68, daily: [33, 39, "No CRT", 45, 52, "No CRT"] }
];

export default function DataEntryPage() {
  const router = useRouter();
  const [data, setData] = useState<BranchAttendance[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('crt_attendance_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        setData(DEFAULT_NSRIT_DATA);
      }
    } else {
      setData(DEFAULT_NSRIT_DATA);
    }
    setIsLoaded(true);
  }, []);

  const handleSave = (newData: BranchAttendance[]) => {
    localStorage.setItem('crt_attendance_data', JSON.stringify(newData));
    router.push('/crt/attendance');
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-blue-800 font-black uppercase tracking-[0.5em] animate-pulse">
        Accessing Data Gateway...
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-4 border-slate-900 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button 
                onClick={() => router.back()}
                className="p-3 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                Data <span className="text-blue-600">Entry</span>
                </h1>
            </div>
            <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.5em] flex items-center gap-4">
                <span className="w-12 h-1 bg-blue-800"></span>
                Institutional Administrative Protocol :: Secure Write-Access
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-6 py-4 border-2 border-slate-900 italic shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            Institutional Performance Framework v3.0
          </div>
        </header>

        <CrtAttendanceEntryForm 
          initialData={data} 
          onSave={handleSave}
          onClose={() => router.push('/crt/attendance')}
        />
    </div>
  );
}
