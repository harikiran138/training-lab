"use client"

import React, { useState, useRef } from 'react';
import { 
    Upload, 
    Image as ImageIcon, 
    Zap, 
    Activity, 
    ShieldCheck, 
    Check, 
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    onExtracted: (data: Record<string, any>[]) => void;
}

export default function VisionEntryCard({ onExtracted }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Institutional Entry Error: Only visual streams (images) permitted.');
            return;
        }

        setStatus('scanning');
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Simulated progress for UI fidelity
            const interval = setInterval(() => {
                setProgress(prev => (prev < 90 ? prev + 10 : prev));
            }, 500);

            const res = await fetch('/api/ingest/vision', {
                method: 'POST',
                body: formData
            });

            clearInterval(interval);
            const result = await res.json();

            if (result.success && result.data.length > 0) {
                setProgress(100);
                setStatus('complete');
                setTimeout(() => {
                    onExtracted(result.data);
                    setStatus('idle');
                }, 1000);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-[#1E3A8A]/30 transition-all group relative overflow-hidden">
            <div className={cn(
                "flex flex-col items-center justify-center text-center gap-6 py-10",
                status === 'scanning' ? "opacity-20 blur-sm" : "opacity-100"
            )}>
                <div className="w-16 h-16 bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                    <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#1E3A8A]">Institutional Vision Entry</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                        Drop high-fidelity screenshots or scans of attendance sheets for AI extraction.
                    </p>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    accept="image/*"
                />

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 bg-[#1E3A8A] text-white px-8 py-3 rounded text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-900 transition-all"
                >
                    <Upload className="w-4 h-4" /> UPLOAD IMAGE
                </button>
            </div>

            {/* SCANNING OVERLAY */}
            {status === 'scanning' && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-8 animate-in fade-in duration-300">
                    <div className="relative">
                        <Loader2 className="w-20 h-20 text-[#1E3A8A] animate-spin opacity-20" />
                        <Zap className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="space-y-4 text-center">
                        <p className="text-[12px] font-black text-[#1E3A8A] uppercase tracking-[0.3em]">AI OCR Engine Initializing...</p>
                        <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto">
                            <div className="h-full bg-[#1E3A8A] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS OVERLAY */}
            {status === 'complete' && (
                <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white gap-6 animate-in zoom-in duration-300">
                     <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <Check className="w-10 h-10" />
                     </div>
                     <p className="text-[14px] font-black uppercase tracking-[0.3em]">Data Recognized</p>
                </div>
            )}

            {/* ERROR OVERLAY */}
            {status === 'error' && (
                <div className="absolute inset-0 bg-rose-500 flex flex-col items-center justify-center text-white gap-6 animate-in zoom-in duration-300">
                     <AlertCircle className="w-12 h-12" />
                     <div className="text-center space-y-2">
                        <p className="text-[12px] font-black uppercase tracking-[0.3em]">Recognition Failure</p>
                        <button onClick={() => setStatus('idle')} className="text-[9px] font-bold underline uppercase tracking-widest opacity-60">Try Another Stream</button>
                     </div>
                </div>
            )}

            <div className="absolute top-4 right-4 text-[9px] font-black text-slate-200 uppercase tracking-widest pointer-events-none">
                Zero-G Vision v5.0
            </div>
        </div>
    );
}
