"use client"

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Generic Table Component
// Highly reusable and supports nested rows

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
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    // Basic implementation assumption: accessorKey is a string key for sorting
    // In a real app, you might need a dedicated sort function prop
  };

  return (
    <div className="dashboard-card overflow-hidden flex flex-col h-full">
      {title && (
        <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
            <tr>
              {expandableContent && <th className="px-6 py-3 w-4"></th>}
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-6 py-4 font-semibold tracking-wider", 
                    col.sortable ? "cursor-pointer hover:text-slate-700" : "",
                    col.className
                  )}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => {
              const id = rowId(row);
              const isExpanded = expandedRows.has(id);
              
              return (
                <React.Fragment key={id}>
                  <tr 
                    className={cn(
                      "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer",
                      isExpanded ? "bg-slate-50/80 dark:bg-slate-800/50" : ""
                    )}
                    onClick={() => expandableContent && toggleRow(id)}
                  >
                    {expandableContent && (
                      <td className="px-6 py-4">
                        {isExpanded ? 
                          <ChevronDown className="w-4 h-4 text-slate-400" /> : 
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        }
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td key={idx} className={cn("px-6 py-4 font-medium text-slate-700 dark:text-slate-300", col.className)}>
                        {typeof col.accessorKey === 'function' 
                          ? col.accessorKey(row) 
                          : (row[col.accessorKey] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                  
                  {isExpanded && expandableContent && (
                    <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                      <td colSpan={columns.length + 1} className="p-0">
                        <div className="overflow-hidden animate-in slide-in-from-top-2 duration-200">
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
