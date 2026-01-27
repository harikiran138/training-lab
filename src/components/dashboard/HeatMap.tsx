"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';

interface HeatMapItem {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number;
}

interface HeatMapProps {
  title: string;
  data: HeatMapItem[];
}

export function HeatMap({ title, data }: HeatMapProps) {
  const getBlueScale = (value: number) => {
    if (value >= 90) return 'bg-[#1E3A8A] text-white';
    if (value >= 80) return 'bg-[#3B82F6] text-white';
    if (value >= 70) return 'bg-[#60A5FA] text-white';
    if (value >= 50) return 'bg-[#93C5FD] text-[#1E3A8A]';
    return 'bg-[#DBEAFE] text-[#1E3A8A]';
  };

  return (
    <div className="bg-white border border-slate-200 p-8 rounded shadow-sm h-full flex flex-col">
      {title && (
         <h3 className="text-[14px] font-extrabold text-[#1E3A8A] uppercase tracking-wider mb-10 border-l-4 border-[#1E3A8A] pl-4">
            {title}
         </h3>
      )}
      
      <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((item) => (
          <div 
            key={item.id}
            className={cn(
                "p-4 rounded border border-slate-100 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-default",
                getBlueScale(item.value)
            )}
          >
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 mb-1">{item.id}</p>
              <h4 className="text-xl font-black">{item.value}%</h4>
            </div>
            {item.secondaryValue !== undefined && (
              <p className="text-[10px] font-bold mt-4 opacity-60">STR: {item.secondaryValue}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#1E3A8A] rounded-sm"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">90%+</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#DBEAFE] rounded-sm"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">&lt;50%</span>
                </div>
            </div>
            <Layers className="w-4 h-4 text-slate-200" />
      </div>
    </div>
  );
}
