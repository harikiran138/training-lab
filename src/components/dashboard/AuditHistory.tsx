"use client"

import React, { useEffect, useState } from 'react';
import { X, History, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLogEntry {
    _id: string;
    timestamp: string;
    action: string;
    user: string;
    field: string;
    old_value: any;
    new_value: any;
}

interface AuditHistoryProps {
    branchCode: string;
    field: string;
    isOpen: boolean;
    onClose: () => void;
    onRevert: () => Promise<void>;
}

export function AuditHistory({ branchCode, field, isOpen, onClose, onRevert }: AuditHistoryProps) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch(`/api/audit/${branchCode}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // Filter logs for this specific field
                        const fieldLogs = data.data.filter((log: any) => log.field === field);
                        setLogs(fieldLogs);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, branchCode, field]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-slate-800">Edit History</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field: {field}</span>
                        <button
                            onClick={onRevert}
                            className="text-xs flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-md hover:bg-rose-100 transition-colors font-medium border border-rose-100"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Revert to Original
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-slate-400 text-sm">Loading history...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                            No edit history found for this field.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log._id} className="text-sm border border-slate-100 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-slate-900">{log.user}</span>
                                        <span className="text-slate-400 text-xs">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2 rounded border border-slate-100">
                                        <span className="line-through text-slate-400">{String(log.old_value)}</span>
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                        <span className="font-semibold text-indigo-600">{String(log.new_value)}</span>
                                    </div>
                                    <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            log.action === 'REVERT_EDIT' ? "bg-amber-400" : "bg-emerald-400"
                                        )} />
                                        {log.action === 'REVERT_EDIT' ? 'Reverted' : 'Manual Edit'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
