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
    <div className="bg-white border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full rounded-none">
      {title && (
        <div className="bg-slate-900 p-6 text-white border-b-2 border-slate-900">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] italic leading-none">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
              {expandableContent && <th className="px-6 py-6 w-12 border-r border-slate-100 italic">ID</th>}
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-8 py-6 font-black tracking-widest border-r border-slate-100 last:border-r-0", 
                    col.className
                  )}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const id = rowId(row);
              const isExpanded = expandedRows.has(id);
              
              return (
                <React.Fragment key={id}>
                  <tr 
                    className={cn(
                      "group transition-all cursor-pointer",
                      isExpanded ? "bg-blue-50/50" : "hover:bg-slate-50"
                    )}
                    onClick={() => expandableContent && toggleRow(id)}
                  >
                    {expandableContent && (
                      <td className="px-6 py-5 border-r border-slate-50 text-center">
                        <div className={cn(
                            "w-6 h-6 flex items-center justify-center transition-all",
                            isExpanded ? "bg-blue-800 text-white rotate-180" : "bg-slate-100 text-slate-400 group-hover:bg-blue-800 group-hover:text-white"
                        )}>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td key={idx} className={cn("px-8 py-5 border-r border-slate-50 last:border-r-0 font-medium text-slate-700", col.className)}>
                        {typeof col.accessorKey === 'function' 
                          ? col.accessorKey(row) 
                          : (row[col.accessorKey] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                  
                  {isExpanded && expandableContent && (
                    <tr className="bg-white">
                      <td colSpan={columns.length + 1} className="p-0 border-b-2 border-blue-100">
                        <div className="overflow-hidden animate-in slide-in-from-top-4 duration-300">
                           {expandableContent(row)}
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
