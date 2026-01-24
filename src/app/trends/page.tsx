"use client"

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { Sparkles, TrendingUp, Filter, BarChart3, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrendsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [compareBranch, setCompareBranch] = useState<string>('None');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    async function initData() {
      try {
        const [reportsRes, insightsRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/analytics/insights')
        ]);

        const reportsData = await reportsRes.json();
        const insightsData = await insightsRes.json();

        setReports(reportsData);
        setInsights(insightsData.insights || []);

        // Extract unique branches
        const uniqueBranches = Array.from(new Set(reportsData.map((r: any) => r.branch_code))) as string[];
        setBranches(uniqueBranches.sort());

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingInsights(false);
      }
    }
    initData();
  }, []);

  const chartData = useMemo(() => {
    if (reports.length === 0) return [];

    const weeks = Array.from(new Set(reports.map(r => r.week_no))).sort((a, b) => a - b);

    return weeks.map(weekNo => {
      const weekReports = reports.filter(r => r.week_no === weekNo);

      const getStats = (branch: string) => {
        const filtered = branch === 'All'
          ? weekReports
          : weekReports.filter(r => r.branch_code === branch);

        if (filtered.length === 0) return { attendance: null, pass: null, score: null };

        return {
          attendance: parseFloat((filtered.reduce((sum, r) => sum + r.attendance.avg_attendance_percent, 0) / filtered.length).toFixed(1)),
          pass: parseFloat((filtered.reduce((sum, r) => sum + r.tests.avg_test_pass_percent, 0) / filtered.length).toFixed(1)),
          score: parseFloat((filtered.reduce((sum, r) => sum + r.computed.overall_score, 0) / filtered.length).toFixed(1))
        };
      };

      const primary = getStats(selectedBranch);
      const comparison = compareBranch !== 'None' ? getStats(compareBranch) : null;

      return {
        week: `Week ${weekNo}`,
        attendance: primary.attendance,
        pass: primary.pass,
        score: primary.score,
        comp_attendance: comparison?.attendance,
        comp_pass: comparison?.pass,
        comp_score: comparison?.score
      };
    });
  }, [reports, selectedBranch, compareBranch]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Laboratory</h2>
          <p className="text-slate-500">Multivariate analysis and AI-driven performance intelligence</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filters</span>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Branches</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="w-px h-4 bg-slate-100" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Compare With</span>
            <select
              value={compareBranch}
              onChange={(e) => setCompareBranch(e.target.value)}
              className="bg-transparent text-sm font-bold text-indigo-600 outline-none cursor-pointer"
            >
              <option value="None">None</option>
              {branches.filter(b => b !== selectedBranch).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI Insights Ribbon */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Sparkles className="w-8 h-8 text-indigo-100" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Gemini Intelligence Insights
              <span className="px-2 py-0.5 bg-indigo-500 text-[10px] rounded-full uppercase tracking-widest">Live Analysis</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingInsights ? (
                [1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)
              ) : (
                insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
                    <p className="text-sm font-medium text-indigo-50 leading-snug">{insight}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Performance Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Test Performance Dynamics</h3>
              <p className="text-sm text-slate-500 mt-1">Comparing pass rates and attendance throughput</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{selectedBranch} Pass %</span>
              </div>
              {compareBranch !== 'None' && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">{compareBranch} Pass %</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  {compareBranch !== 'None' && (
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                />
                <Area
                  type="monotone"
                  dataKey="pass"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorMain)"
                  name={`${selectedBranch} Pass %`}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 4 }}
                />
                {compareBranch !== 'None' && (
                  <Area
                    type="monotone"
                    dataKey="comp_pass"
                    stroke="#f43f5e"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorComp)"
                    name={`${compareBranch} Pass %`}
                    dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                  />
                )}
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'Goal', fill: '#10b981', fontSize: 10, fontWeight: 700 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Metrics Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold text-slate-800 tracking-tight">Attendance Stability</h4>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Weekly %</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={false}
                    name={selectedBranch}
                  />
                  {compareBranch !== 'None' && (
                    <Line
                      type="monotone"
                      dataKey="comp_attendance"
                      stroke="#94a3b8"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={false}
                      name={compareBranch}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold text-slate-800 tracking-tight">Overall Performance Index</h4>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="score"
                    stroke="#1e293b"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#1e293b' }}
                    name={selectedBranch}
                  />
                  {compareBranch !== 'None' && (
                    <Line
                      type="stepAfter"
                      dataKey="comp_score"
                      stroke="#cbd5e1"
                      strokeWidth={4}
                      dot={{ r: 4, fill: '#cbd5e1' }}
                      name={compareBranch}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
