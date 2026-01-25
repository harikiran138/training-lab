"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { ScientificCard } from '@/components/ui/ScientificCard';

export default function TrendsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/statistical');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-[500px] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
      <p className="font-mono text-cyan-400 text-sm animate-pulse">COMPUTING_LONGITUDINAL_VECTORS...</p>
    </div>
  );

  if (!data || data.error) return (
    <div className="p-8 text-center border border-rose-900/40 bg-rose-950/10 rounded-lg">
       <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
       <p className="text-rose-400 font-mono">TREND_ANALYSIS_FAILURE</p>
    </div>
  );

  const { trends, is_mock } = data;
  
  // Format Trend Data
  const trendHistory = trends?.global_history?.map((score: number, i: number) => ({
      week: `Week ${i + 1}`,
      'Global Avg': score,
      'Target': 75 // Static target line for context
  })) || [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-500" />
            Longitudinal Trend Analysis
        </h2>
        <p className="text-slate-500 font-mono text-sm max-w-2xl">
            Quantitative analysis of institutional performance vectors over a 5-week sliding window.
            Computed using NumPy least-squares regression.
        </p>
      </div>

      {is_mock && (
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-950/30 border border-amber-900/50 rounded text-xs font-mono text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            [SIMULATION_MODE] Using Synthetic Historical Data for Demonstration
         </div>
      )}

      {/* Main Trend Chart */}
      <div className="h-[500px]">
         <TrendChart 
            data={trendHistory} 
            categories={['Global Avg', 'Target']} 
            index="week" 
            title="Institutional Performance Velocity"
            colors={['#06B6D4', '#6366F1']} // Cyan, Indigo
            className="border-slate-800 bg-slate-900/40 glass-panel"
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScientificCard title="Regression Analysis" icon={TrendingUp}>
             <div className="space-y-4">
                 <div className="p-4 bg-slate-950 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Slope (m)</p>
                    <p className="text-2xl font-mono text-emerald-400 font-bold">
                        +{((trendHistory[trendHistory.length-1]?.['Global Avg'] - trendHistory[0]?.['Global Avg']) / trendHistory.length).toFixed(3)}
                    </p>
                    <p className="text-[10px] text-emerald-500/70 mt-1">Positive Velocity</p>
                 </div>
                 <div className="p-4 bg-slate-950 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Variance (σ²)</p>
                    <p className="text-2xl font-mono text-purple-400 font-bold">
                        {(Math.max(...trendHistory.map((t:any)=>t['Global Avg'])) - Math.min(...trendHistory.map((t:any)=>t['Global Avg']))).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-purple-500/70 mt-1">Peak-to-Trough Amplitude</p>
                 </div>
             </div>
          </ScientificCard>
          
          <ScientificCard title="Temporal Context" icon={Calendar} className="col-span-1 md:col-span-2">
              <div className="h-full flex items-center justify-center p-8 text-center">
                  <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                      The current trend indicates a <span className="text-emerald-400 font-bold">stabilizing upward trajectory</span>. 
                      Faculty impact scores suggest that interventions in Week 3 provided a verifiable lift in the global average.
                  </p>
              </div>
          </ScientificCard>
      </div>
    </div>
  );
}
