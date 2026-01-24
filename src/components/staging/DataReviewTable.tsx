'use client';

import React, { useState } from 'react';
import { confirmUpload } from '@/app/actions/confirm';
import { rejectUpload } from '@/app/actions/reject';
import { useRouter } from 'next/navigation';
import { Toast, ToastType } from '@/components/ui/Toast';
import { Check, CheckCircle2, AlertTriangle, Save, Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';

interface DataReviewTableProps {
    initialData: any[];
    stagingId: string;
    imageUrl?: string;
}

export function DataReviewTable({ initialData, stagingId, imageUrl }: DataReviewTableProps) {
    const [records, setRecords] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: ToastType, show: boolean }>({ msg: '', type: 'info', show: false });
    const [zoom, setZoom] = useState(1);
    const router = useRouter();

    const showToast = (msg: string, type: ToastType) => {
        setToast({ msg, type, show: true });
    };

    const getConfidenceStyle = (confidence: number) => {
        if (confidence > 0.9) return 'bg-green-50/50 text-green-700 hover:bg-green-100';
        if (confidence > 0.7) return 'bg-yellow-50/50 text-yellow-700 hover:bg-yellow-100';
        return 'bg-red-50/50 text-red-700 hover:bg-red-100 ring-1 ring-inset ring-red-200';
    };

    const handleCellChange = (rowIndex: number, key: string, value: string) => {
        const newRecords = [...records];
        newRecords[rowIndex].data[key] = value;
        setRecords(newRecords);
    };

    const handleConfirm = async () => {
        const lowConfidenceCount = records.reduce((acc: number, rec: any) => {
            return acc + Object.values(rec.confidence).filter((c: any) => c < 0.7).length;
        }, 0);

        if (lowConfidenceCount > 0) {
            const confirmLow = window.confirm(`There are ${lowConfidenceCount} fields with low confidence (<70%). Are you sure you want to proceed?`);
            if (!confirmLow) return;
        }

        setIsSaving(true);
        try {
            const result = await confirmUpload(stagingId, records);
            if (result.success) {
                showToast('Data successfully committed to database!', 'success');
                setTimeout(() => router.refresh(), 2000);
            } else {
                showToast('Error: ' + result.error, 'error');
                setIsSaving(false);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to save data.', 'error');
            setIsSaving(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to reject this extraction? It will be marked as rejected in the records.')) return;

        setIsSaving(true);
        try {
            const result = await rejectUpload(stagingId);
            if (result.success) {
                showToast('Extraction rejected and archived.', 'info');
                setTimeout(() => router.refresh(), 2000);
            } else {
                showToast('Error: ' + result.error, 'error');
                setIsSaving(false);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to reject data.', 'error');
            setIsSaving(false);
        }
    };

    const headers = records.length > 0 ? Object.keys(records[0].data) : [];

    return (
        <div className="flex flex-col lg:flex-row h-[700px] bg-slate-50">
            <Toast
                message={toast.msg}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
            />

            {/* Left Pane: Image Preview */}
            <div className="lg:w-1/2 border-r border-slate-200 relative bg-slate-200 overflow-hidden group">
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <button
                        onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                        className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white text-slate-600 transition-all"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <button
                        onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
                        className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white text-slate-600 transition-all"
                    >
                        <ZoomOut size={18} />
                    </button>
                </div>

                <div className="w-full h-full overflow-auto p-8 cursor-grab active:cursor-grabbing">
                    {imageUrl ? (
                        <img
                            src={`data:image/png;base64,${imageUrl}`}
                            alt="Uploaded source"
                            className="max-w-none shadow-xl transition-transform duration-200 origin-top-left"
                            style={{ transform: `scale(${zoom})` }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
                            No image preview available
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane: Editable Table */}
            <div className="lg:w-1/2 flex flex-col h-full bg-white relative">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-200 bg-slate-50/90 backdrop-blur">
                                <th className="p-4 w-12 text-slate-400 font-normal">#</th>
                                {headers.map((header) => (
                                    <th key={header} className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {records.map((record: any, rowIndex: number) => (
                                <tr key={rowIndex} className="hover:bg-slate-50 transition-colors group/row">
                                    <td className="p-4 text-xs text-slate-400 font-mono">{rowIndex + 1}</td>
                                    {headers.map((key) => {
                                        const value = record.data[key];
                                        const confidence = record.confidence[key] || 0;
                                        return (
                                            <td
                                                key={key}
                                                className="p-2 relative group/cell"
                                            >
                                                <div className={`relative rounded-md transition-all duration-200 ${getConfidenceStyle(confidence)}`}>
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => handleCellChange(rowIndex, key, e.target.value)}
                                                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-md py-1.5 px-3 text-sm font-medium outline-none"
                                                    />
                                                    {confidence < 0.7 && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-red-400">
                                                            <AlertTriangle size={14} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/cell:block bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">
                                                    Confidence: {Math.round(confidence * 100)}%
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex gap-4 items-center">
                        <div className="text-sm text-slate-500">
                            {records.length} records found
                        </div>
                        <button
                            onClick={handleReject}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all disabled:text-slate-400"
                        >
                            <Trash2 size={18} />
                            Reject Extraction
                        </button>
                    </div>
                    <button
                        className={`
                flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md shadow-blue-500/20
                hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:text-slate-500
            `}
                        onClick={handleConfirm}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        {isSaving ? 'Finalizing...' : 'Confirm Validity'}
                    </button>
                </div>
            </div>
        </div>
    );
}
