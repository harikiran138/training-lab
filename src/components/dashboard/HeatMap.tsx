"use client"

import React from 'react';
import { cn } from '@/lib/utils';

// Simple heatmap implementation
// In a real scenario, this might use a library or more complex logic
// This version expects pre-calculated color grades or simple values

interface HeatMapItem {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number; // e.g., Pass % alongside Attendance
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

  // Helper to determine color intensity based on value (0-100)
  const getBackgroundColor = (value: number) => {
    // Green gradient
    if (value >= 90) return 'bg-emerald-500 text-white';
    if (value >= 80) return 'bg-emerald-400 text-white';
    if (value >= 70) return 'bg-emerald-300 text-slate-800';
    if (value >= 60) return 'bg-emerald-200 text-slate-800';
    // Warning/Danger
    if (value >= 50) return 'bg-amber-200 text-slate-800';
    if (value >= 40) return 'bg-amber-300 text-slate-800';
    return 'bg-red-300 text-slate-800';
  };

  return (
    <div className={cn("dashboard-card p-6", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          {title} <span className="text-sm font-normal text-slate-400 ml-2">(Click to filter)</span>
        </h3>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {data.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group",
              getBackgroundColor(item.value)
            )}
          >
            <span className="text-sm font-bold truncate w-full text-center">
              {item.label}
            </span>
            <span className="text-xl font-bold">
              {item.value}%
            </span>
            {item.secondaryValue !== undefined && (
              <span className="text-xs opacity-75 mt-1">
                Pass: {item.secondaryValue}%
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
