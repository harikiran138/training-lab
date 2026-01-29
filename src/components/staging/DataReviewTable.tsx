'use client';

import { useState } from 'react';
import { Save, Check, AlertTriangle } from 'lucide-react';

interface StagingRecord {
    _id: string; // Mongoose ID
    imageUrl: string;
    type: string;
    status: string;
    structuredData: {
        data: Record<string, any>;
        confidence: Record<string, number>;
        userVerified: boolean;
    }[];
}

export default function DataReviewTable({
    record,
    onCommit,
}: {
    record: StagingRecord;
    onCommit: (updatedData: any[]) => Promise<void>;
}) {
    // Flatten data for the table
    // unstructuredData is an array of rows.
    const [rows, setRows] = useState(record.structuredData.map((r, index) => ({
        id: index,
        ...r.data,
        _confidence: r.confidence,
        _verified: r.userVerified
    })));
    const [isSaving, setIsSaving] = useState(false);

    const headers = rows.length > 0 ? Object.keys(rows[0]).filter(k => !k.startsWith('_') && k !== 'id') : [];

    const handleChange = (rowIndex: number, key: string, value: string) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [key]: value, _verified: true };
        setRows(newRows);
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 0.9) return 'bg-emerald-50/50 text-emerald-900 border-emerald-100';
        if (score >= 0.7) return 'bg-amber-50/50 text-amber-900 border-amber-100';
        return 'bg-rose-50/50 text-rose-900 border-rose-100';
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onCommit(rows.map(({ _confidence, _verified, id, ...data }) => ({
                data,
                confidence: _confidence,
                userVerified: true
            })));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Sync Confirmation</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cross-referencing {rows.length} neural extractions</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                >
                    {isSaving ? (
                        <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Finalizing...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Commit Records
                        </>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 font-semibold border-b border-slate-200">#</th>
                            {headers.map(h => (
                                <th key={h} className="p-3 font-semibold border-b border-slate-200 capitalize">
                                    {h.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, rIndex) => (
                            <tr key={rIndex} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 text-slate-500 font-mono text-xs">{rIndex + 1}</td>
                                {headers.map(h => {
                                    const value = (row as any)[h];
                                    const confidence = (row as any)._confidence[h] ?? 1.0;
                                    return (
                                        <td key={`${rIndex}-${h}`} className="p-1 min-w-[100px]">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={value || ''}
                                                    onChange={(e) => handleChange(rIndex, h, e.target.value)}
                                                    className={`w-full p-2 rounded border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getConfidenceColor(confidence)
                                                        } ${confidence < 0.8 ? 'border-dashed border-2' : 'border-slate-200'}`}
                                                />
                                                {confidence < 0.7 && (
                                                    <AlertTriangle className="absolute right-2 top-2.5 w-4 h-4 text-red-500 opacity-50 pointer-events-none" />
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rows.length === 0 && (
                    <div className="text-center p-10 text-slate-500">
                        No structured data found.
                    </div>
                )}
            </div>
        </div>
    );
}
