"use client"

import React, { useEffect, useState } from 'react';
import { Sigma, BarChart2, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StatisticalAudit() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/statistical')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading Mathematical Audit...</div>;
  if (!data || data.error) return <div className="p-8 text-center text-rose-500">Error loading statistical data.</div>;

  const { math_meta, frequency_distribution } = data;

  return (
    <div className="space-y-8">
      {/* Formula Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Sigma className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sigma className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold">Mathematical Formalisms</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Readiness Index (R)</p>
                <code className="text-lg font-mono text-slate-100">{math_meta.formulas.Readiness_Score}</code>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Standard Score (Z)</p>
                <code className="text-lg font-mono text-slate-100">{math_meta.formulas.Z_Score}</code>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold">{math_meta.stats.mean}</p>
                  <p className="text-xs text-slate-400 uppercase mt-1">Mean (μ)</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold">{math_meta.stats.std_dev}</p>
                  <p className="text-xs text-slate-400 uppercase mt-1">Std Dev (σ)</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold">{math_meta.stats.correlation}</p>
                  <p className="text-xs text-slate-400 uppercase mt-1">Pearson r</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-3xl font-bold">{math_meta.stats.population_size}</p>
                  <p className="text-xs text-slate-400 uppercase mt-1">Samples (n)</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-slate-700" />
                <h4 className="font-bold text-slate-900">Readiness Frequency Distribution</h4>
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Normality Observed
             </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequency_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="range" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistical Insights */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
             <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-900">Statistical Context</h4>
             </div>
             <p className="text-sm text-emerald-700 leading-relaxed">
               The Pearson Correlation of <span className="font-bold">{math_meta.stats.correlation}</span> indicates a 
               {Math.abs(math_meta.stats.correlation) > 0.6 ? ' strong ' : ' moderate '} 
               positive relationship between attendance and academic performance.
             </p>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
             <h4 className="font-bold text-slate-900 mb-4">Risk Outliers (Z &lt; -1.5)</h4>
             <div className="space-y-3">
                {data.risk_outliers.length > 0 ? data.risk_outliers.map((s: any) => (
                  <div key={s.student_id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                     <div>
                        <p className="text-sm font-bold text-slate-900">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{s.student_id}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-rose-600">{s.z_score.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Z-Score</p>
                     </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No outliers detected in the current population.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
