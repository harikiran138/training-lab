"use client"

import React from 'react';
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
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Branch Analytics', href: '/branches', icon: BarChart3 },
  { name: 'Weekly Trends', href: '/trends', icon: TrendingUp },
  { name: 'Risk Analysis', href: '/risk', icon: AlertTriangle },
  { name: 'Data Entry', href: '/data-entry', icon: Database },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white fixed h-full z-30">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            CRT Analytics
          </h1>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all relative"
            >
              <Database className="w-5 h-5" /> {/* Using Database as a bell-like icon or just swap to Bell if available */}
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-full ml-4 top-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-4 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="px-4 pb-2 border-b border-slate-50 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Alerts</p>
                </div>
                <div className="max-h-64 overflow-y-auto px-2">
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <Link
                        key={i}
                        href="/risk"
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 hover:bg-slate-50 rounded-xl transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900">{n.branch_code}: {n.type}</p>
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

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation
            .filter(item => {
              if (!user) return true; // Show all while loading
              if (user.role === 'admin') return true;
              // Restricted items for faculty/viewer
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
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex flex-col gap-2">
            {user && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/50 border border-slate-800 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-600/20 transition-all cursor-pointer w-full"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === '/settings' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white h-16 flex items-center justify-between px-6 z-40 border-b border-slate-800">
        <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          CRT Analytics
        </h1>
        <div className="flex items-center gap-4">
          <button className="relative p-2" onClick={() => setShowNotifications(!showNotifications)}>
            <Database className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border border-slate-900" />
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900 z-50 pt-20 px-6">
          <nav className="space-y-4">
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
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium",
                      isActive ? "bg-indigo-600 text-white" : "text-slate-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 pt-24 lg:pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
