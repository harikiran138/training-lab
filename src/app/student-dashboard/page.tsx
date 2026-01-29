"use client";

import { Bell, Search, Settings, Calendar, CircleUser, ChevronDown } from 'lucide-react';
import { StatsCard } from '@/components/student-dashboard/StatsCard';
import { PerformanceChart } from '@/components/student-dashboard/PerformanceChart';
import { DemographicsChart } from '@/components/student-dashboard/DemographicsChart';
import { StudentTable } from '@/components/student-dashboard/StudentTable';

export default function StudentDashboard() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-8 font-sans">
            {/* Top Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search query..."
                            className="w-full bg-[#0F1115] border-none rounded-2xl py-3 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-700"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <span className="text-sm font-medium text-gray-400 hidden md:block">Today, Mon 22 Nov</span>
                    <button className="p-3 bg-[#0F1115] rounded-full hover:bg-gray-800 transition-colors">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-3 bg-[#0F1115] rounded-full hover:bg-gray-800 transition-colors relative">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F1115]"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-[#0F1115]">
                        {/* Placeholder Avatar */}
                        <CircleUser className="w-full h-full text-white/80" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="space-y-6">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Hello, Prof. Anderson! 👋</h1>
                        <p className="text-gray-400 text-sm">Here's what's happening in your department today.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button className="flex items-center gap-2 bg-[#0F1115] px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800">
                            This month <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Row 1, Col 1: Total Revenue (Total Students) */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="Total Enrollment"
                            value="1,245"
                            change="+12%"
                            trend="up"
                            description="This semester vs last"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Row 1, Col 2: Total Orders (Avg Attendance) */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="Avg. Attendance"
                            value="85%"
                            change="-2.4%"
                            trend="down"
                            description="This week vs last"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Row 1, Col 3-4: Revenue Chart (Attendance Trends) */}
                    <div className="md:col-span-2 row-span-2">
                        <PerformanceChart />
                    </div>

                    {/* Row 2, Col 1: Total Visitors (Active Sections) */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="Active Sections"
                            value="42"
                            change="+5.6%"
                            trend="up"
                            description="This semester vs last"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Row 2, Col 2: Net Profit (Avg GPA) */}
                    <div className="md:col-span-1">
                        <StatsCard
                            title="Average GPA"
                            value="3.42"
                            change="+1.2%"
                            trend="up"
                            description="This semester vs last"
                            className="bg-[#0F1115]"
                        />
                    </div>

                    {/* Row 3, Col 1: Orders (At Risk) */}
                    <div className="md:col-span-1 lg:col-span-1 bg-[#0F1115] rounded-3xl p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/10 rounded-full text-white inline-flex">
                                <span className="text-xs">⚠️</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-4xl font-bold">12</span>
                            <span className="text-xl font-normal text-gray-400 ml-2">students</span>
                            <p className="text-xs text-gray-500 mt-2">12 students are at risk of failing.</p>
                        </div>
                    </div>

                    {/* Row 3, Col 2: Customers (Faculty) */}
                    <div className="md:col-span-1 lg:col-span-1 bg-[#0F1115] rounded-3xl p-6 flex flex-col justify-between">
                        <div className="lex justify-center items-center">
                            {/* Placeholder for small chart or visual */}
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <CircleUser />
                            </div>
                        </div>
                        <div>
                            <span className="text-4xl font-bold">34</span>
                            <span className="text-xl font-normal text-gray-400 ml-2">faculty</span>
                            <p className="text-xs text-gray-500 mt-2">34 active faculty members.</p>
                        </div>
                    </div>

                    {/* Row 3, Col 3-4: Sales by Category (Demographics) */}
                    <div className="md:col-span-2 lg:col-span-2 h-full">
                        <DemographicsChart />
                    </div>

                </div>

                {/* Bottom Section: Order List (Student List) */}
                <div className="mt-8">
                    <StudentTable />
                </div>

            </div>
        </div>
    );
}
