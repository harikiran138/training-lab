'use client';

import React from 'react';
import { Insight } from '@/services/InsightService';
import { TrendingUp, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionInsightsProps {
    insights: Insight[];
}

export function SectionInsights({ insights }: SectionInsightsProps) {
    if (insights.length === 0) {
        return (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
                <h5 className="text-sm font-bold text-slate-900">System Stabilized</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">No critical anomalies detected in current section metrics.</p>
            </div>
        );
    }

    const getIcon = (type: Insight['type']) => {
        switch (type) {
            case 'trend': return <TrendingUp className="w-4 h-4" />;
            case 'attention': return <AlertCircle className="w-4 h-4" />;
            case 'anomaly': return <AlertCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getStyles = (sentiment: Insight['sentiment']) => {
        switch (sentiment) {
            case 'positive': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'negative': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                Automated Diagnostics
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Alpha</span>
            </h4>
            <div className="space-y-3">
                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        className={cn(
                            "p-4 rounded-xl border flex gap-3 items-start transition-all hover:shadow-sm",
                            getStyles(insight.sentiment)
                        )}
                    >
                        <div className="mt-0.5">{getIcon(insight.type)}</div>
                        <div>
                            <div className="text-sm font-bold leading-tight">{insight.title}</div>
                            <div className="text-xs mt-1 opacity-90 leading-relaxed font-medium">{insight.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
