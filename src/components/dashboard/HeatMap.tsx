"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Target, Info } from 'lucide-react';

interface HeatMapItem {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
}

interface HeatMapProps {
  title?: string;
  data: HeatMapItem[];
  className?: string;
  onItemClick?: (item: HeatMapItem) => void;
}

export function HeatMap({
  title,
  data,
  className,
  onItemClick
}: HeatMapProps) {

  // Monochromatic Blue Intelligence (Soft)
  const getBackgroundColor = (value: number) => {
    if (value >= 90) return 'bg-blue-800 text-white shadow-xl shadow-blue-200';
    if (value >= 80) return 'bg-blue-700 text-white shadow-lg shadow-blue-100';
    if (value >= 70) return 'bg-blue-600 text-white shadow-md shadow-blue-50';
    if (value >= 60) return 'bg-blue-500 text-blue-50 shadow-sm';
    if (value >= 50) return 'bg-blue-400 text-blue-50';
    if (value >= 40) return 'bg-blue-300 text-blue-900 opacity-80';
    return 'bg-blue-100 text-blue-800 opacity-60';
  };

  return (
    <div className={cn("p-0 bg-transparent flex flex-col", className)}>
      {title && (
        <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
                    <Target className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                    {title}
                </h3>
            </div>
            <Info className="w-4 h-4 text-slate-300" />
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {data.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={cn(
              "flex flex-col items-center justify-center p-6 transition-all duration-500 hover:scale-105 active:scale-95 group rounded-[2rem] border border-transparent",
              getBackgroundColor(item.value)
            )}
          >
            <span className="text-[10px] font-black tracking-widest uppercase mb-3 opacity-70 italic">
              {item.label}
            </span>
            <span className="text-3xl font-black italic tracking-tighter">
              {item.value}%
            </span>
            {item.secondaryValue !== undefined && (
              <div className="mt-4 pt-4 border-t border-current/20 w-full text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    PRECISION: {item.secondaryValue}%
                  </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
