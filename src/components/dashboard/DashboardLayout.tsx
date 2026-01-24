"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  LayoutDashboard, 
  TrendingUp, 
  AlertTriangle, 
  Settings,
  Menu,
  X,
  Database,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Branch Analytics', href: '/branches', icon: BarChart3 },
  { name: 'Weekly Trends', href: '/trends', icon: TrendingUp },
  { name: 'Risk Analysis', href: '/risk', icon: AlertTriangle },
  { name: 'Data Entry', href: '/data-entry', icon: Database },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 fixed h-full z-30 transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            CRT Analytics
          </h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-6">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                  isActive 
                    ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                )} />
                {item.name}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 cursor-pointer transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            System Settings
          </div>
          <div className="mt-4 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">AD</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Admin User</span>
              <span className="text-xs text-slate-500">admin@crt.edu</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">
            CRT Analytics
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isMobileMenuOpen ? 
            <X className="w-6 h-6 text-slate-600 dark:text-slate-300" /> : 
            <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          }
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 w-3/4 max-w-xs h-full bg-white dark:bg-slate-950 shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-200">
             <div className="flex items-center justify-between mb-8">
               <span className="text-xl font-bold text-slate-900 dark:text-white">Menu</span>
               <button onClick={() => setIsMobileMenuOpen(false)}>
                 <X className="w-6 h-6 text-slate-500" />
               </button>
             </div>
             <nav className="space-y-2 flex-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" 
                        : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen transition-all duration-200">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
