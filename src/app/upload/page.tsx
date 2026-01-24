'use client';

import React, { useState } from 'react';
import { processImageUpload } from '../actions/upload';
import { getUploadMetadata } from '../actions/metadata';
import { DataReviewTable } from '@/components/staging/DataReviewTable';
import { UploadCloud, Loader2, FileText, X, Settings2, Clock } from 'lucide-react';
import { Toast, ToastType } from '@/components/ui/Toast';
import Link from 'next/link';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [stagingId, setStagingId] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string, type: ToastType, show: boolean }>({ msg: '', type: 'info', show: false });

    const [branches, setBranches] = useState<any[]>([]);
    const [weeks, setWeeks] = useState<any[]>([]);
    const [metadata, setMetadata] = useState({
        branch_code: '',
        section: 'A',
        week_no: '',
        semester: 'SEM1'
    });

    React.useEffect(() => {
        const fetchMeta = async () => {
            const resp = await getUploadMetadata();
            if (resp.success) {
                setBranches(resp.branches);
                setWeeks(resp.weeks);
                if (resp.branches.length > 0) setMetadata(prev => ({ ...prev, branch_code: resp.branches[0].branch_code }));
                if (resp.weeks.length > 0) setMetadata(prev => ({ ...prev, week_no: resp.weeks[0].week_no.toString() }));
            }
        };
        fetchMeta();
    }, []);

    const showToast = (msg: string, type: ToastType) => {
        setToast({ msg, type, show: true });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'ATTENDANCE');
        formData.append('branch_code', metadata.branch_code);
        formData.append('section', metadata.section);
        formData.append('week_no', metadata.week_no);
        formData.append('semester', metadata.semester);

        try {
            const resp = await processImageUpload(formData);
            if (resp.success && resp.data) {
                setResult(resp.data.records);
                setStagingId(resp.stagingId || null);
                setImageUrl(resp.imageUrl || null);
                showToast('Image processed successfully', 'success');
            } else {
                showToast('Upload failed: ' + (resp.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('An unexpected error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-slate-800">
            <Toast
                message={toast.msg}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
            />

            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Smart Data Extraction
                        </h1>
                        <p className="text-slate-500 mt-2">Upload attendance sheets or records to digitize them instantly.</p>
                    </div>
                    <Link href="/upload/history" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                        <Clock size={16} />
                        View History
                    </Link>
                </header>

                {!result ? (
                    <div className="max-w-4xl mx-auto mt-10">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Metadata */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-5">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <Settings2 size={18} />
                                    <h3 className="text-sm font-semibold uppercase tracking-wider">Parameters</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-500">Branch</label>
                                        <select
                                            value={metadata.branch_code}
                                            onChange={(e) => setMetadata({ ...metadata, branch_code: e.target.value })}
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {branches.map(b => <option key={b.branch_code} value={b.branch_code}>{b.branch_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-500">Section</label>
                                        <select
                                            value={metadata.section}
                                            onChange={(e) => setMetadata({ ...metadata, section: e.target.value })}
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="A">Section A</option>
                                            <option value="B">Section B</option>
                                            <option value="C">Section C</option>
                                            <option value="D">Section D</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-500">Week</label>
                                        <select
                                            value={metadata.week_no}
                                            onChange={(e) => setMetadata({ ...metadata, week_no: e.target.value })}
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {weeks.map(w => <option key={w.week_no} value={w.week_no.toString()}>{w.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-500">Semester</label>
                                        <select
                                            value={metadata.semester}
                                            onChange={(e) => setMetadata({ ...metadata, semester: e.target.value })}
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="SEM1">Semester 1</option>
                                            <option value="SEM2">Semester 2</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Dropzone */}
                            <div className="flex flex-col gap-6">
                                <div
                                    className={`
                                        flex-1 relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
                                        ${file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-white'}
                                    `}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />

                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                            {file ? <FileText className="text-blue-600" size={32} /> : <UploadCloud className="text-slate-400 group-hover:text-blue-500" size={32} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-700">
                                                {file ? file.name : "Click or drag image here"}
                                            </p>
                                        </div>
                                        {file && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                className="text-xs text-red-500 hover:underline z-10 relative"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!file || loading}
                                    className={`
                                        flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold shadow-lg transition-all
                                        ${loading || !file
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30 hover:scale-[1.02]'}
                                    `}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                                    {loading ? 'Analyzing Sheet...' : 'Visualize & Extract'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-white/20">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                                <h2 className="text-xl font-semibold text-slate-800">Review Data</h2>
                                <button
                                    onClick={() => setResult(null)}
                                    className="text-sm px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                >
                                    Discard & New Upload
                                </button>
                            </div>

                            {stagingId && (
                                <DataReviewTable
                                    initialData={result}
                                    stagingId={stagingId}
                                    imageUrl={imageUrl || undefined}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
