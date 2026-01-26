"use client"

import React, { useEffect, useState } from 'react';
import { DataHealthStatus } from '@/services/DataAvailabilityService';
import { CheckCircle2, CircleDashed, Activity, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DataHealthCard() {
  const [health, setHealth] = useState<DataHealthStatus[]>([]);
  const [readiness, setReadiness] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastAudit, setLastAudit] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/health');
      const data = await res.json();
      if (data.success) {
        setHealth(data.health);
        setReadiness(data.readiness);
        setLastAudit(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#1E3A8A]" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1E3A8A]">
                    Master Data Health
                </h3>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Readiness</p>
                    <p className={cn(
                        "text-lg font-black tracking-tighter",
                        readiness === 100 ? "text-emerald-500" : "text-amber-500"
                    )}>
                        {readiness}%
                    </p>
                </div>
                {readiness === 100 && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health.map((item) => (
                <div key={item.domain_id} className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                        {item.status === 'active' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <CircleDashed className="w-4 h-4 text-slate-300 animate-pulse" />
                        )}
                        <div>
                             <p className="text-[11px] font-black uppercase text-slate-700">{item.name}</p>
                             <p className="text-[9px] font-medium text-slate-400">
                                 {item.status === 'active' 
                                   ? `${item.record_count} Records Synced` 
                                   : 'Awaiting Ingestion'}
                             </p>
                        </div>
                    </div>
                    {item.status === 'active' && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    )}
                </div>
            ))}
        </div>
        
        <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>Last Audit: {lastAudit || 'Syncing...'}</span>
            <button 
                onClick={fetchHealth} 
                className={cn("flex items-center gap-2 hover:text-[#1E3A8A] transition-colors", loading && "animate-spin")}
            >
                <RefreshCw className="w-3 h-3" /> Refresh
            </button>
        </div>
    </div>
  );
}
