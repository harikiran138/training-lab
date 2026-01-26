"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  LayoutDashboard, 
  Settings, 
  PlusCircle, 
  Users,
  Menu,
  X,
  Bell,
  UserCircle,
  Calendar,
  LogOut,
  ChevronDown,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'CRT Attendance', href: '/crt/attendance', icon: BarChart3 },
  { name: 'Data Entry', href: '/data-entry', icon: PlusCircle },
  { name: 'Reports', href: '/reports', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#EFF6FF] text-[#374151] selection:bg-blue-100">
      
      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-blue-100 z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-blue-50 rounded-lg text-blue-900 transition-colors"
                title="Toggle Sidebar"
            >
                <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-l border-blue-50 pl-4">
                <div className="bg-[#1E3A8A] p-2 rounded flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-[18px] font-extrabold text-[#1E3A8A] tracking-tighter uppercase">
                    Institutional <span className="font-light opacity-60">Analytics</span>
                </h1>
            </div>
        </div>

        <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-3 bg-blue-50/50 border border-blue-100 px-4 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                <span className="text-xs font-bold text-[#1E3A8A]">W1 (20 Jan - 26 Jan)</span>
                <ChevronDown className="w-3 h-3 text-[#1E3A8A]" />
            </div>
            
            <div className="flex items-center gap-4 border-l border-blue-50 pl-8">
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden xl:block">
                        <p className="text-[12px] font-bold text-slate-900 leading-none">Admin Hub</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">T&P Department</p>
                    </div>
                    <div className="w-9 h-9 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white ring-2 ring-blue-50 group-hover:ring-blue-100 transition-all">
                        <UserCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
      </header>

      <div className="flex pt-16 h-[calc(100vh-64px)] overflow-hidden">
        {/* SIDEBAR (Collapsible) */}
        <aside 
          className={cn(
            "h-full bg-white border-r border-blue-50 transition-all duration-300 ease-in-out z-40 flex flex-col pt-8",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <nav className="flex-grow px-3 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] font-semibold transition-all group",
                    isActive 
                      ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-100" 
                      : "text-slate-500 hover:bg-blue-50 hover:text-[#1E3A8A]"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-[#1E3A8A]")} />
                  {sidebarOpen && <span className="truncate">{link.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-blue-50">
             <button className={cn(
               "flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all group",
               !sidebarOpen && "justify-center"
             )}>
                <LogOut className="w-5 h-5" />
                {sidebarOpen && <span>Sign Out</span>}
             </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8 mb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
