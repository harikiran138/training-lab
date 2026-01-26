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
      "p-8 border-2 transition-all group relative overflow-hidden rounded-none",
      isHighlighted ? "bg-blue-800 text-white border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]" : 
      isAlert ? "bg-rose-50 text-rose-900 border-rose-600 shadow-[10px_10px_0px_0px_rgba(225,29,72,0.1)]" :
      "bg-white text-slate-900 border-slate-100 hover:border-blue-600 shadow-[10px_10px_0px_0px_rgba(30,64,175,0.03)] hover:shadow-[10px_10px_0px_0px_rgba(30,64,175,1)]",
      className
    )}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn(
          "mb-6 p-3 border-2 transition-all group-hover:rotate-12",
          isHighlighted ? "bg-white text-blue-900 border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" : 
          isAlert ? "bg-rose-600 text-white border-transparent" :
          "bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-800 group-hover:text-white group-hover:border-slate-900"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
            <h3 className={cn(
                "text-[9px] font-black uppercase tracking-[0.4em]",
                isHighlighted ? "text-blue-200" : isAlert ? "text-rose-600" : "text-slate-400"
            )}>
                {title}
            </h3>
            {description && (
                <div className="relative group/tooltip">
                <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-48 p-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl z-20">
                    {description}
                </div>
                </div>
            )}
        </div>

        <p className="text-4xl font-black tracking-tighter leading-none uppercase italic">{value}</p>
        
        {(label || trend) && (
            <div className="flex items-center gap-3 mt-4">
                {label && (
                    <p className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] opacity-60 rounded-none px-3 py-0.5 border",
                        isHighlighted ? "border-white/20" : "border-slate-100"
                    )}>{label}</p>
                )}
                {trend && (
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                        isHighlighted ? "text-emerald-400" : 
                        trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                        {trendDirection === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
                         trendDirection === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {trend}
                    </span>
                )}
            </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
          <Icon className="w-24 h-24" />
      </div>
    </div>
  );
}
