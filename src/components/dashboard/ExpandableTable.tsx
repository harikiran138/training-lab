"use client"

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface ExpandableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  expandableContent?: (row: T) => React.ReactNode;
  rowId: (row: T) => string;
  title?: string;
}

export function ExpandableTable<T>({
  data,
  columns,
  expandableContent,
  rowId,
  title
}: ExpandableTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {title && (
        <div className="bg-white p-10 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-400">{title}</h3>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              {expandableContent && <th className="px-10 py-8 w-20 text-center italic text-blue-800">EXP</th>}
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-10 py-8 font-black tracking-widest border-r border-slate-50 last:border-r-0", 
                    col.className
                  )}
                >
                  <div className="flex items-center gap-3">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row) => {
              const id = rowId(row);
              const isExpanded = expandedRows.has(id);
              
              return (
                <React.Fragment key={id}>
                  <tr 
                    className={cn(
                      "group transition-all duration-300 cursor-pointer",
                      isExpanded ? "bg-blue-50/40" : "hover:bg-slate-50/80"
                    )}
                    onClick={() => expandableContent && toggleRow(id)}
                  >
                    {expandableContent && (
                      <td className="px-10 py-8 border-r border-slate-50 text-center">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                            isExpanded ? "bg-blue-600 text-white rotate-180 shadow-blue-200" : "bg-white text-slate-400 border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600"
                        )}>
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td key={idx} className={cn("px-10 py-8 border-r border-slate-50 last:border-r-0 font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors", col.className)}>
                        {typeof col.accessorKey === 'function' 
                          ? col.accessorKey(row) 
                          : (row[col.accessorKey] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                  
                  {isExpanded && expandableContent && (
                    <tr className="bg-white">
                      <td colSpan={columns.length + 1} className="p-0 border-b border-blue-50">
                        <div className="overflow-hidden animate-in slide-in-from-top-6 duration-500 ease-out">
                           <div className="p-10 bg-slate-50/30 rounded-b-[2rem]">
                              {expandableContent(row)}
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
