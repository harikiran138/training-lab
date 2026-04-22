'use client';

import React, { useState, useEffect } from 'react';
import { 
    BookOpen, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp,
    ChevronRight,
    Search,
    BookMarked,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyllabusLog {
    _id: string;
    branch_id: {
        branch_code: string;
        branch_name: string;
    };
    week_number: number;
    subject_name: string;
    module_name: string;
    topics_covered: string[];
    completion_percent: number;
    status: string;
    faculty_remarks: string;
}

export default function SyllabusPage() {
    const [logs, setLogs] = useState<SyllabusLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/syllabus');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error('Failed to fetch syllabus logs', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(l => 
        l.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.branch_id?.branch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.module_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const overallAvg = logs.length > 0 
        ? Math.round(logs.reduce((acc, curr) => acc + curr.completion_percent, 0) / logs.length) 
        : 0;

    return (
        <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header with Glassmorphism Effect */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 p-12 rounded-[40px] shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Curriculum Intelligence</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter italic">Syllabus Velocity</h2>
                        <p className="text-slate-400 font-medium max-w-md">Real-time tracking of academic progress across all departments and certification tracks.</p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="text-center bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 w-40">
                            <p className="text-4xl font-black text-white">{overallAvg}%</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Global Completion</p>
                        </div>
                        <div className="text-center bg-blue-600 shadow-xl shadow-blue-900/40 p-6 rounded-[32px] w-40">
                            <p className="text-4xl font-black text-white">{logs.filter(l => l.status === 'On-Track').length}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mt-1">Modules On-Track</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search & Filter Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm space-y-6">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-50 pb-4">Diagnostics Filter</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Filter by subject or branch..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Academic Year</label>
                            <select className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700">
                                <option>2025-26</option>
                                <option>2026-27</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[32px] text-white space-y-6 shadow-xl shadow-indigo-100">
                        <TrendingUp className="w-8 h-8 opacity-50" />
                        <h3 className="text-2xl font-black tracking-tighter">Academic Velocity</h3>
                        <p className="text-sm font-medium text-indigo-100/80">The current pace of curriculum delivery is 12% faster than last semester.</p>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all">View Full Report</button>
                    </div>
                </div>

                {/* Progress Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-40 bg-slate-50 rounded-[32px] animate-pulse" />
                        ))
                    ) : filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <div key={log._id} className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <BookMarked className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{log.subject_name}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{log.branch_id?.branch_code} • Week {log.week_number}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        log.status === 'On-Track' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        log.status === 'Lagging' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                        "bg-blue-50 text-blue-600 border-blue-100"
                                    )}>
                                        {log.status}
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Current Progress</span>
                                        <span className="text-indigo-600">{log.completion_percent}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${log.completion_percent}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-300" />
                                            <span className="text-xs font-medium text-slate-500">{log.module_name}</span>
                                        </div>
                                        {log.faculty_remarks && (
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                                <span className="text-xs italic text-slate-400 truncate max-w-xs">{log.faculty_remarks}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-slate-50 rounded-[40px] p-20 flex flex-col items-center justify-center border-4 border-dashed border-slate-100">
                            <BookOpen className="w-16 h-16 text-slate-200 mb-6" />
                            <p className="text-xl font-black text-slate-300 uppercase tracking-widest italic">Knowledge Base Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
