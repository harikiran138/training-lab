"use client"

import React, { useState } from 'react';
import { X, Target, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MitigationModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchCode: string;
    onSuccess: () => void;
}

export function MitigationModal({ isOpen, onClose, branchCode, onSuccess }: MitigationModalProps) {
    const [type, setType] = useState<'ACADEMIC' | 'PARTICIPATION' | 'TESTING'>('ACADEMIC');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/mitigation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branch_code: branchCode,
                    type,
                    description,
                    priority
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setDescription('');
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                alert('Failed to create mitigation task');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-800 tracking-tight">Assign Mitigation: {branchCode}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600 animate-bounce">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Task Assigned!</h4>
                        <p className="text-slate-500">The intervention has been logged.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intervention Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['ACADEMIC', 'PARTICIPATION', 'TESTING'] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={cn(
                                                "py-2 px-1 text-[10px] font-bold rounded-lg border transition-all",
                                                type === t
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                                    value={priority}
                                    onChange={(e: any) => setPriority(e.target.value)}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mitigation Strategy Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="e.g. Schedule extra practice lab on Saturday"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                            Assign Intervention
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
