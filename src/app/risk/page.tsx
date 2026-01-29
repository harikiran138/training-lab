"use client"

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Target,
  ArrowRight,
  ShieldAlert,
  Ghost,
  BookOpen,
  Plus,
  Zap,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MitigationModal } from '@/components/dashboard/MitigationModal';
import { ActiveMitigations } from '@/components/dashboard/ActiveMitigations';
import { RiskPieChart } from '@/components/dashboard/OverviewCharts';
import { AIInsightPanel } from '@/components/dashboard/AIInsightPanel';
import { StatisticalAudit } from '@/components/dashboard/StatisticalAudit';

export default function RiskAnalysisPage() {
  const [highRisk, setHighRisk] = useState<any[]>([]);
  const [criticalSyllabus, setCriticalSyllabus] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/risk');
      const data = await res.json();
      if (data.success) {
        setHighRisk(data.highRisk || []);
        setCriticalSyllabus(data.criticalSyllabus || []);
        setDistribution(data.distribution || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleMitigationSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Risk Analysis</h2>
        <p className="text-slate-500">Identification and mitigation of performance gaps and syllabus lags</p>
      </div>

      {/* Active Interventions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Active Mitigation Interventions</h3>
          </div>
          <span className="text-sm text-slate-400 font-medium">Tracking {highRisk.length + criticalSyllabus.length} major risks</span>
        </div>
        <ActiveMitigations refreshTrigger={refreshTrigger} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <RiskPieChart data={distribution} />
        </div>
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-500 max-w-xs">AI Deep Search currently analyzing risk vectors...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Risk */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-rose-900 uppercase tracking-wider text-sm">Critical Performance Risks</h3>
            </div>
            <span className="px-2 py-1 bg-white/50 rounded-lg text-rose-700 text-[10px] font-bold border border-rose-200">
              {highRisk.length} BRANCHES
            </span>
          </div>
          <div className="flex-1">
            {highRisk.length > 0 ? (
              <ul className="divide-y divide-slate-50">
                {highRisk.map((branch: any) => (
                  <li key={branch.branch_code} className="p-6 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-lg font-bold text-slate-900">{branch.branch_code}</span>
                        <div className="flex gap-4 text-xs font-medium">
                          <span className={cn(branch.avg_test_pass < 50 ? "text-rose-600 font-bold" : "text-slate-500")}>
                            Pass: {branch.avg_test_pass.toFixed(1)}%
                          </span>
                          <span className={cn(branch.avg_attendance < 65 ? "text-rose-600 font-bold" : "text-slate-500")}>
                            Attendance: {branch.avg_attendance.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBranch(branch.branch_code)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Assign Mitigation
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="inline-flex p-3 bg-emerald-50 rounded-full">
                  <Ghost className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-500">No high-risk branches found. System stable.</p>
              </div>
            )}
          </div>
        </div>

        {/* Syllabus Lag */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900 uppercase tracking-wider text-sm">Syllabus Velocity Alerts</h3>
            </div>
            <span className="px-2 py-1 bg-white/50 rounded-lg text-amber-700 text-[10px] font-bold border border-amber-200">
              {criticalSyllabus.length} ALERTS
            </span>
          </div>
          <div className="flex-1">
            {criticalSyllabus.length > 0 ? (
              <ul className="divide-y divide-slate-50">
                {criticalSyllabus.map((branch: any) => (
                  <li key={branch.branch_code} className="p-6 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex justify-between items-center">
                      <div className="space-y-3 flex-1 mr-6">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-slate-900">{branch.branch_code}</span>
                          <span className="text-sm font-black text-amber-700">{branch.syllabus_completion_percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                            style={{ width: `${branch.syllabus_completion_percent}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBranch(branch.branch_code)}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                      >
                        <Target className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="inline-flex p-3 bg-emerald-50 rounded-full">
                  <Ghost className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-500">All branches are on track with syllabus.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-6 h-6 text-indigo-400" />
            <h3 className="text-2xl font-bold">Standard Mitigation Playbook</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Academic</p>
              <p className="text-sm text-slate-300 leading-relaxed">Schedule compensatory sessions for branches below 30% coverage. Focus on missed core modules.</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-3">Participation</p>
              <p className="text-sm text-slate-300 leading-relaxed">Investigate laptop availability and infrastructure impact for branches where attendance consistently drops below 65%.</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-3">Testing</p>
              <p className="text-sm text-slate-300 leading-relaxed">Conduct specialized doubt resolution camps and provide additional practice mocks for branches flagging low pass rates.</p>
            </div>
          </div>
        </div>
      </div>

      <MitigationModal
        isOpen={!!selectedBranch}
        branchCode={selectedBranch || ''}
        onClose={() => setSelectedBranch(null)}
        onSuccess={handleMitigationSuccess}
      />
    </div>
  );
}
