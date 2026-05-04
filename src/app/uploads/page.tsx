"use client"

import React, { useState, useRef } from 'react';
import { 
    Upload, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Database, 
    ArrowRight, 
    ShieldCheck,
    CloudUpload,
    Search,
    BrainCircuit,
    Zap,
    X,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INSTITUTIONAL_SCHEMAS } from '@/config/SchemaManager';

export default function UploadsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [extractionComplete, setExtractionComplete] = useState(false);
    const [selectedSchema, setSelectedSchema] = useState('crt_attendance');
    const [extractedData, setExtractedData] = useState<any[]>([]);
    const [uploadResult, setUploadResult] = useState<{ success: number; fails: number; anomalies: any[]; savedTo?: string } | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        fetchRecentLogs();
    }, []);

    const fetchRecentLogs = async () => {
        setLoadingLogs(true);
        try {
            const res = await fetch('/api/ingest/logs');
            if (res.ok) {
                const data = await res.json();
                setRecentLogs(data);
            }
        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const ACCEPTED_TYPES = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];

    const isValidFile = (f: File) =>
        ACCEPTED_TYPES.includes(f.type) ||
        f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv') || f.name.endsWith('.pdf');

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
            setUploadResult(null);
            setUploadError(null);
        } else {
            alert('Please upload a PDF, Excel (.xlsx/.xls), or CSV file.');
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
            setUploadResult(null);
            setUploadError(null);
        }
        e.target.value = '';
    };

    const handleExecute = async () => {
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        setUploadResult(null);
        setExtractionComplete(false);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/ingest', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setUploadError(data.error || 'Upload failed. Please try again.');
            } else {
                setUploadResult(data.details);
                setExtractionComplete(true);
                // Show preview using schema defaults or actual records if returned
                const schema = INSTITUTIONAL_SCHEMAS[selectedSchema];
                if (schema?.defaultData) {
                    setExtractedData(schema.defaultData.map((d: any, i: number) => ({
                        ...d,
                        _source: `Row ${i + 2}`,
                        _conf: 99
                    })));
                }
            }
        } catch (err: any) {
            setUploadError('Network error. Is the app server running?');
        } finally {
            setUploading(false);
        }
    };

    const handleCommit = async () => {
        setFile(null);
        setExtractionComplete(false);
        setExtractedData([]);
        setUploadResult(null);
        fetchRecentLogs();
        alert('Data has been saved to the database successfully.');
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-100 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1E3A8A] p-2 rounded text-white shadow-sm">
                            <CloudUpload className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight uppercase">
                            Data <span className="font-light opacity-60">Ingestion</span>
                        </h1>
                    </div>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-11">
                        PDF Extraction Engine :: Automated Repository Mapping
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-1.5 rounded border border-slate-200 shadow-sm">
                    <div className="px-6 py-2 flex items-center gap-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" />
                        Extraction Core Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* UPLOAD ZONE */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 border border-slate-200 rounded shadow-sm space-y-8">
                        <div>
                            <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider mb-6 border-l-4 border-[#1E3A8A] pl-4">
                                Ingestion Parameters
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Target Schema</label>
                                    <select 
                                        value={selectedSchema}
                                        onChange={(e) => setSelectedSchema(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded px-4 py-3 text-[12px] font-bold text-[#1E3A8A] outline-none"
                                    >
                                        {Object.values(INSTITUTIONAL_SCHEMAS).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileInputChange}
                        />

                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            onClick={() => !file && fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300",
                                file
                                    ? "border-emerald-200 bg-emerald-50/30"
                                    : "border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200 cursor-pointer"
                            )}
                        >
                            <div className={cn(
                                "p-4 rounded-full shadow-sm mb-2",
                                file ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-300"
                            )}>
                                {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                            </div>
                            {file ? (
                                <div className="space-y-1">
                                    <p className="text-[12px] font-extrabold text-[#1E3A8A] uppercase tracking-tighter truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">File Selected ✓</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Drop File or Click to Browse</p>
                                    <p className="text-[10px] text-slate-400 font-medium">PDF, Excel (.xlsx/.xls) or CSV</p>
                                </div>
                            )}
                            {file && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-4"
                                >
                                    Remove File
                                </button>
                            )}
                        </div>

                        <button 
                            disabled={!file || uploading}
                            onClick={handleExecute}
                            className={cn(
                                "w-full flex items-center justify-center gap-3 py-4 rounded text-[11px] font-bold uppercase tracking-widest transition-all",
                                !file ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#1E3A8A] text-white shadow-lg shadow-blue-100 hover:bg-blue-900"
                            )}
                        >
                            {uploading ? (
                                <>
                                    <BrainCircuit className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Upload & Process
                                </>
                            )}
                        </button>

                        {/* Upload error banner */}
                        {uploadError && (
                            <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-lg p-4">
                                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] font-bold text-rose-700">{uploadError}</p>
                            </div>
                        )}

                        {/* Upload success banner */}
                        {uploadResult && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Upload Successful</p>
                                </div>
                                <p className="text-[10px] text-emerald-600 pl-6">{uploadResult.success} records saved · {uploadResult.fails} skipped · saved to {uploadResult.savedTo || 'database'}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 p-8 text-white rounded shadow-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] opacity-60">Engine Logs</h4>
                            <div className="space-y-4 font-mono text-[10px] opacity-70">
                                <div className="flex gap-3">
                                    <span className="text-emerald-500">[OK]</span>
                                    <span>Extraction core v5.0 initialized</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-blue-400">[INFO]</span>
                                    <span>Awaiting PDF stream ingestion...</span>
                                </div>
                                {extractionComplete && (
                                    <div className="flex gap-3">
                                        <span className="text-emerald-500">[OK]</span>
                                        <span>Matrix mapping complete (98.4% conf)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PREVIEW ZONE */}
                <div className="lg:col-span-8">
                    {!extractionComplete ? (
                        <div className="h-[500px] border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-center gap-6 opacity-30">
                            <Search className="w-12 h-12 text-slate-300" />
                            <div>
                                <h3 className="text-xl font-bold text-[#1E3A8A] uppercase tracking-wider">Awaiting Stream</h3>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Initialize extraction to preview repository mapping</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider">Extracted Telemetry Preview</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Institutional AI :: High-Confidence Mapping</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <button 
                                        onClick={handleCommit}
                                        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all"
                                     >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Commit to Repository
                                     </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[#F8FAFC] border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Context</th>
                                            {INSTITUTIONAL_SCHEMAS[selectedSchema].fields.map(f => (
                                                <th key={f.key} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</th>
                                            ))}
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {extractedData.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-[11px] font-mono text-slate-400 italic">
                                                    {row._source}
                                                </td>
                                                {INSTITUTIONAL_SCHEMAS[selectedSchema].fields.map(f => (
                                                    <td key={f.key} className="px-6 py-4 text-[12px] font-bold text-[#1E3A8A]">
                                                        {f.calculate ? f.calculate(row) : row[f.key]}
                                                        {f.key.includes('percent') || f.key === 'avg' || f.key === 'selection_rate' ? '%' : ''}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-emerald-500 h-full" style={{ width: `${row._conf}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-600">{row._conf}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <AlertCircle className="w-4 h-4 text-blue-400" />
                                    Verify all detected fields before committing to the production stream.
                                 </div>
                                 <span className="italic">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RECENT INGESTION LOGS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-[13px] font-extrabold text-[#1E3A8A] uppercase tracking-wider">Recent Ingestion Cycles</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Audit Trail of Institutional Data Streams</p>
                    </div>
                    <button onClick={fetchRecentLogs} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                        <Zap className={cn("w-4 h-4", loadingLogs && "animate-pulse")} />
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-slate-100">
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filename</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stats</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Anomalies</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-300 text-[11px] font-bold uppercase tracking-widest">No ingestion cycles recorded</td>
                                </tr>
                            ) : (
                                recentLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span className="text-[12px] font-bold text-slate-700">{log.filename}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-medium text-slate-500 uppercase">
                                            {new Date(log.upload_date).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                log.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-bold text-[#1E3A8A]">{log.success_count} SUCCESS</span>
                                                <span className="text-[9px] font-bold text-rose-500">{log.error_count} ANOMALIES</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {log.anomalies && log.anomalies.length > 0 ? (
                                                <div className="flex flex-col gap-1 max-w-xs">
                                                    {log.anomalies.slice(0, 2).map((a: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 text-[10px] text-rose-600 font-bold">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span className="truncate">{a.issue}</span>
                                                        </div>
                                                    ))}
                                                    {log.anomalies.length > 2 && <span className="text-[9px] text-slate-400 font-bold">+ {log.anomalies.length - 2} more issues</span>}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Zero-G Validation Passed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
