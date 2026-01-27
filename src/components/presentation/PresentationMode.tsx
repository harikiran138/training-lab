"use client"

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Calendar,
  Presentation,
  Grid
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function PresentationMode({ isOpen, onClose, children, title, subtitle }: PresentationModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
      {/* PRESENTATION HEADER */}
      <header className="h-20 bg-[#1E3A8A] text-white flex items-center justify-between px-10 shadow-xl border-b border-white/10">
        <div className="flex items-center gap-6">
          <div className="bg-white/10 p-2.5 rounded">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] text-blue-200 mt-1.5 font-bold uppercase tracking-[0.3em] opacity-60">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFullscreen}
            className="p-3 hover:bg-white/10 rounded-full transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-3 bg-white/10 hover:bg-rose-600 px-6 py-2.5 rounded font-bold text-[11px] uppercase tracking-widest transition-all border border-white/10"
          >
            <X className="w-4 h-4" /> Exit
          </button>
        </div>
      </header>

      {/* SLIDE CONTENT AREA */}
      <main className="flex-grow overflow-y-auto bg-[#F8FAFC]">
        <div className="max-w-[1600px] mx-auto p-12 lg:p-20 presentation-content">
            {/* INJECTED SLIDE DATA */}
            <div className="animate-in slide-in-from-bottom-8 duration-700">
                {children}
            </div>
        </div>
      </main>

      {/* PRESENTATION FOOTER / CONTROLS */}
      <footer className="h-16 bg-white border-t border-slate-100 flex items-center justify-between px-10">
         <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            Institutional Review :: Restricted Access
         </div>

         <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#1E3A8A]"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            </div>
         </div>

         <div className="flex items-center gap-8 text-[11px] font-black text-[#1E3A8A]/40">
            <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
         </div>
      </footer>

      <style jsx global>{`
        .presentation-content .kpi-number {
          font-size: 48px !important;
        }
        .presentation-content h3 {
          font-size: 18px !important;
          margin-bottom: 24px !important;
        }
        .presentation-content .clean-table th {
          padding: 20px 24px !important;
          font-size: 14px !important;
        }
        .presentation-content .clean-table td {
          padding: 20px 24px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
}
