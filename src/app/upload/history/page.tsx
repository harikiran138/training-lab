'use client';

import React, { useState, useEffect } from 'react';
import { getUploadHistory } from '@/app/actions/history';
import { Clock, CheckCircle2, XCircle, AlertCircle, Eye, ChevronLeft, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const resp = await getUploadHistory();
            if (resp.success) {
                setHistory(resp.data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PROCESSED': return <CheckCircle2 className="text-green-500" size={18} />;
            case 'REJECTED': return <XCircle className="text-red-500" size={18} />;
            default: return <Clock className="text-yellow-500" size={18} />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/upload" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-2">
                            <ArrowLeft size={16} />
                            Back to Upload
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-800">Extraction History</h1>
                        <p className="text-slate-500 mt-1">Audit log of all processed and draft extractions.</p>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Metadata</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Records</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 uppercase">
                            {history.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-slate-700">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            {new Date(record.createdAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-slate-800">{record.branch_code || 'N/A'}</span>
                                            <span className="text-xs text-slate-400">{record.section || 'A'} • Week {record.week_no || '?'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            {getStatusIcon(record.status)}
                                            <span className={record.status === 'PROCESSED' ? 'text-green-700' : record.status === 'REJECTED' ? 'text-red-700' : 'text-yellow-700'}>
                                                {record.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {record.structuredData?.length || 0} rows
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setSelectedImage(record.imageUrl)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all"
                                        >
                                            <Eye size={14} />
                                            View Source
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">No extraction history found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <button
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={`data:image/png;base64,${selectedImage}`}
                            alt="Original Source"
                            className="max-w-full max-h-[80vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
