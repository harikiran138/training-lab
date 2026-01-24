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

const COLORS = ['#1e40af', '#0369a1', '#0e7490', '#334155', '#475569']; // Professional Blues and Slates

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-700" />} 
          label="Avg Attendance" 
          value={`${stats.avgAttendance.toFixed(1)}%`} 
          subtext="Latest Week"
          color="bg-blue-50"
        />
        <StatCard 
          icon={<Award className="w-5 h-5 text-blue-700" />} 
          label="Avg Pass Percent" 
          value={`${stats.avgPass.toFixed(1)}%`} 
          subtext="Assessment Score"
          color="bg-blue-50"
        />
        <StatCard 
          icon={<Zap className="w-5 h-5 text-blue-700" />} 
          label="Motivation Score" 
          value={`${stats.avgMotivation.toFixed(1)}/10`} 
          subtext="Student Engagement"
          color="bg-blue-50"
        />
        <StatCard 
          icon={<Clock className="w-5 h-5 text-blue-700" />} 
          label="Total Training" 
          value={`${stats.totalHours} hrs`} 
          subtext="Cumulative Time"
          color="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Branch Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                <Bar dataKey="attendance" name="Attendance %" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="pass" name="Pass %" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Weekly Progress Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="attendance" name="Avg Attendance" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorAtt)" />
                <Area type="monotone" dataKey="pass" name="Avg Pass" stroke="#60a5fa" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Personality Dev & Readings */}
         <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4 text-blue-600" />
                Development
            </h3>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Personality Score</span>
                        <span className="text-blue-700 font-black">8.4/10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '84%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Motivation Index</span>
                        <span className="text-blue-700 font-black">7.2/10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                </div>
                <div className="pt-2">
                    <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <Monitor className="w-8 h-8 text-blue-300" />
                        <div>
                            <p className="text-xl font-black text-slate-900">479</p>
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Laptop Holders</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Detailed Table */}
         <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Branch Performance</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Top 5 Records</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attend %</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass %</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {branchData.slice(0, 5).map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 font-black text-slate-900">{b.name}</td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{b.attendance}%</td>
                                <td className="px-6 py-4 text-blue-600 font-bold">{b.pass}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                                        b.attendance > 80 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {b.attendance > 80 ? 'Target Met' : 'Review'}
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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{subtext}</p>
    </div>
  );
}
