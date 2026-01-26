"use client"

import React, { useState, useMemo } from 'react';
import { 
    FileText, 
    Download, 
    Filter, 
    ChevronDown, 
    Printer, 
    Database, 
    ShieldCheck,
    Users,
    Activity,
    Calendar,
    Search,
    ChevronRight,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INSTITUTIONAL_SCHEMAS } from '@/config/SchemaManager';

export default function ReportsPage() {
    const [selectedCategory, setSelectedCategory] = useState('crt_attendance');
    const [selectedEpoch, setSelectedEpoch] = useState('1');
    const [isGenerating, setIsGenerating] = useState(false);

    const schema = INSTITUTIONAL_SCHEMAS[selectedCategory];

    const groupedSchemas = useMemo(() => {
        const groups: Record<string, typeof INSTITUTIONAL_SCHEMAS[string][]> = {};
        Object.values(INSTITUTIONAL_SCHEMAS).forEach(s => {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        });
        return groups;
    }, []);

    const handleExportPDF = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            alert('PDF Generation Complete :: Institutional Report v5.0 Master downloaded.');
        }, 2000);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-slate-100 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1E3A8A] p-2 rounded text-white shadow-sm">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight uppercase">
                            Institutional <span className="font-light opacity-60">Reports</span>
                        </h1>
                    </div>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-11">
                        Board-Level Reporting :: Consolidated Academic Analytics
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-1.5 rounded border border-slate-200 shadow-sm">
                    {/* CATEGORY SELECTOR */}
                    <div className="pl-4 border-r border-slate-100 pr-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Stream</span>
                        <div className="relative">
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 font-extrabold text-[#1E3A8A] uppercase tracking-tighter text-lg p-0 cursor-pointer appearance-none pr-10"
                            >
                                {Object.entries(groupedSchemas).map(([cat, schemas]) => (
                                    <optgroup key={cat} label={cat.toUpperCase()} className="font-bold text-slate-400">
                                        {schemas.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* EPOCH SELECTOR */}
                    <div className="pl-4 border-r border-slate-100 pr-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Epoch</span>
                        <div className="relative">
                            <select 
                                value={selectedEpoch}
                                onChange={(e) => setSelectedEpoch(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 font-extrabold text-[#1E3A8A] uppercase tracking-tighter text-lg p-0 cursor-pointer appearance-none pr-8"
                            >
                                {[1,2,3,4,5,6,7,8,9,10].map(e => (
                                    <option key={e} value={e}>Epoch {e}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <button 
                        onClick={handleExportPDF}
                        disabled={isGenerating}
                        className="flex items-center gap-3 bg-[#1E3A8A] text-white px-8 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                        {isGenerating ? <Activity className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                        {isGenerating ? 'GENERATING...' : 'EXPORT PDF'}
                    </button>
                </div>
            </div>

            {/* REPORT SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-white p-6 border border-slate-200 rounded shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</h4>
                    <div className="flex items-end justify-between">
                         <p className="text-2xl font-black text-[#1E3A8A] tracking-tighter uppercase">{schema.category}</p>
                         <ShieldCheck className="w-6 h-6 text-emerald-500 opacity-20" />
                    </div>
                </div>
                <div className="bg-white p-6 border border-slate-200 rounded shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stream Integrity</h4>
                    <div className="flex items-end justify-between">
                         <p className="text-2xl font-black text-[#1E3A8A] tracking-tighter">100%</p>
                         <TrendingUp className="w-6 h-6 text-[#1E3A8A] opacity-20" />
                    </div>
                </div>
                <div className="bg-white p-6 border border-slate-200 rounded shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entered Records</h4>
                    <div className="flex items-end justify-between">
                         <p className="text-2xl font-black text-slate-800 tracking-tighter">{schema.defaultData.length}</p>
                         <Database className="w-6 h-6 text-slate-400 opacity-20" />
                    </div>
                </div>
                <div className="bg-white p-6 border border-slate-200 rounded shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporting Epoch</h4>
                    <div className="flex items-end justify-between">
                         <p className="text-2xl font-black text-slate-800 tracking-tighter">{selectedEpoch}</p>
                         <Calendar className="w-6 h-6 text-slate-400 opacity-20" />
                    </div>
                </div>
            </div>

            {/* REPORT TABLE */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#1E3A8A] shadow-sm">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-black text-[#1E3A8A] uppercase tracking-wider">{schema.name} Master Ledger</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Consolidated View :: Institutional Review Board</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none group-focus-within:text-[#1E3A8A]" />
                        <input 
                            type="text" 
                            placeholder="FILTER REGISTRY..."
                            className="bg-white border border-slate-200 rounded px-10 py-2.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-100 w-64 shadow-sm"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1E3A8A] text-white">
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest w-12 text-center opacity-40">#</th>
                                {schema.fields.map(f => (
                                    <th key={f.key} className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest">{f.label}</th>
                                ))}
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-center w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {schema.defaultData.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors odd:bg-white even:bg-slate-50/20 group">
                                    <td className="px-8 py-5 text-[12px] font-bold text-slate-300 text-center">{(i + 1).toString().padStart(2, '0')}</td>
                                    {schema.fields.map(f => (
                                        <td key={f.key} className={cn(
                                            "px-8 py-5 text-[13px] font-bold transition-all",
                                            f.type === 'readOnly' ? "text-[#1E3A8A] italic" : "text-slate-600 group-hover:text-slate-900",
                                            f.type === 'textarea' ? "max-w-[300px] text-[11px] leading-relaxed font-medium line-clamp-2" : ""
                                        )}>
                                            {f.calculate ? f.calculate(row) : row[f.key]}
                                            {f.key.includes('percent') || f.key === 'avg' || f.key === 'selection_rate' || f.key === 'pass_percent' ? '%' : ''}
                                            {f.key === 'ctc' || f.key === 'max_ctc' ? ' LPA' : ''}
                                        </td>
                                    ))}
                                    <td className="px-8 py-5 text-center">
                                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest inline-block shadow-sm">
                                            Verified
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            SYNCHRONIZED
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#1E3A8A] shadow-[0_0_8px_rgba(30,58,138,0.5)]"></div>
                             ENCRYPTED
                        </div>
                    </div>
                    <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">
                         Authorized Access Only :: Institutional Master Repository v5.0
                    </p>
                </div>
            </div>

            {/* ANALYTICS PREVIEW SECTION */}
            <div className="bg-[#1E3A8A] rounded-2xl p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
                 <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            AI Insight Engine Active
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter leading-tight uppercase group">
                            "Institutional telemetry for <span className="text-blue-300">{schema.name}</span> reveals a high-efficiency performance vector."
                        </h3>
                        <div className="flex items-center gap-8 pt-10 border-t border-white/10">
                            <div className="flex items-center gap-4 group">
                                <div className="p-2.5 bg-white/10 rounded-lg group-hover:bg-blue-500 transition-all">
                                    <Users className="w-5 h-5 text-blue-200" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest">480+ Students Mapped</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-2.5 bg-white/10 rounded-lg group-hover:bg-emerald-500 transition-all">
                                    <AlertCircle className="w-5 h-5 text-emerald-300" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest">Zero Critical Latency</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl space-y-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[12px] font-black uppercase tracking-[0.2em] opacity-40">Matrix Weights</h4>
                            <div className="px-3 py-1 bg-blue-500/20 rounded text-[9px] font-bold text-blue-300">REAL-TIME</div>
                        </div>
                        <div className="space-y-8">
                            {[
                                { label: 'Data Integrity', val: 98, color: 'bg-blue-400' },
                                { label: 'Cross-Domain Sync', val: 89, color: 'bg-emerald-400' },
                                { label: 'Reporting Velocity', val: 94, color: 'bg-indigo-400' }
                            ].map((row, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3.5">
                                        <span className="opacity-60">{row.label}</span>
                                        <span className="text-white">{row.val}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className={cn(row.color, "h-full transition-all duration-1000 group-hover:opacity-100 opacity-60")} style={{ width: `${row.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
            </div>
        </div>
    );
}
