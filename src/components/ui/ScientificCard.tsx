import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ScientificCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ScientificCard({ title, icon: Icon, children, action, className = '' }: ScientificCardProps) {
  return (
    <div className={`scientific-card flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-cyan-500" />}
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      
      {/* Body */}
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
}
