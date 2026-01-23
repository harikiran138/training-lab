import React from 'react';
import { 
  AlertTriangle, 
  Target, 
  ArrowRight,
  ShieldAlert,
  Ghost,
  BookOpen
} from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import AggregateSummary from '@/models/AggregateSummary';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getRiskData() {
  await dbConnect();
  const summaries = await AggregateSummary.find({}).lean();
  
  const highRisk = summaries.filter((s: any) => s.avg_test_pass < 50 || s.avg_attendance < 65);
  const criticalSyllabus = summaries.filter((s: any) => s.syllabus_completion_percent < 30);
  
  return {
    highRisk: JSON.parse(JSON.stringify(highRisk)),
    criticalSyllabus: JSON.parse(JSON.stringify(criticalSyllabus))
  };
}

export default async function RiskAnalysisPage() {
  const { highRisk, criticalSyllabus } = await getRiskData();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Risk Analysis</h2>
        <p className="text-slate-500">Identification of low-performing branches and syllabus lags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Risk */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-rose-900">High Risk Branches (Performance)</h3>
          </div>
          <div className="p-0">
            {highRisk.length > 0 ? (
              <ul className="divide-y divide-slate-50">
                {highRisk.map((branch: any) => (
                  <li key={branch.branch_code} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-lg font-bold text-slate-900">{branch.branch_code}</span>
                        <div className="flex gap-4 text-xs font-medium">
                          <span className={cn(branch.avg_test_pass < 50 ? "text-rose-600" : "text-slate-500")}>
                            Pass: {branch.avg_test_pass.toFixed(1)}%
                          </span>
                          <span className={cn(branch.avg_attendance < 65 ? "text-rose-600" : "text-slate-500")}>
                            Attendance: {branch.avg_attendance.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Needs Attention
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="inline-flex p-3 bg-emerald-50 rounded-full">
                  <Ghost className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-500">No high-risk branches found. Excellent!</p>
              </div>
            )}
          </div>
        </div>

        {/* Syllabus Lag */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900">Syllabus Velocity Alerts</h3>
          </div>
          <div className="p-0">
            {criticalSyllabus.length > 0 ? (
              <ul className="divide-y divide-slate-50">
                {criticalSyllabus.map((branch: any) => (
                  <li key={branch.branch_code} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2 flex-1 mr-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-lg font-bold text-slate-900">{branch.branch_code}</span>
                          <span className="text-xs font-bold text-amber-700">{branch.syllabus_completion_percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: `${branch.syllabus_completion_percent}%` }}
                          />
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="inline-flex p-3 bg-emerald-50 rounded-full">
                  <Ghost className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-500">All branches are on track with syllabus.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-bold">Recommended Mitigation Strategies</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Academic</p>
            <p className="text-sm text-slate-300">Schedule compensatory sessions for branches below 30% coverage.</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xs font-bold text-cyan-400 uppercase mb-2">Participation</p>
            <p className="text-sm text-slate-300">Investigate laptop availability impact for attendance below 65%.</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xs font-bold text-rose-400 uppercase mb-2">Testing</p>
            <p className="text-sm text-slate-300">Conduct doubt resolution camps for branches with low test pass percentage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
