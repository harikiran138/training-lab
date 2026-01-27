"use client"

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Database,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { TableSchema } from '@/config/SchemaManager';

interface Props {
  schema: TableSchema;
  initialData?: any[];
  onSave: (data: any[]) => void;
  onClose: () => void;
}

export default function GenericTableEntryForm({ schema, initialData, onSave, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setRows(initialData);
    } else {
      setRows(schema.defaultData || []);
    }
  }, [initialData, schema]);

  const handleUpdate = (idx: number, key: string, value: any) => {
    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], [key]: value };
    
    // Recalculate fields
    schema.fields.forEach(f => {
      if (f.isCalculated && f.calculate) {
        newRows[idx][f.key] = f.calculate(newRows[idx]);
      }
    });

    setRows(newRows);
  };

  const addRow = () => {
    const newRow: any = {};
    schema.fields.forEach(f => {
      newRow[f.key] = f.type === 'number' || f.type === 'percent' ? 0 : '';
    });
    setRows([...rows, newRow]);
  };

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1E3A8A] px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-300" />
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-widest leading-none">{schema.name}</h3>
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-60">
              {schema.category} :: {schema.description}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="border border-slate-100 rounded-lg overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-[#F8FAFC] border-b border-slate-200">
              <tr>
                {schema.fields.map(f => (
                  <th key={f.key} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  {schema.fields.map(f => (
                    <td key={f.key} className="px-4 py-2">
                      {f.type === 'readOnly' ? (
                        <span className="text-[12px] font-black text-[#1E3A8A]">
                          {f.calculate ? f.calculate(row) : row[f.key]}
                        </span>
                      ) : (
                        <input 
                          type={f.type === 'number' || f.type === 'percent' ? 'number' : 'text'}
                          value={row[f.key] || ''}
                          onChange={(e) => {
                            const val = f.type === 'number' || f.type === 'percent' ? parseFloat(e.target.value) : e.target.value;
                            handleUpdate(idx, f.key, val);
                          }}
                          className="w-full bg-transparent text-[12px] font-bold text-slate-600 outline-none border-b border-transparent focus:border-blue-200 py-1"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeRow(idx)} className="text-slate-200 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
           <button onClick={addRow} className="flex items-center gap-2 text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded transition-all">
             <Plus className="w-3.5 h-3.5" /> ADD ENTRY
           </button>
           
           <div className="flex gap-4">
              <button onClick={onClose} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">CANCEL</button>
              <button onClick={() => onSave(rows)} className="flex items-center gap-2 bg-[#1E3A8A] text-white px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-900 transition-all">
                <Database className="w-3.5 h-3.5" /> COMMIT REPOSITORY
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
