"use client"

import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActiveMitigations({ refreshTrigger }: { refreshTrigger: number }) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/mitigation?status=PENDING,IN_PROGRESS');
            const data = await res.json();
            if (data.success) {
                setTasks(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [refreshTrigger]);

    const handleComplete = async (id: string) => {
        try {
            const res = await fetch('/api/mitigation', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'COMPLETED' })
            });
            if (res.ok) {
                fetchTasks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-slate-400 text-sm py-8 text-center bg-white rounded-2xl border border-slate-100 italic">Loading interventions...</div>;

    if (tasks.length === 0) return (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center space-y-3">
            <div className="inline-flex p-3 bg-white rounded-full text-slate-400">
                <Target className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500">No active interventions currently tracked.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
                <div key={task._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{task.branch_code}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                    task.priority === 'CRITICAL' ? "bg-rose-100 text-rose-700" :
                                        task.priority === 'HIGH' ? "bg-amber-100 text-amber-700" :
                                            "bg-indigo-100 text-indigo-700"
                                )}>
                                    {task.priority}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{task.type}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleComplete(task._id)}
                            className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                            title="Mark as Completed"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed italic">{task.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {task.created_by?.name || 'Admin'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
