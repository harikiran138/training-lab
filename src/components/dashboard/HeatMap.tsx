"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

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

  // Monochromatic Blue Intelligence
  const getBackgroundColor = (value: number) => {
    if (value >= 90) return 'bg-blue-900 text-white border-slate-900';
    if (value >= 80) return 'bg-blue-800 text-white border-blue-900';
    if (value >= 70) return 'bg-blue-700 text-white border-blue-800';
    if (value >= 60) return 'bg-blue-600 text-blue-50 border-blue-700';
    if (value >= 50) return 'bg-blue-500 text-blue-50 border-blue-600';
    if (value >= 40) return 'bg-blue-400 text-blue-900 border-blue-500';
    return 'bg-blue-50 text-blue-900 border-blue-100';
  };

  return (
    <div className={cn("p-0 bg-transparent flex flex-col", className)}>
      {title && (
        <div className="flex items-center gap-4 mb-8">
            <Target className="w-5 h-5 text-blue-800" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                {title}
            </h3>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {data.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={cn(
              "flex flex-col items-center justify-center p-4 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none group rounded-none",
              getBackgroundColor(item.value)
            )}
          >
            <span className="text-[10px] font-black tracking-widest uppercase mb-2 opacity-80 italic">
              {item.label}
            </span>
            <span className="text-2xl font-black italic tracking-tighter">
              {item.value}%
            </span>
            {item.secondaryValue !== undefined && (
              <div className="mt-2 pt-2 border-t border-current/20 w-full text-center">
                  <span className="text-[8px] font-black uppercase tracking-tight opacity-70">
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
