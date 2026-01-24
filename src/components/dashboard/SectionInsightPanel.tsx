"use client"

import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info, ArrowRight, Target } from 'lucide-react';
import { generateSectionInsights, Insight } from '@/services/InsightService';
import { cn } from '@/lib/utils';

interface SectionInsightPanelProps {
    sectionData: { week: string, attendance: number, passRate: number }[];
    deptAverage?: { attendance: number, passRate: number };
}

export function SectionInsightPanel({ sectionData, deptAverage }: SectionInsightPanelProps) {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating a small delay for "generation" feel
        const timer = setTimeout(() => {
            const results = generateSectionInsights(sectionData, deptAverage);
            setInsights(results);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [sectionData, deptAverage]);

    if (!loading && insights.length === 0) return null;

    return (
        <div className="w-full bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
                        <Target size={18} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">Section Diagnostics</h4>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                    <Sparkles size={12} className="text-amber-500" />
                    AI Analysis
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-50/50 p-4 rounded-xl border border-slate-50 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-full" />
                        </div>
                    ))
                ) : (
                    insights.map((insight) => (
                        <div
                            key={insight.id}
                            className={cn(
                                "p-4 rounded-xl border transition-all duration-300",
                                insight.sentiment === 'positive' ? "bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50" :
                                    insight.sentiment === 'negative' ? "bg-rose-50/50 border-rose-100/50 hover:bg-rose-50" :
                                        "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={cn(
                                    "p-1.5 rounded-lg",
                                    insight.type === 'trend' ? "text-blue-600 bg-blue-100/50" :
                                        insight.type === 'anomaly' ? "text-amber-600 bg-amber-100/50" :
                                            "text-rose-600 bg-rose-100/50"
                                )}>
                                    {insight.type === 'trend' ? <TrendingUp size={14} /> :
                                        insight.type === 'anomaly' ? <Info size={14} /> :
                                            <AlertTriangle size={14} />}
                                </div>
                                <h5 className="font-bold text-slate-800 text-sm">{insight.title}</h5>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed">
                                {insight.description}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
