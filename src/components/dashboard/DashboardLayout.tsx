"use client";

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
  Building2,
  Presentation,
  CloudUpload,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresentationMode } from '@/components/presentation/PresentationMode';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Student Analytics', href: '/student-dashboard', icon: GraduationCap },
  { name: 'CRT Attendance', href: '/crt/attendance', icon: BarChart3 },
  { name: 'Data Entry', href: '/data-entry', icon: PlusCircle },
  { name: 'Uploads', href: '/uploads', icon: CloudUpload },
  { name: 'Reports', href: '/reports', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/login') {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, router]);

  if (loading && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1E3A8A] opacity-40">Authenticating Institutional Access...</p>
      </div>
    );
  }

  // Handle case where we are on login page but layout is still wrapping it
  if (pathname === '/login') return <>{children}</>;

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

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
        </div>

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
                <p className="text-[12px] font-bold text-slate-900 leading-none">{user?.name || 'Institutional Admin'}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium italic uppercase tracking-wider">{user?.role || 'Master Auditor'}</p>
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
            <button 
              onClick={handleLogout}
              className={cn(
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
