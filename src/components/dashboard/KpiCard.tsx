"use client"

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  label?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

export function KpiCard({ title, value, icon: Icon, description, status = 'neutral', label, trend, trendDirection }: KpiCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-emerald-600';
      case 'warning': return 'text-amber-500';
      case 'danger': return 'text-rose-600';
      default: return 'text-[#1E3A8A]';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'success': return 'border-t-emerald-500';
      case 'warning': return 'border-t-amber-500';
      case 'danger': return 'border-t-rose-500';
      default: return 'border-t-[#1E3A8A]';
    }
  };

  return (
    <div className={cn(
      "bg-white border border-slate-200 border-t-[4px] px-6 py-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden",
      getBorderColor()
    )}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="p-2 bg-slate-50 rounded">
            <Icon className="w-4 h-4 text-[#1E3A8A] opacity-60" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-end gap-2">
            <h4 className={cn("text-3xl font-extrabold tracking-tighter leading-none", getStatusColor())}>
              {value}
            </h4>
            {trend && (
              <div className={cn(
                "flex items-center text-[10px] font-black mb-1 px-1.5 py-0.5 rounded",
                trendDirection === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {trend}
              </div>
            )}
          </div>
          {label && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          )}
        </div>
      </div>

      {description && (
        <p className="text-[12px] text-slate-500 mt-6 leading-snug font-medium pt-4 border-t border-slate-50">
          {description}
        </p>
      )}
    </div>
  );
}
