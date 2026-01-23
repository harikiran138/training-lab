"use client"

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DataEntryPage() {
  const [branches, setBranches] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    branch_code: '',
    week_no: '',
    sessions: 5,
    attendance: { avg_attendance_percent: 0 },
    tests: {
      avg_test_attendance_percent: 0,
      avg_test_pass_percent: 0
    },
    syllabus: { covered: 0, total: 100 }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [bRes, wRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/weeks')
        ]);
        const bData = await bRes.json();
        const wData = await wRes.json();
        setBranches(bData);
        setWeeks(wData.slice(0, 12)); // Show first 12 for choice
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          week_no: parseInt(formData.week_no as string),
          attendance: { avg_attendance_percent: parseFloat(formData.attendance.avg_attendance_percent as unknown as string) },
          tests: {
            avg_test_attendance_percent: parseFloat(formData.tests.avg_test_attendance_percent as unknown as string),
            avg_test_pass_percent: parseFloat(formData.tests.avg_test_pass_percent as unknown as string)
          },
          syllabus: {
            covered: parseFloat(formData.syllabus.covered as unknown as string),
            total: parseFloat(formData.syllabus.total as unknown as string)
          }
        })
      });

      if (res.ok) {
        setMessage({ text: 'Report saved successfully!', type: 'success' });
        // Refresh aggregate summary in background
        fetch('/api/summary?refresh=true');
      } else {
        const err = await res.json();
        setMessage({ text: `Error: ${err.error}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Weekly Data Entry</h2>
        <p className="text-slate-500">Record weekly CRT performance for a specific branch</p>
      </div>

      {message.text && (
        <div className={cn(
          "p-4 rounded-lg flex items-center gap-3",
          message.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Branch</label>
            <select 
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.branch_code}
              onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
            >
              <option value="">Select Branch</option>
              {branches.map((b: any) => (
                <option key={b.branch_code} value={b.branch_code}>{b.branch_code} - {b.branch_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Week</label>
            <select 
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.week_no}
              onChange={(e) => setFormData({ ...formData, week_no: e.target.value })}
            >
              <option value="">Select Week</option>
              {weeks.map((w: any) => (
                <option key={w.week_no} value={w.week_no}>{w.label} ({new Date(w.start_date).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Number of Sessions</label>
          <input 
            type="number" 
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.sessions}
            onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) })}
          />
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-lg space-y-4">
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Attendance Metrics</h4>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Average Attendance %</label>
            <input 
              type="number" step="0.1" max="100" min="0" required
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.attendance.avg_attendance_percent}
              onChange={(e) => setFormData({ 
                ...formData, 
                attendance: { avg_attendance_percent: parseFloat(e.target.value) } 
              })}
            />
          </div>
        </div>

        <div className="p-4 bg-cyan-50/50 rounded-lg space-y-4">
          <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Test Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Avg Test Attendance %</label>
              <input 
                type="number" step="0.1" max="100" min="0" required
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.tests.avg_test_attendance_percent}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tests: { ...formData.tests, avg_test_attendance_percent: parseFloat(e.target.value) } 
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Avg Test Pass %</label>
              <input 
                type="number" step="0.1" max="100" min="0" required
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.tests.avg_test_pass_percent}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tests: { ...formData.tests, avg_test_pass_percent: parseFloat(e.target.value) } 
                })}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Academic Progress</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Syllabus Covered</label>
              <input 
                type="number" step="1" min="0" required
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.syllabus.covered}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  syllabus: { ...formData.syllabus, covered: parseFloat(e.target.value) } 
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Total Syllabus</label>
              <input 
                type="number" step="1" min="1" required
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.syllabus.total}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  syllabus: { ...formData.syllabus, total: parseFloat(e.target.value) } 
                })}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Weekly Report'}
        </button>
      </form>
    </div>
  );
}
