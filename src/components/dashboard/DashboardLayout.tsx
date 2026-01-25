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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScientificCard } from '@/components/ui/ScientificCard';

const navigation = [
  { name: 'Mission Control', href: '/', icon: LayoutDashboard },
  { name: 'Branch Performance', href: '/branches', icon: BarChart3 },
  { name: 'Trend Analysis', href: '/trends', icon: TrendingUp },
  { name: 'Risk Assessment', href: '/risk', icon: AlertTriangle },
  { name: 'Data Ingestion', href: '/data-entry', icon: Database },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* System Status Header */}
      <header className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40 sticky top-0">
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-500" />
            SYSTEM: <span className="text-cyan-400">ONLINE</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5 border-l border-slate-800 pl-4">
            <Server className="w-3 h-3 text-emerald-500" />
            DB_CONNECTION: <span className="text-emerald-400">STABLE</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5 border-l border-slate-800 pl-4">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            SECURITY: <span className="text-indigo-400">ENFORCED</span>
          </span>
        </div>
        <div className="text-xs font-mono text-slate-500">
          V2.4.0-DETERMINISTIC
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside 
          className={cn(
            "hidden lg:flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 sticky top-10 h-[calc(100vh-2.5rem)]",
            isSidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Brand */}
          <div className="h-16 flex items-center px-4 border-b border-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-900/20">
                CA
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-sm font-bold text-slate-100 tracking-wider">CRT ANALYTICS</h1>
                  <p className="text-[10px] text-cyan-500 font-mono tracking-widest">NOISE: 0% | MATH: 100%</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded hover:bg-slate-800/50 transition-all group relative",
                    isActive ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-slate-200",
                    isSidebarCollapsed ? "justify-center" : ""
                  )}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "group-hover:text-cyan-200")} />
                  {!isSidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  {isActive && !isSidebarCollapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-4 border-t border-slate-900 flex justify-center hover:bg-slate-900 text-slate-500 hover:text-cyan-400 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <div className="flex gap-2 items-center text-xs uppercase tracking-widest"><ChevronLeft size={16} /> Collapse Menu</div>}
          </button>
        </aside>

        {/* Mobile Header & Menu */}
        <div className="lg:hidden fixed top-10 left-0 right-0 h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-30">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center text-white font-bold">CA</div>
              <span className="font-bold text-slate-100">CRT Analytics</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-24 z-50 bg-slate-950 p-4 lg:hidden animate-in slide-in-from-top-10">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-lg bg-slate-900 text-slate-300",
                    pathname === item.href && "border border-cyan-500/30 text-cyan-400 bg-slate-800"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 bg-slate-950 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
