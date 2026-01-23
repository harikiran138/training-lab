import React from 'react';
import { 
  BarChart, 
  Search, 
  ArrowUpRight, 
  Filter,
  Users,
  Award
} from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import AggregateSummary from '@/models/AggregateSummary';
import Branch from '@/models/Branch';
import { cn } from '@/lib/utils';

async function getBranchData() {
  await dbConnect();
  const summaries = await AggregateSummary.find({}).lean();
  const branches = await Branch.find({}).lean();
  
  const branchMap: any = {};
  branches.forEach((b: any) => {
    branchMap[b.branch_code] = b;
  });

  return summaries.map((s: any) => ({
    ...s,
    details: branchMap[s.branch_code] || {}
  }));
}

export default async function BranchesPage() {
  const data = await getBranchData();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Branch Analytics</h2>
          <p className="text-slate-500">Comparative analysis of performance across departments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search branch..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((branch) => (
          <div key={branch.branch_code} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
            <div className="p-6 border-b border-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{branch.branch_code}</h3>
                  <p className="text-xs text-slate-500">{branch.details.branch_name}</p>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold",
                  branch.performance_grade.startsWith('A') ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  Grade {branch.performance_grade}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
                  <p className="text-xl font-bold text-slate-900">{branch.avg_attendance.toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Test Pass</p>
                  <p className="text-xl font-bold text-slate-900">{branch.avg_test_pass.toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Syllabus Coverage</span>
                  <span className="text-indigo-600 font-bold">{branch.syllabus_completion_percent.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${branch.syllabus_completion_percent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  {branch.details.total_students} Students
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Award className="w-3.5 h-3.5" />
                  {branch.total_weeks} Weeks
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              View Detailed Report
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
