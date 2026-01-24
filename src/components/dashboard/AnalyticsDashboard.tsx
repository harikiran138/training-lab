"use client"

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Award, TrendingUp, BookOpen, Clock, 
  BrainCircuit, Zap, Monitor
} from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard({ reports, branches, weeks }: any) {
  // Aggregate data for overview
  const stats = useMemo(() => {
    if (!reports?.length) return null;
    
    const latestWeek = Math.max(...reports.map((r: any) => r.week_no));
    const latestReports = reports.filter((r: any) => r.week_no === latestWeek);
    
    const avgAttendance = latestReports.reduce((acc: any, r: any) => acc + r.attendance.avg_attendance_percent, 0) / latestReports.length;
    const avgPass = latestReports.reduce((acc: any, r: any) => acc + r.tests.avg_test_pass_percent, 0) / latestReports.length;
    const totalHours = latestReports.reduce((acc: any, r: any) => acc + (r.total_training_hours || 0), 0);
    const avgMotivation = latestReports.reduce((acc: any, r: any) => acc + (r.motivation?.avg_score || 0), 0) / latestReports.length;
    
    return {
      avgAttendance,
      avgPass,
      totalHours,
      avgMotivation,
      latestWeek
    };
  }, [reports]);

  // Data for Branch Comparison (Bar Chart)
  const branchData = useMemo(() => {
    if (!reports?.length) return [];
    const latestWeek = Math.max(...reports.map((r: any) => r.week_no));
    return reports
      .filter((r: any) => r.week_no === latestWeek)
      .map((r: any) => ({
        name: r.branch_code,
        attendance: r.attendance.avg_attendance_percent,
        pass: r.tests.avg_test_pass_percent,
        motivation: (r.motivation?.avg_score || 0) * 10 
      }));
  }, [reports]);

  // Trend Data (Line Chart)
  const trendData = useMemo(() => {
    if (!reports?.length) return [];
    const weeksMap = new Map();
    reports.forEach((r: any) => {
      if (!weeksMap.has(r.week_no)) {
        weeksMap.set(r.week_no, { week: `Week ${r.week_no}`, attendance: 0, pass: 0, count: 0 });
      }
      const w = weeksMap.get(r.week_no);
      w.attendance += r.attendance.avg_attendance_percent;
      w.pass += r.tests.avg_test_pass_percent;
      w.count += 1;
    });
    
    return Array.from(weeksMap.values())
      .map(w => ({
        ...w,
        attendance: Math.round(w.attendance / w.count),
        pass: Math.round(w.pass / w.count)
      }))
      .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
  }, [reports]);

  if (!stats) return <div className="p-12 text-center text-slate-500">No data available yet. Please enter report data.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-5 h-5 text-indigo-600" />} 
          label="Avg Attendance" 
          value={`${stats.avgAttendance.toFixed(1)}%`} 
          subtext="Latest Week"
          color="bg-indigo-50"
        />
        <StatCard 
          icon={<Award className="w-5 h-5 text-emerald-600" />} 
          label="Avg Pass Percent" 
          value={`${stats.avgPass.toFixed(1)}%`} 
          subtext="Assessment Score"
          color="bg-emerald-50"
        />
        <StatCard 
          icon={<Zap className="w-5 h-5 text-amber-600" />} 
          label="Motivation Score" 
          value={`${stats.avgMotivation.toFixed(1)}/10`} 
          subtext="Student Engagement"
          color="bg-amber-50"
        />
        <StatCard 
          icon={<Clock className="w-5 h-5 text-cyan-600" />} 
          label="Total Training" 
          value={`${stats.totalHours} hrs`} 
          subtext="Cumulative Time"
          color="bg-cyan-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Branch Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="attendance" name="Attendance %" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="pass" name="Pass %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Weekly Progress Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="attendance" name="Avg Attendance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                <Area type="monotone" dataKey="pass" name="Avg Pass" stroke="#10b981" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Personality Dev & Readings */}
         <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                Student Development
            </h3>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">Personality Score</span>
                        <span className="text-purple-600 font-bold">8.4/10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '84%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">Motivation Index</span>
                        <span className="text-amber-600 font-bold">7.2/10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                </div>
                <div className="pt-2">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <Monitor className="w-8 h-8 text-slate-400" />
                        <div>
                            <p className="text-xl font-bold text-slate-900">479</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Laptop Holders</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Detailed Table */}
         <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Branch Performance Overview</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Branch</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Attend %</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pass %</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {branchData.slice(0, 5).map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{b.name}</td>
                                <td className="px-6 py-4 text-slate-600">{b.attendance}%</td>
                                <td className="px-6 py-4 text-slate-600">{b.pass}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        b.attendance > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {b.attendance > 80 ? 'On Track' : 'Needs Focus'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400 uppercase tracking-wider">{subtext}</p>
    </div>
  );
}
