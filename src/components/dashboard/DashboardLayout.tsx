"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Database,
  ChevronLeft,
  ChevronRight,
  Activity,
  Server,
  ShieldCheck,
  Menu,
  X,
  Layers,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Mission Control', href: '/', icon: LayoutDashboard },
  { name: 'CRT Performance', href: '/crt/attendance', icon: BarChart3 },
  { name: 'Data Management', href: '/data-entry', icon: Database },
  { name: 'System Logs', href: '/logs', icon: Activity },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* SOFT PREMIUM HEADER */}
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-50 sticky top-0 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="hidden sm:inline">System Status:</span> <span className="text-blue-600">Optimal</span>
          </div>
          <div className="hidden md:flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-8">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Security:</span> <span className="text-blue-600">Enterprise Verified</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
             <div className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
                Institutional Intel v4.0
             </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* SOFT ROUNDED SIDEBAR */}
        <aside 
          className={cn(
            "hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-500 sticky top-14 h-[calc(100vh-3.5rem)] z-40",
            isSidebarCollapsed ? "w-20" : "w-80"
          )}
        >
          {/* Brand Identity */}
          <div className="p-10 flex flex-col items-center">
            <div className={cn(
                "bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center transition-all duration-500 transform hover:rotate-3",
                isSidebarCollapsed ? "w-12 h-12 text-xl" : "w-20 h-20 text-4xl mb-6"
            )}>
              CA
            </div>
            {!isSidebarCollapsed && (
              <div className="text-center animate-in fade-in zoom-in-95 duration-500">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">CRT ANALYTICS</h1>
                <p className="text-[10px] text-blue-600 font-bold tracking-[0.3em] mt-1.5 uppercase opacity-80">Full Spectrum Intelligence</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 transition-all duration-300 rounded-2xl group relative overflow-hidden",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1" 
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50",
                    isSidebarCollapsed ? "justify-center" : ""
                  )}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                  {!isSidebarCollapsed && (
                    <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
                  )}
                  {isActive && !isSidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full ml-1 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Context */}
          {!isSidebarCollapsed && (
              <div className="p-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300 group">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-blue-600 text-xs shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">ADM</div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">Administrator</p>
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter opacity-70">Privileged Access</p>
                      </div>
                  </div>
              </div>
          )}

          {/* Collapse Controller */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-6 border-t border-slate-100 flex justify-center hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all duration-300"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <div className="flex gap-3 items-center text-[10px] font-bold uppercase tracking-[0.4em] opacity-40"><ChevronLeft size={16} /> Minimize Layout</div>}
          </button>
        </aside>

        {/* MOBILE ARCHITECTURE */}
        <div className="lg:hidden fixed top-14 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">CA</div>
              <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Institutional Hub</span>
           </div>
           <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all active:scale-95"
            >
             {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-28 z-[60] bg-white p-8 lg:hidden animate-in slide-in-from-top-12 duration-500">
            <nav className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-6 px-8 py-6 rounded-2xl text-sm font-black uppercase tracking-widest transition-all",
                    pathname === item.href 
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                        : "text-slate-500 bg-slate-50 border border-slate-100"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* MAIN APPLICATION CORE */}
        <main className="flex-1 min-w-0 bg-slate-50 relative overflow-y-auto">
          <div className="p-8 md:p-12 lg:p-16 pt-32 lg:pt-16 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
             {children}
          </div>
          
          {/* DECORATIVE ELEMENTS */}
          <div className="fixed -bottom-20 -right-20 p-10 pointer-events-none opacity-[0.05] select-none rotate-12">
              <LayoutGrid className="w-96 h-96 text-blue-600" />
          </div>
        </main>
      </div>
    </div>
  );
}
