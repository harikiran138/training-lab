"use client"

import React, { useState, useEffect } from 'react';
import CrtAttendanceDashboard from '@/components/dashboard/CrtAttendanceDashboard';
interface BranchAttendance {
  branch_code: string;
  strength: number;
  daily: (number | string)[];
}

const DEFAULT_NSRIT_DATA: BranchAttendance[] = [
  {
    branch_code: "CE",
    strength: 34,
    daily: ["No CRT", 19, "No CRT", 26, 17, 25]
  },
  {
    branch_code: "EEE",
    strength: 71,
    daily: ["No CRT", "No CRT", 60, 67, 62, "No CRT"]
  },
  {
    branch_code: "ME-A",
    strength: 52,
    daily: [32, 36, 33, 32, 21, "No CRT"]
  },
  {
    branch_code: "ME-B",
    strength: 53,
    daily: [25, 30, 27, 25, 31, "No CRT"]
  },
  {
    branch_code: "ECE-A",
    strength: 69,
    daily: [34, 35, "No CRT", 53, 54, 50]
  },
  {
    branch_code: "ECE-B",
    strength: 70,
    daily: [47, 40, "No CRT", 56, 57, 44]
  },
  {
    branch_code: "ECE-C",
    strength: 69,
    daily: [35, 40, "No CRT", 52, 58, 43]
  },
  {
    branch_code: "EVT",
    strength: 66,
    daily: [23, "No CRT", "No CRT", "No CRT", 45, 18]
  },
  {
    branch_code: "CSE-A",
    strength: 71,
    daily: [46, 49, 44, "No CRT", "No CRT", "No CRT"]
  },
  {
    branch_code: "CSE-B",
    strength: 70,
    daily: [26, "No CRT", "No CRT", 48, 53, "No CRT"]
  },
  {
    branch_code: "CSE-C",
    strength: 66,
    daily: ["No CRT", 17, 34, 36, 32, "No CRT"]
  },
  {
    branch_code: "CSM",
    strength: 72,
    daily: [27, 39, 43, 38, "No CRT", "No CRT"]
  },
  {
    branch_code: "CSD",
    strength: 68,
    daily: [33, 39, "No CRT", 45, 52, "No CRT"]
  }
];

export default function CrtAttendancePage() {
  const [data, setData] = useState<BranchAttendance[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence: Load from Local Storage on mount
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

  const handleDataUpdate = (newData: BranchAttendance[]) => {
    setData(newData);
    localStorage.setItem('crt_attendance_data', JSON.stringify(newData));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-12 text-slate-400 font-black uppercase tracking-[0.5em] animate-pulse">
        Initializing Analytics Hub...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <CrtAttendanceDashboard 
        institutionName="NSRIT Autonomous"
        subTitle="3-2 CRT TRAINING ATTENDANCE"
        weekNumber={1}
        dateRange="24-11-25 to 29-11-25"
        rawData={data}
        onDataUpdate={handleDataUpdate}
      />
    </div>
  );
}
