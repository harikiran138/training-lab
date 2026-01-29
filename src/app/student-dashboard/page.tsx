"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Search, Settings, Calendar, CircleUser, ChevronDown, Loader2, GraduationCap, Laptop } from 'lucide-react';
import { StatsCard } from '@/components/student-dashboard/StatsCard';
import { PerformanceChart } from '@/components/student-dashboard/PerformanceChart';
import { DemographicsChart } from '@/components/student-dashboard/DemographicsChart';
import { StudentTable } from '@/components/student-dashboard/StudentTable';

export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/analytics/students');
            if (!response.ok) throw new Error('API request failed');
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError('System could not establish connection to the backend analytics engine.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <Loader2 className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-6 text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Synchronizing Intelligence...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans p-6">
                <div className="bg-[#0F1115] border border-red-900/30 p-10 rounded-[32px] max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">Interface Disrupt</h2>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={() => fetchData()}
                        className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                        Re-establish Connection
                    </button>
                </div>
            </div>
        );
    }

    const { kpis, demographics, trends } = data || {};

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-8 font-sans">
            {/* Top Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Universal search..."
                            className="w-full bg-[#0F1115] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="px-4 py-2 bg-[#0F1115] rounded-xl border border-white/5 hidden md:flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-gray-400 tracking-tight">
                            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                        </span>
                    </div>
                    <button className="p-3 bg-[#0F1115] border border-white/5 rounded-full hover:bg-gray-800 transition-colors">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-3 bg-[#0F1115] border border-white/5 rounded-full hover:bg-gray-800 transition-colors relative">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-black ring-4 ring-blue-500/20"></span>
                    </button>
                    <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border border-white/10 ring-4 ring-blue-600/10">
                        <CircleUser className="w-full h-full text-white/80" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="space-y-6">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">Systems Online, Anderson. 👋</h1>
                        <p className="text-gray-500 text-sm font-medium">Aggregated academic metrics from verified proxy sources.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button className="flex items-center gap-3 bg-[#0F1115] border border-white/5 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-gray-300 hover:bg-gray-800 transition-all shadow-xl">
                            Temporal Filter <ChevronDown className="w-4 h-4 text-blue-500" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Enrollment */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="Total Enrollment"
                            value={kpis?.total_enrollment?.toLocaleString() || "0"}
                            change="+2.4%"
                            trend="up"
                            description="Active institutional headcount"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Attendance */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="Avg. Attendance"
                            value={`${kpis?.avg_attendance_weekly ? Math.round(kpis.avg_attendance_weekly) : 0}%`}
                            change="-1.2%"
                            trend="down"
                            description="Global participation rate"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Performance Chart */}
                    <div className="md:col-span-2 row-span-2">
                        <PerformanceChart data={trends} />
                    </div>

                    {/* Departments */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="At Risk Students"
                            value={kpis?.at_risk_count || "0"}
                            change="Stable"
                            trend="neutral"
                            description="Attendance < 75%"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Pass Rate */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="Avg. Pass Rate"
                            value={`${Math.round(trends?.[trends.length - 1]?.average_score || 0)}%`}
                            change="+5.1%"
                            trend="up"
                            description="Examination success velocity"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Syllabus Detail */}
                    <div className="md:col-span-1 bg-[#0F1115] border border-white/5 rounded-[32px] p-7 flex flex-col justify-between group hover:border-blue-500/20 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <span className="text-4xl font-bold text-gray-100">{kpis?.laptop_coverage ? Math.round(kpis.laptop_coverage) : 0}%</span>
                            <p className="text-[11px] font-bold text-gray-500 mt-2 uppercase tracking-wider">Curriculum Velocity</p>
                        </div>
                    </div>

                    {/* Asset Detail */}
                    <div className="md:col-span-1 bg-[#0F1115] border border-white/5 rounded-[32px] p-7 flex flex-col justify-between group hover:border-purple-500/20 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Laptop className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <span className="text-4xl font-bold text-gray-100">{kpis?.laptop_coverage ? Math.round(kpis.laptop_coverage) : 0}%</span>
                            <p className="text-[11px] font-bold text-gray-500 mt-2 uppercase tracking-wider">Digital Coverage</p>
                        </div>
                    </div>

                    {/* Comparison Chart */}
                    <div className="md:col-span-2 lg:col-span-2 h-full">
                        <DemographicsChart data={demographics} />
                    </div>

                </div>

                {/* Bottom Section: Student List */}
                <div className="mt-12">
                    <StudentTable />
                </div>

                <div className="text-center pt-8 border-t border-white/5">
                    <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest leading-loose">
                        SECURE LOGS // DATA REFRESHED {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
                    </p>
                </div>

            </div>
        </div>
    );
}
