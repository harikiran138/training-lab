"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Settings,
  Menu,
  X,
  Database,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ChevronRight
=======
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
  Building2,
  Presentation,
  CloudUpload
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresentationMode } from '@/components/presentation/PresentationMode';

const sidebarLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'CRT Attendance', href: '/crt/attendance', icon: BarChart3 },
  { name: 'Data Entry', href: '/data-entry', icon: PlusCircle },
  { name: 'Uploads', href: '/uploads', icon: CloudUpload },
  { name: 'Reports', href: '/reports', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
<<<<<<< HEAD
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Failed to fetch user:', err));

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.data);
      })
      .catch(err => console.error('Failed to fetch notifications:', err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 fixed h-full z-30 transition-all duration-300">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              CRT Analytics
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all relative"
            >
              <Database className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-full ml-4 top-0 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-4 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="px-4 pb-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Alerts</p>
                </div>
                <div className="max-h-64 overflow-y-auto px-2">
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <Link
                        key={i}
                        href="/risk"
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.branch_code}: {n.type}</p>
                            <p className="text-[10px] text-slate-500 truncate">{n.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 text-center py-4">No new alerts</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-6">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </div>
          {navigation
            .filter(item => {
              if (!user) return true;
              if (user.role === 'admin') return true;
              if (item.name === 'Risk Analysis' || item.name === 'Weekly Trends') return false;
              return true;
            })
            .map((item) => {
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
          <div className="flex flex-col gap-2">
            {user ? (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400">Loading user...</div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>

            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === '/settings' ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>
=======
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);

  return (
    <div className="min-h-screen bg-[#EFF6FF] text-[#374151] selection:bg-blue-100">
      
      {/* PRESENTATION MODE WRAPPER */}
      <PresentationMode 
        isOpen={isPresenting} 
        onClose={() => setIsPresenting(false)}
        title="Institutional Review"
        subtitle="Meeting Presentation Mode v5.0"
      >
        {children}
      </PresentationMode>
      
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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
        </div>

<<<<<<< HEAD
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">
            CRT Analytics
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2" onClick={() => setShowNotifications(!showNotifications)}>
            <Database className="w-5 h-5 text-slate-400" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border border-white dark:border-slate-950" />
            )}
          </button>
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
              {navigation
                .filter(item => {
                  if (!user) return true;
                  if (user.role === 'admin') return true;
                  if (item.name === 'Risk Analysis' || item.name === 'Weekly Trends') return false;
                  return true;
                })
                .map((item) => {
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
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
=======
        <div className="flex items-center gap-8">
            <button 
                onClick={() => setIsPresenting(true)}
                className="hidden lg:flex items-center gap-3 px-6 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-bold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-all group"
                title="Meeting Presentation Mode"
            >
                <Presentation className="w-4 h-4" />
                PRESENTATION MODE
            </button>

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
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
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
