import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PreviewTableProps {
    validCount: number;
    invalidRows: any[];
    previewData: any[]; // First 5-10 rows to show
    totalCount: number;
}

export function PreviewTable({ validCount, invalidRows, previewData, totalCount }: PreviewTableProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-emerald-700">{validCount}</p>
                        <p className="text-sm text-emerald-600 font-medium">Valid Records</p>
                    </div>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-rose-700">{invalidRows.length}</p>
                        <p className="text-sm text-rose-600 font-medium">Invalid Records</p>
                    </div>
                </div>
            </div>

            {invalidRows.length > 0 && (
                <div className="bg-white border border-rose-200 rounded-xl overflow-hidden">
                    <div className="bg-rose-50 px-4 py-3 border-b border-rose-100">
                        <h4 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Errors Found ({invalidRows.length})
                        </h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-rose-700 uppercase bg-rose-50/50">
                                <tr>
                                    <th className="px-4 py-2">Row</th>
                                    <th className="px-4 py-2">Source Data (Snippet)</th>
                                    <th className="px-4 py-2">Issues</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100">
                                {invalidRows.map((err, i) => (
                                    <tr key={i} className="hover:bg-rose-50/30">
                                        <td className="px-4 py-2 font-mono text-xs">{err.index + 2}</td> {/* +2 for header + 0-index */}
                                        <td className="px-4 py-2 text-slate-500 truncate max-w-xs">{JSON.stringify(Object.values(err.row).slice(0, 3))}...</td>
                                        <td className="px-4 py-2 text-rose-600 font-medium">
                                            <ul className="list-disc list-inside">
                                                {err.errors.map((e: string, j: number) => <li key={j}>{e}</li>)}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
