"use client"

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Info, 
  Database, 
  ChevronRight, 
  FileEdit,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INSTITUTIONAL_SCHEMAS, TableSchema } from '@/config/SchemaManager';

interface Props {
  schemaId: string;
  initialData?: any[];
  onSave: (data: any[]) => void;
  onClose: () => void;
}

export default function DynamicDataEntryForm({ schemaId, initialData, onSave, onClose }: Props) {
  const schema = INSTITUTIONAL_SCHEMAS[schemaId];
  const [data, setData] = useState<any[]>(initialData || schema.defaultData);

  const handleAddField = () => {
    const newEntry = {};
    schema.fields.forEach(f => {
      // @ts-ignore
      newEntry[f.key] = f.type === 'number' ? 0 : "";
    });
    setData([...data, newEntry]);
  };

  const handleRemoveField = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index: number, key: string, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [key]: value };
    setData(newData);
  };

  if (!schema) return <div className="p-10 text-rose-600 font-bold uppercase tracking-widest text-center">Schema ID Not Found</div>;

  return (
    <div className="bg-white rounded overflow-hidden shadow-2xl border border-slate-200">
      {/* HEADER */}
      <div className="bg-[#1E3A8A] px-8 py-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest leading-none">
              {schema.name} Registry
            </h3>
            <p className="text-[10px] text-blue-200 mt-1.5 font-bold uppercase tracking-widest opacity-60">
                {schema.description}
            </p>
          </div>
        </div>
        <button 
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
            <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-8 space-y-10">
        <div className="bg-blue-50 border-l-4 border-[#1E3A8A] p-5 flex gap-4 items-center">
          <Info className="w-5 h-5 text-[#1E3A8A] shrink-0" />
          <p className="text-[12px] font-bold text-slate-700">
            Authenticated session active. Read-only fields are automatically synchronized with the institutional analytics engine.
          </p>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-12">#</th>
                {schema.fields.map(field => (
                  <th 
                    key={field.key} 
                    className={cn(
                        "px-6 py-4 text-[10px] font-bold uppercase tracking-widest",
                        field.isCalculated || field.type === 'readOnly' ? "text-[#1E3A8A] bg-blue-50/50 italic" : "text-slate-500"
                    )}
                  >
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-300">0{idx + 1}</td>
                  {schema.fields.map(field => (
                    <td key={field.key} className="px-6 py-4">
                      {field.type === 'readOnly' ? (
                        <div className="text-[14px] font-black text-[#1E3A8A] italic">
                          {field.calculate ? field.calculate(row) : row[field.key]}
                          {field.key.includes('percent') || field.key === 'avg' || field.key === 'selection_rate' ? '%' : ''}
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea 
                          value={row[field.key] || ""}
                          onChange={(e) => handleUpdateField(idx, field.key, e.target.value)}
                          placeholder={field.label.toUpperCase()}
                          rows={3}
                          className="w-full bg-white border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-700 focus:border-[#1E3A8A] rounded transition-all shadow-sm outline-none placeholder:opacity-40 min-w-[200px]"
                        />
                      ) : (
                        <input 
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={row[field.key] || ""}
                          onChange={(e) => handleUpdateField(idx, field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                          placeholder={field.label.toUpperCase()}
                          className="w-full bg-white border border-slate-200 px-3 py-2 text-[13px] font-bold text-slate-700 focus:border-[#1E3A8A] rounded transition-all shadow-sm outline-none placeholder:opacity-40"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => handleRemoveField(idx)}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-100">
          <button 
            onClick={handleAddField}
            className="flex items-center gap-3 text-[#1E3A8A] font-bold text-[11px] uppercase tracking-widest px-6 py-3 bg-white border border-[#1E3A8A]/20 rounded hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Append New Entry
          </button>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
                onClick={onClose}
                className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
            >
                Cancel
            </button>
            <button 
              onClick={() => onSave(data)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-[#1E3A8A] text-white px-10 py-3 text-[11px] font-bold uppercase tracking-widest rounded shadow-xl hover:bg-blue-900 transition-all transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              Commit Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
