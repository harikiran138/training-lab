"use client"

import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { DashboardData, fetchAIInsights, Insight } from '@/services/InsightService';
import { cn } from '@/lib/utils';

interface AIInsightPanelProps {
    data: DashboardData;
}

export function AIInsightPanel({ data }: AIInsightPanelProps) {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadInsights = async () => {
            try {
                const results = await fetchAIInsights(data);
                if (mounted) {
                    setInsights(results);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load insights", err);
                if (mounted) setLoading(false);
            }
        };

        loadInsights();

        return () => {
            mounted = false;
        };
    }, [data]);

    return (
        <div className="w-full bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles size={120} />
            </div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-200">
                    <Sparkles size={18} />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">AI Insights</h4>
                <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    Beta
                </span>
            </div>

            <div className="space-y-3 relative z-10">
                {loading ? (
                    // Skeleton Loading State
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/60 p-4 rounded-lg border border-slate-100 animate-pulse flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-1/3" />
                                <div className="h-3 bg-slate-200 rounded w-3/4" />
                            </div>
                        </div>
                    ))
                ) : insights.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm">
                        No critical insights found at this time.
                    </div>
                ) : (
                    insights.map((insight) => (
                        <div
                            key={insight.id}
                            className="bg-white/80 hover:bg-white p-4 rounded-lg border border-slate-100 hover:border-indigo-100 transition-all duration-300 shadow-sm group"
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "p-2 rounded-full flex-shrink-0",
                                    insight.type === 'trend' ? "bg-blue-50 text-blue-600" :
                                        insight.type === 'anomaly' ? "bg-amber-50 text-amber-600" :
                                            insight.type === 'attention' ? "bg-rose-50 text-rose-600" :
                                                "bg-slate-50 text-slate-600"
                                )}>
                                    {insight.type === 'trend' ? <TrendingUp size={18} /> :
                                        insight.type === 'anomaly' ? <Info size={18} /> :
                                            insight.type === 'attention' ? <AlertTriangle size={18} /> :
                                                <Sparkles size={18} />}
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-indigo-700 transition-colors">
                                        {insight.title}
                                    </h5>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!loading && (
                <div className="mt-4 flex justify-end">
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                        View Analysis Details <ArrowRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}
