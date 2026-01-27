"use client"

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column {
  header: string;
  accessorKey: string | ((row: any) => React.ReactNode);
  sortable?: boolean;
  className?: string;
}

interface ExpandableTableProps {
  title?: string;
  data: any[];
  columns: Column[];
  rowId: (row: any) => string | number;
  expandableContent?: (row: any) => React.ReactNode;
}

export function ExpandableTable({ title, data, columns, rowId, expandableContent }: ExpandableTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleRow = (id: string | number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredData = data.filter(row => 
    JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
      {/* HEADER SECTION */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        {title && (
          <h3 className="text-[14px] font-extrabold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-3">
             <FileText className="w-4 h-4" />
             {title}
          </h3>
        )}
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
              type="text"
              placeholder="Filter results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-[12px] font-medium rounded focus:ring-1 focus:ring-blue-100 transition-all"
           />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1E3A8A] border-b border-[#1E3A8A]">
              <th className="px-6 py-3 w-10"></th>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-widest">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row) => {
              const id = rowId(row);
              const isExpanded = expandedRows.has(id);
              
              return (
                <React.Fragment key={id}>
                  <tr 
                    className={cn(
                        "group transition-all hover:bg-blue-50/50 cursor-pointer",
                        isExpanded ? "bg-blue-50/30" : "odd:bg-white even:bg-[#FAFBFC]"
                    )}
                    onClick={() => toggleRow(id)}
                  >
                    <td className="px-6 py-4">
                        {expandableContent && (
                            <div className="p-1 rounded bg-slate-100 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                        )}
                    </td>
                    {columns.map((col, idx) => (
                      <td key={idx} className={cn("px-6 py-4 text-[13px] font-medium text-slate-700", col.className)}>
                        {typeof col.accessorKey === 'function' 
                          ? col.accessorKey(row) 
                          : row[col.accessorKey as string]}
                      </td>
                    ))}
                  </tr>
                  
                  {isExpanded && expandableContent && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={columns.length + 1} className="px-8 py-8 border-b border-slate-200">
                         <div className="bg-white border border-slate-200 rounded p-6 shadow-inner">
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
        
        {filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-400 text-[12px] font-bold uppercase tracking-widest italic">
                Zero Records Found
            </div>
        )}
      </div>
    </div>
  );
}
