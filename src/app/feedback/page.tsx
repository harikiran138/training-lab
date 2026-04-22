'use client';

import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Star, 
    TrendingUp, 
    AlertCircle, 
    ThumbsUp,
    Users,
    Activity,
    Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feedback {
    _id: string;
    branch_id: {
        branch_code: string;
        branch_name: string;
    };
    week_number: number;
    session_type: string;
    avg_rating_faculty: number;
    avg_rating_content: number;
    avg_rating_lab: number;
    sentiment_summary: string;
    key_issues: string[];
    response_count: number;
}

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch('/api/feedback');
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (err) {
            console.error('Failed to fetch feedback', err);
        } finally {
            setLoading(false);
        }
    };

    const overallRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, curr) => acc + (curr.avg_rating_faculty + curr.avg_rating_content + curr.avg_rating_lab) / 3, 0) / feedbacks.length).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Sentiment Analysis</h2>
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-8 h-[2px] bg-blue-600"></span>
                        Voice of the Student Repository
                    </p>
                </div>
                
                <div className="flex items-center gap-6 bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm">
                    <div className="flex flex-col items-center border-r-2 border-slate-50 pr-6">
                        <span className="text-3xl font-black text-slate-900">{overallRating}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Global Index</span>
                    </div>
                    <div className="flex gap-1 text-amber-400">
                        {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={cn("w-5 h-5", i < Math.floor(Number(overallRating)) ? "fill-amber-400" : "text-slate-200")} />
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Responses', value: feedbacks.reduce((acc, curr) => acc + curr.response_count, 0), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Avg Faculty Rating', value: feedbacks.length ? (feedbacks.reduce((acc, curr) => acc + curr.avg_rating_faculty, 0) / feedbacks.length).toFixed(1) : '0.0', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Active Issues', value: feedbacks.reduce((acc, curr) => acc + curr.key_issues.length, 0), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className={cn("p-8 rounded-[32px] border-2 border-white shadow-sm flex items-center justify-between", stat.bg)}>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        </div>
                        <stat.icon className={cn("w-10 h-10 opacity-20", stat.color)} />
                    </div>
                ))}
            </div>

            {/* Feedback Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-50 rounded-[40px] animate-pulse" />
                    ))
                ) : feedbacks.length > 0 ? (
                    feedbacks.map((item) => (
                        <div key={item._id} className="bg-white p-10 rounded-[40px] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{item.branch_id?.branch_code}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Week {item.week_number} • {item.session_type}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-black italic">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        {((item.avg_rating_faculty + item.avg_rating_content + item.avg_rating_lab) / 3).toFixed(1)}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative pl-8 border-l-4 border-indigo-500 py-2">
                                        <Quote className="absolute left-0 top-0 w-6 h-6 text-indigo-500/10 -ml-3" />
                                        <p className="text-slate-600 font-medium italic leading-relaxed">
                                            "{item.sentiment_summary || "Overall session was productive with good engagement levels across all modules."}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {item.key_issues.map((issue, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-100">
                                                {issue}
                                            </span>
                                        ))}
                                        {item.key_issues.length === 0 && (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2">
                                                <ThumbsUp className="w-3 h-3" />
                                                No Critical Blockers
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="lg:col-span-2 bg-slate-50 rounded-[40px] p-32 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 opacity-50">
                        <MessageSquare className="w-16 h-16 text-slate-300 mb-6" />
                        <p className="text-2xl font-black text-slate-400 uppercase tracking-widest italic">No feedback signals received</p>
                    </div>
                )}
            </div>
        </div>
    );
}
