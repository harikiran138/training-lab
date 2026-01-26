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
  Zap
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
      
      {/* PROFESSIONAL SYSTEM TICKER */}
      <header className="h-12 bg-white border-b-2 border-slate-900 flex items-center justify-between px-6 z-50 sticky top-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            Node: <span className="text-blue-800">Operational</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-100 pl-6">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Security: <span className="text-blue-800">Level 4 Verified</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
             <div className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 border border-blue-100 italic">
                Institutional Intel v3.5
             </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* SHARP INSTITUTIONAL SIDEBAR */}
        <aside 
          className={cn(
            "hidden lg:flex flex-col bg-blue-800 border-r-4 border-slate-900 transition-all duration-300 sticky top-12 h-[calc(100vh-3rem)] z-40 shadow-[10px_0px_30px_rgba(0,0,0,0.05)]",
            isSidebarCollapsed ? "w-20" : "w-72"
          )}
        >
          {/* Brand Identity */}
          <div className="p-8 border-b-2 border-blue-900/50 flex flex-col items-center">
            <div className={cn(
                "bg-white text-blue-800 font-black shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center transition-all",
                isSidebarCollapsed ? "w-10 h-10 text-xl" : "w-16 h-16 text-3xl mb-4"
            )}>
              CA
            </div>
            {!isSidebarCollapsed && (
              <div className="text-center">
                <h1 className="text-sm font-black text-white tracking-[0.3em] uppercase italic">Institutional</h1>
                <p className="text-[9px] text-blue-200 font-black tracking-widest mt-1 opacity-60 uppercase">Advanced Performance Hub</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-10 px-4 space-y-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-all group relative",
                    isActive 
                      ? "bg-white text-blue-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]" 
                      : "text-blue-100 hover:text-white hover:bg-blue-700/50",
                    isSidebarCollapsed ? "justify-center" : ""
                  )}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-blue-800" : "group-hover:scale-110 transition-transform")} />
                  {!isSidebarCollapsed && (
                    <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                  )}
                  {isActive && !isSidebarCollapsed && (
                    <Zap className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white fill-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User / Footer Context */}
          {!isSidebarCollapsed && (
              <div className="p-8 border-t border-blue-900/50">
                  <div className="bg-blue-900/40 p-5 rounded-none border border-blue-700 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-800 border-2 border-white/20 flex items-center justify-center font-black text-white text-xs shadow-lg">ADM</div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">Administrator</p>
                          <p className="text-[9px] font-medium text-blue-300 uppercase tracking-tighter opacity-70">Privileged Access</p>
                      </div>
                  </div>
              </div>
          )}

          {/* Collapse Controller */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-6 border-t border-blue-900/50 flex justify-center hover:bg-blue-700 text-blue-200 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <div className="flex gap-3 items-center text-[10px] font-black uppercase tracking-[0.4em] opacity-50"><ChevronLeft size={16} /> Hide Interface</div>}
          </button>
        </aside>

        {/* MOBILE ARCHITECTURE */}
        <div className="lg:hidden fixed top-12 left-0 right-0 h-16 bg-white border-b-2 border-slate-900 flex items-center justify-between px-6 z-40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-800 text-white font-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">CA</div>
              <span className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Institutional Hub</span>
           </div>
           <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-3 bg-slate-100 text-slate-800 border-2 border-slate-900 active:translate-x-0.5 active:translate-y-0.5"
            >
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-28 z-[60] bg-blue-800 p-8 lg:hidden animate-in slide-in-from-top-12">
            <nav className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-6 px-8 py-6 text-sm font-black uppercase tracking-widest",
                    pathname === item.href 
                        ? "bg-white text-blue-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]" 
                        : "text-blue-100 border-b border-blue-700"
                  )}
                >
                  <item.icon size={24} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* MAIN APPLICATION CORE */}
        <main className="flex-1 min-w-0 bg-slate-50 relative">
          <div className="p-6 md:p-12 lg:p-16 pt-32 lg:pt-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
             {children}
          </div>
          
          {/* BACKGROUND DECORATIVE ELEMENTS */}
          <div className="fixed bottom-0 right-0 p-10 pointer-events-none opacity-[0.03] select-none">
              <Layers className="w-96 h-96 text-slate-900" />
          </div>
        </main>
      </div>
    </div>
  );
}
