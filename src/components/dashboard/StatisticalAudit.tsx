"use client"

import React, { useState } from 'react';
import { Sigma, Play, Download, Loader2, Calculator, Info, AlertTriangle, CheckCircle, Database, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ScientificCard } from '@/components/ui/ScientificCard';
import { FacultyEffectiveness } from '@/components/dashboard/FacultyEffectiveness';
import { PredictionSimulator } from '@/components/dashboard/PredictionSimulator';
import { TrendChart } from '@/components/dashboard/TrendChart';

// Scientific Palette Hex Codes (matching globals.css)
const COLORS = {
  primary: '#06B6D4',   // Cyan
  secondary: '#6366F1', // Indigo
  success: '#10B981',   // Emerald
  warning: '#F59E0B',   // Amber
  danger: '#EF4444',    // Red
  slate: '#64748B',     // Slate 500
  grid: '#1e293b'       // Slate 800
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl z-50">
        <p className="text-slate-300 text-xs font-mono mb-2 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs font-mono mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-bold text-slate-200">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function StatisticalAudit() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/statistical');
      const json = await res.json();
      setData(json);
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      setData({ error: "Connection timed out. Ensure deterministic engine is online." });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Institutional_Audit_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initial State: "System Idle"
  if (!hasGenerated && !loading) {
    return (
      <div className="h-[400px] flex items-center justify-center border border-dashed border-slate-800 rounded-lg bg-slate-900/40 glass-panel">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-20 h-20 bg-slate-900/80 rounded-full flex items-center justify-center border border-cyan-900/30 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]">
            <Database className="w-10 h-10 text-cyan-500/80" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">Statistical Engine Standby</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Ready to initialize deterministic computation of population vectors, risk models, and logistic regression distributions.
            </p>
          </div>
          <button 
            onClick={triggerAnalysis}
            className="group px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-3 mx-auto shadow-lg shadow-cyan-900/20"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            Initialize Sequence
          </button>
        </div>
      </div>
    );
  }

  // Loading State: "Processing"
  if (loading) return (
    <div className="h-[400px] flex flex-col items-center justify-center border border-slate-800 rounded-lg bg-slate-900/60 glass-panel relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sigma className="w-6 h-6 text-cyan-400/50" />
          </div>
        </div>
        <h4 className="text-cyan-400 font-mono text-xl mt-8 animate-pulse tracking-widest">COMPUTING_VECTORS...</h4>
        <div className="mt-6 space-y-2 text-center font-mono text-xs text-slate-500">
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">[INIT] LOADING NumPy LIBRARIES</p>
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 text-cyan-500/80">[SYNC] FETCHING DATASETS (ATLAS)</p>
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">[CALC] PERFORMING LOGISTIC REGRESSION</p>
        </div>
      </div>
    </div>
  );

  // Error State
  if (!data || data.error) return (
    <div className="p-12 bg-rose-950/10 border border-rose-900/40 rounded-lg text-center glass-panel">
      <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-6 opacity-80" />
      <p className="text-rose-400 font-bold font-mono text-lg tracking-widest">EXECUTION_FAILURE</p>
      <p className="text-sm text-rose-500/70 mt-3 font-mono max-w-md mx-auto">{data?.error || "Connection failure to deterministic engine."}</p>
      <button 
        onClick={() => setHasGenerated(false)} 
        className="mt-8 px-6 py-2 border border-rose-800 hover:bg-rose-900/30 text-rose-400 text-xs font-mono uppercase tracking-widest rounded transition-colors"
      >
        Retry Sequence
      </button>
    </div>
  );






  const { population, correlations, distribution, risk_summary, formulas, outliers, is_mock, faculty_effectiveness, trends } = data;
  const chartData = Object.entries(distribution).map(([name, count]) => ({ name, count }));
  
  // Format Trend Data
  const trendHistory = trends?.global_history?.map((score: number, i: number) => ({
      week: `W${i + 1}`,
      'Avg Score': score
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-lg glass-panel">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/30 border border-emerald-900/50 rounded text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            ANALYSIS_COMPLETE
          </div>
          {is_mock && (
             <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/30 border border-amber-900/50 rounded text-xs font-mono text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                SYNTHETIC_DATA_FAILOVER
             </div>
          )}
        </div>
        <div className="flex gap-3">
           <button onClick={triggerAnalysis} className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono uppercase rounded flex items-center gap-2 transition-colors">
              <Play className="w-3 h-3" /> Re-Run
           </button>
           <button onClick={downloadReport} className="px-4 py-2 bg-cyan-950/30 border border-cyan-800/50 hover:bg-cyan-900/40 text-cyan-400 text-xs font-mono uppercase rounded flex items-center gap-2 transition-colors shadow-[0_0_15px_-3px_rgba(6,182,212,0.1)]">
              <Download className="w-3 h-3" /> Export JSON
           </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ScientificCard title="Population (n)" icon={Info} className="h-32 border-l-2 border-l-slate-700">
           <div className="flex items-end justify-between h-full pb-2">
              <span className="text-4xl font-mono font-bold text-slate-100">{population.size}</span>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Total Students</span>
                <span className="text-xs text-slate-400">100% Sample</span>
              </div>
           </div>
        </ScientificCard>
        <ScientificCard title="Global Mean (μ)" icon={Calculator} className="h-32 border-l-2 border-l-cyan-500">
           <div className="flex items-end justify-between h-full pb-2">
              <span className="text-4xl font-mono font-bold text-cyan-400">{population.mean}</span>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Avg Score</span>
                <span className="text-xs text-cyan-500/70">Weighted</span>
              </div>
           </div>
        </ScientificCard>
        <ScientificCard title="Std Deviation (σ)" icon={Sigma} className="h-32 border-l-2 border-l-purple-500">
           <div className="flex items-end justify-between h-full pb-2">
              <span className="text-4xl font-mono font-bold text-purple-400">{population.std_dev}</span>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Variance</span>
                <span className="text-xs text-purple-500/70">Spread</span>
              </div>
           </div>
        </ScientificCard>
        <ScientificCard title="Correlation (r)" icon={Calculator} className="h-32 border-l-2 border-l-emerald-500">
           <div className="flex items-end justify-between h-full pb-2">
              <span className="text-4xl font-mono font-bold text-emerald-400">{correlations.attendance_vs_overall}</span>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Attn vs Score</span>
                <span className="text-xs text-emerald-500/70">Strong Pos</span>
              </div>
           </div>
        </ScientificCard>
      </div>

      {/* Row 2: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 h-[350px]">
             <TrendChart 
                data={trendHistory} 
                categories={['Avg Score']} 
                index="week" 
                title="Longitudinal Performance Trend (5 Weeks)"
                colors={[COLORS.primary]}
             />
        </div>
        <ScientificCard title="Score Distribution" icon={BarChartIcon} className="col-span-1 h-[350px]">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: COLORS.slate, fontSize: 9, fontFamily: 'monospace' }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.slate, fontSize: 10, fontFamily: 'monospace' }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: COLORS.grid }} />
                <Bar dataKey="count" name="Frequency" fill={COLORS.primary} radius={[2, 2, 0, 0]} activeBar={{ fill: COLORS.secondary }} />
              </BarChart>
           </ResponsiveContainer>
        </ScientificCard>
      </div>

       {/* Row 3: Faculty Effectiveness */}
       {faculty_effectiveness && (
        <div className="grid grid-cols-1">
             <FacultyEffectiveness data={faculty_effectiveness} />
        </div>
       )}

      {/* Row 4: Advanced Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Simulator */}
        <div className="col-span-1 lg:col-span-2">
            <PredictionSimulator />
        </div>

        {/* Right Column: Outliers and Formulas */}
        <div className="col-span-1 space-y-6">
            {/* Outliers Data Grid */}
            <ScientificCard title={`Outliers (|Z| > 2.0)`} icon={AlertTriangle} className="min-h-[200px]">
                <div className="overflow-x-auto max-h-[250px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/30 sticky top-0 backdrop-blur-sm">
                        <th className="data-grid-header">ID</th>
                        <th className="data-grid-header text-right">Z-Score</th>
                    </tr>
                    </thead>
                    <tbody>
                    {outliers.length > 0 ? outliers.slice(0, 10).map((s: any) => (
                        <tr key={s.student_id} className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0">
                        <td className="data-grid-cell font-mono text-cyan-500 text-xs">{s.student_id}</td>
                        <td className={`data-grid-cell text-right font-mono font-bold text-xs ${Math.abs(s.z_score) > 2.5 ? 'text-rose-500' : 'text-amber-500'}`}>
                            {s.z_score.toFixed(2)}
                        </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={2} className="p-4 text-center text-slate-500 italic font-mono text-xs">
                            No significant outliers
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </ScientificCard>

            {/* Formulas Reference */}
            <ScientificCard title="Mathematical Models" icon={Calculator}>
               <div className="space-y-3">
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded font-mono text-xs text-slate-300">
                     <p className="text-slate-500 mb-1 upercase text-[9px] tracking-wider">Overall Score</p>
                     <p className="text-cyan-400/90 text-xs truncate" title={formulas.overall}>{formulas.overall}</p>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded font-mono text-xs text-slate-300">
                     <p className="text-slate-500 mb-1 upercase text-[9px] tracking-wider">Placement Prob</p>
                     <p className="text-purple-400/90 text-xs truncate" title={formulas.placement}>{formulas.placement}</p>
                  </div>
               </div>
            </ScientificCard>
        </div>
      </div>
    </div>
  );
}
