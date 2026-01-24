import React from 'react';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendValue?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ElementType;
  className?: string;
  description?: string;
}

export function KpiCard({
  title,
  value,
  trend,
  trendValue,
  trendDirection = 'neutral',
  status = 'neutral',
  icon: Icon,
  className,
  description
}: KpiCardProps) {
  
  const statusColors = {
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    danger: 'text-danger bg-danger/10 border-danger/20',
    neutral: 'text-neutral bg-neutral/10 border-neutral/20',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-neutral',
  };

  // Adjust trend color based on context (e.g. absent rate going down is good)
  // For now, we'll keep it simple logic but this is where advanced logic would go
  
  return (
    <div className={cn(
      "dashboard-card p-5 flex flex-col justify-between h-full relative group",
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
          {title}
          {description && (
            <div className="relative group/tooltip">
              <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
                {description}
              </div>
            </div>
          )}
        </h3>
        {Icon && (
          <div className={cn("p-2 rounded-lg", statusColors[status])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-end gap-3 mt-1">
        <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {value}
        </span>
      </div>

      {(trend || trendValue) && (
        <div className="flex items-center gap-2 mt-3 text-xs font-medium">
          <span className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800",
            trendDirection === 'up' ? 'text-success' : 
            trendDirection === 'down' ? 'text-danger' : 'text-slate-500'
          )}>
            {trendDirection === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
             trendDirection === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {trendValue}
          </span>
          <span className="text-slate-400">
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
