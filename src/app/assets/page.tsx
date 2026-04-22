'use client';

import React, { useState, useEffect } from 'react';
import { 
    Laptop, 
    Search, 
    Plus, 
    Filter, 
    Download, 
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    Clock,
    Shield,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Asset {
    _id: string;
    student_id: {
        name: string;
        roll_no: string;
        branch: string;
    };
    device_type: string;
    device_serial: string;
    status: string;
    allocated_date: string;
    condition_remarks: string;
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/assets');
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (err) {
            console.error('Failed to fetch assets', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(a => 
        a.student_id?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.student_id?.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.device_serial.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: assets.length,
        allocated: assets.filter(a => a.status === 'Allocated').length,
        repair: assets.filter(a => a.status === 'In-Repair').length,
        lost: assets.filter(a => a.status === 'Lost').length,
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Asset Inventory</h2>
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 mt-2">
                        <span className="w-8 h-[2px] bg-blue-600"></span>
                        Institutional Logistics Hub
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border-2 border-slate-100 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-blue-800 transition-all shadow-xl shadow-blue-100">
                        <Plus className="w-4 h-4" />
                        Provision Asset
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Assets', value: stats.total, icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { label: 'Active Allocation', value: stats.allocated, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'In Repair', value: stats.repair, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Critical / Lost', value: stats.lost, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className={cn("p-6 rounded-[24px] border-2 border-white shadow-sm flex items-center gap-4", stat.bg)}>
                        <div className={cn("p-3 rounded-2xl bg-white shadow-sm", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table & Controls */}
            <div className="bg-white rounded-[32px] border-2 border-slate-50 shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by student, serial, or roll no..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Details</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Device Info</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Allocated</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/30"></td>
                                    </tr>
                                ))
                            ) : filteredAssets.length > 0 ? (
                                filteredAssets.map((asset) => (
                                    <tr key={asset._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {asset.student_id?.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{asset.student_id?.name || 'N/A'}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{asset.student_id?.roll_no} • {asset.student_id?.branch}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                {asset.device_type === 'Laptop' ? <Laptop className="w-4 h-4 text-slate-400" /> : <Smartphone className="w-4 h-4 text-slate-400" />}
                                                <div>
                                                    <p className="font-bold text-slate-900">{asset.device_type}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{asset.device_serial}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                asset.status === 'Allocated' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                asset.status === 'In-Repair' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                            {new Date(asset.allocated_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Shield className="w-12 h-12" />
                                            <p className="font-black uppercase tracking-widest text-xs">No assets found in vault</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
