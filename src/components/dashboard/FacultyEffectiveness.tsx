import React from 'react';
import { Users, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { ScientificCard } from '@/components/ui/ScientificCard';

interface FacultyStats {
  faculty_id: string;
  faculty_name: string;
  subject: string;
  student_count: number;
  avg_score: number;
  pass_rate: number;
  avg_trend: number;
  impact_score: number;
}

interface FacultyEffectivenessProps {
  data: FacultyStats[];
}

export function FacultyEffectiveness({ data }: FacultyEffectivenessProps) {
  // Sort by Impact Score (High to Low)
  const sortedData = [...data].sort((a, b) => b.impact_score - a.impact_score);

  return (
    <ScientificCard title="Faculty Effectiveness Module (Impact Factor)" icon={Award} className="col-span-1 lg:col-span-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-900/40">
              <th className="data-grid-header pl-4">Faculty Member</th>
              <th className="data-grid-header">Subject</th>
              <th className="data-grid-header text-center">Student (n)</th>
              <th className="data-grid-header text-right">Avg Score</th>
              <th className="data-grid-header text-right">Pass Rate</th>
              <th className="data-grid-header text-right">Trend (Slope)</th>
              <th className="data-grid-header text-right pr-4">Impact Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((f) => (
              <tr key={f.faculty_id} className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0 group">
                <td className="data-grid-cell pl-4 font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                      {f.faculty_id}
                    </div>
                    {f.faculty_name}
                  </div>
                </td>
                <td className="data-grid-cell text-slate-400 text-xs">{f.subject}</td>
                <td className="data-grid-cell text-center font-mono text-slate-500">{f.student_count}</td>
                <td className="data-grid-cell text-right font-mono text-cyan-400">{f.avg_score.toFixed(1)}</td>
                <td className="data-grid-cell text-right font-mono">
                    <span className={`${f.pass_rate < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {f.pass_rate.toFixed(1)}%
                    </span>
                </td>
                <td className="data-grid-cell text-right font-mono">
                  <div className="flex items-center justify-end gap-1">
                    {f.avg_trend > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                        <TrendingUp className="w-3 h-3 text-rose-500 transform rotate-180" />
                    )}
                    <span className={f.avg_trend > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                        {f.avg_trend.toFixed(3)}
                    </span>
                  </div>
                </td>
                <td className="data-grid-cell text-right pr-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                    f.impact_score > 5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    f.impact_score < 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                    'bg-slate-700/30 text-slate-300'
                  }`}>
                    {f.impact_score > 0 ? '+' : ''}{f.impact_score.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScientificCard>
  );
}
