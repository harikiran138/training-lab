"use client"

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, Filter } from 'lucide-react';

export default function TrendsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/reports');
        const reports = await res.json();
        
        // Transform reports into weekly combined data for chart
        const weeklyMap: any = {};
        reports.forEach((r: any) => {
          if (!weeklyMap[r.week_no]) {
            weeklyMap[r.week_no] = { 
              week: `Week ${r.week_no}`, 
              attendance: 0, 
              pass: 0, 
              score: 0,
              count: 0 
            };
          }
          weeklyMap[r.week_no].attendance += r.attendance.avg_attendance_percent;
          weeklyMap[r.week_no].pass += r.tests.avg_test_pass_percent;
          weeklyMap[r.week_no].score += r.computed.overall_score;
          weeklyMap[r.week_no].count += 1;
        });

        const chartData = Object.values(weeklyMap).map((w: any) => ({
          ...w,
          attendance: parseFloat((w.attendance / w.count).toFixed(1)),
          pass: parseFloat((w.pass / w.count).toFixed(1)),
          score: parseFloat((w.score / w.count).toFixed(1))
        })).sort((a: any, b: any) => {
          return parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]);
        });

        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading Trends...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Weekly Performance Trends</h2>
        <p className="text-slate-500">Historical analysis of institution-wide metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Attendance vs Test Pass Trend */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Attendance vs. Test Performance
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Attendance
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="w-3 h-3 rounded-full bg-cyan-500"></span> Test Pass %
              </span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                <Area type="monotone" dataKey="pass" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorPass)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Score Trend */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Overall Performance Index</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  name="Institution Index" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
