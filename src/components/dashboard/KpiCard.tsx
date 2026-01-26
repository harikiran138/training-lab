"use client"

import React from 'react';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  label?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon: React.ElementType;
  className?: string;
  description?: string;
}

export function KpiCard({
  title,
  value,
  label,
  trend,
  trendDirection = 'neutral',
  status = 'neutral',
  icon: Icon,
  className,
  description
}: KpiCardProps) {
  
  const isHighlighted = status === 'success';
  const isAlert = status === 'danger';

  return (
    <div className={cn(
      "p-10 transition-all duration-500 group relative overflow-hidden rounded-[2.5rem] border border-slate-100",
      isHighlighted ? "bg-blue-600 text-white shadow-2xl shadow-blue-200 translate-y-[-4px]" : 
      isAlert ? "bg-white text-rose-900 border-rose-100 shadow-xl shadow-rose-50" :
      "bg-white text-slate-900 hover:shadow-2xl hover:shadow-blue-100 hover:translate-y-[-4px] shadow-xl shadow-slate-200/50",
      className
    )}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn(
          "mb-8 p-5 rounded-3xl transition-all duration-500 group-hover:scale-110",
          isHighlighted ? "bg-white/20 text-white backdrop-blur-md shadow-inner" : 
          isAlert ? "bg-rose-500 text-white shadow-lg shadow-rose-100" :
          "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl shadow-blue-200/50"
        )}>
          <Icon className="w-8 h-8" />
        </div>
        
        <div className="flex items-center gap-3 mb-4">
            <h3 className={cn(
                "text-[11px] font-black uppercase tracking-[0.3em]",
                isHighlighted ? "text-blue-100" : isAlert ? "text-rose-600" : "text-slate-400"
            )}>
                {title}
            </h3>
            {description && (
                <div className="relative group/tooltip">
                <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 hidden group-hover/tooltip:block w-56 p-4 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl shadow-2xl z-20">
                    {description}
                </div>
                </div>
            )}
        </div>

        <p className="text-5xl font-black tracking-tight leading-none tabular-nums animate-in fade-in slide-in-from-bottom-2 duration-700">
            {value}
        </p>
        
        {(label || trend) && (
            <div className="flex items-center gap-4 mt-8">
                {label && (
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest rounded-full px-4 py-1.5 border",
                        isHighlighted ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100"
                    )}>{label}</p>
                )}
                {trend && (
                    <span className={cn(
                        "text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        isHighlighted ? "text-blue-200" : 
                        trendDirection === 'up' ? 'text-emerald-500' : 'text-rose-500'
                    )}>
                        {trendDirection === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
                         trendDirection === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                        {trend}
                    </span>
                )}
            </div>
        )}
      </div>

      {/* Modern Background Accents */}
      <div className={cn(
          "absolute -bottom-10 -right-10 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 pointer-events-none",
          isHighlighted ? "text-white" : "text-blue-900"
      )}>
          <Icon className="w-48 h-48" />
      </div>
    </div>
  );
}
