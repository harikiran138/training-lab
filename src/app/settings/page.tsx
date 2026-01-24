"use client"

import React, { useState, useEffect } from 'react';
import {
    User as UserIcon,
    Shield,
    Building2,
    Save,
    Loader2,
    CheckCircle2,
    Users,
    Search,
    ChevronRight,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const [meRes, userRes, branchRes] = await Promise.all([
                    fetch('/api/auth/me'),
                    fetch('/api/users'),
                    fetch('/api/branches')
                ]);

                const meData = await meRes.json();
                if (meData.success) setUser(meData.user);

                if (meData.user?.role === 'admin') {
                    const userData = await userRes.json();
                    if (userData.success) setAllUsers(userData.data);

                    const branchData = await branchRes.json();
                    setBranches(branchData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleUpdateAssignment = async (userId: string, assignedBranches: string[]) => {
        setSaving(userId);
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, branches: assignedBranches })
            });
            if (res.ok) {
                setAllUsers(users => users.map(u =>
                    u._id === userId ? { ...u, branches: assignedBranches } : u
                ));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update assignment');
        } finally {
            setSaving(null);
        }
    };

    const toggleBranch = (userId: string, currentBranches: string[], branchCode: string) => {
        const isAssigned = currentBranches.includes(branchCode);
        const newBranches = isAssigned
            ? currentBranches.filter(b => b !== branchCode)
            : [...currentBranches, branchCode];
        handleUpdateAssignment(userId, newBranches);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
    );

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).filter(u => u.role === 'faculty');

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h2>
                <p className="text-slate-500">Manage user profiles and branch access permissions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600" />
                        <div className="px-8 pb-8 -mt-12 text-center">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mx-auto mb-4">
                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-black">
                                    {user?.name.charAt(0)}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{user?.email}</p>

                            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 rounded-full border border-slate-100 mb-6">
                                <Shield className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{user?.role}</span>
                            </div>

                            <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" />
                                Change Password
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-indigo-400" />
                            <h4 className="font-bold">Access Level</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {user?.role === 'admin'
                                ? "Full administrative access. You can manage branch assignments, override calculations, and view institutional trends."
                                : "Faculty access. Your view is restricted to branches assigned to you by the administrator."}
                        </p>
                    </div>
                </div>

                {/* Admin Management Panel */}
                {user?.role === 'admin' && (
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                    <h3 className="text-xl font-bold text-slate-900">Faculty Assignments</h3>
                                </div>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1">
                                {filteredUsers.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {filteredUsers.map((faculty) => (
                                            <div key={faculty._id} className="p-8 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-slate-900">{faculty.name}</p>
                                                            {saving === faculty._id && <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium">{faculty.email}</p>
                                                    </div>

                                                    <div className="flex-1 max-w-md">
                                                        <div className="flex flex-wrap gap-2">
                                                            {branches.map(branch => (
                                                                <button
                                                                    key={branch.branch_code}
                                                                    onClick={() => toggleBranch(faculty._id, faculty.branches || [], branch.branch_code)}
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                                                                        faculty.branches?.includes(branch.branch_code)
                                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                                                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                                                    )}
                                                                >
                                                                    {branch.branch_code}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center space-y-4">
                                        <Users className="w-12 h-12 text-slate-200 mx-auto" />
                                        <p className="text-slate-400 font-medium">No faculty members found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
