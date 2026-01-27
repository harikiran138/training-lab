"use client"

import React, { useState } from 'react';
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

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile);
        } else {
            alert('Institutional Requirement: Only verified PDF streams are accepted.');
        }
    };

    const simulateExtraction = () => {
        setUploading(true);
        // Simulate extraction delay
        setTimeout(() => {
            setUploading(false);
            setExtractionComplete(true);
            // Simulate extracted data based on schema defaults but with slight variations
            const schema = INSTITUTIONAL_SCHEMAS[selectedSchema];
            setExtractedData(schema.defaultData.map((d, i) => ({
                ...d,
                _source: `PDF Line ${i + 12}`,
                _conf: 98.4
            })));
        }, 2500);
    };

    const handleCommit = async () => {
        alert('Repository Synchronized :: Extracted data committed to institutional database.');
        setFile(null);
        setExtractionComplete(false);
        setExtractedData([]);
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

                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300",
                                file ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200"
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
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Authenticated</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Drop Academic PDF</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Verified stream ingestion</p>
                                </div>
                            )}
                            {file && (
                                <button 
                                    onClick={() => setFile(null)}
                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-4"
                                >
                                    Purge Selection
                                </button>
                            )}
                        </div>

                        <button 
                            disabled={!file || uploading}
                            onClick={simulateExtraction}
                            className={cn(
                                "w-full flex items-center justify-center gap-3 py-4 rounded text-[11px] font-bold uppercase tracking-widest transition-all",
                                !file ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#1E3A8A] text-white shadow-lg shadow-blue-100 hover:bg-blue-900"
                            )}
                        >
                            {uploading ? (
                                <>
                                    <BrainCircuit className="w-4 h-4 animate-spin" />
                                    Extracting Intelligence...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Execute Extraction
                                </>
                            )}
                        </button>
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
        </div>
    );
}
