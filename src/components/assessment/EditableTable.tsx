'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, Edit2 } from 'lucide-react';

export interface Column<T> {
    key: keyof T;
    header: string;
    width?: string;
    editable?: boolean;
    render?: (value: unknown, row: T) => React.ReactNode;
}

interface EditableTableProps<T> {
    title: string;
    columns: Column<T>[];
    data: T[];
    onUpdate: (rowIndex: number, key: keyof T, value: string | number | boolean) => void;
    className?: string;
}

export function EditableTable<T extends { id: string | number }>({
    title,
    columns,
    data,
    onUpdate,
    className
}: EditableTableProps<T>) {
    // Using local state to manage the input value while editing
    const [editingCell, setEditingCell] = useState<{ rowId: string | number, key: keyof T } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const handleCellClick = (row: T, key: keyof T, value: unknown) => {
        const col = columns.find(c => c.key === key);
        if (col?.editable) {
            setEditingCell({ rowId: row.id, key });
            setEditValue(String(value));
        }
    };

    const handleSave = () => {
        if (editingCell) {
            // Find the row index to update (in a real app we might use ID directly)
            // optimizing for this simple implementation:
            const rowIndex = data.findIndex(r => r.id === editingCell.rowId);
            if (rowIndex !== -1) {
                onUpdate(rowIndex, editingCell.key, editValue);
            }
            setEditingCell(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    return (
        <div className={cn("bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col", className)}>
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h4 className="font-semibold text-slate-800">{title}</h4>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className={cn("px-6 py-3 font-medium", col.width)}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-slate-50/50 transition-colors group"
                            >
                                {columns.map((col) => {
                                    const isEditing = editingCell?.rowId === row.id && editingCell?.key === col.key;
                                    const value = row[col.key];

                                    return (
                                        <td
                                            key={String(col.key)}
                                            onClick={() => handleCellClick(row, col.key, value)}
                                            className={cn(
                                                "px-6 py-3 text-sm text-slate-600 relative",
                                                col.editable && "cursor-pointer hover:bg-indigo-50/30"
                                            )}
                                        >
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={handleSave}
                                                    onKeyDown={handleKeyDown}
                                                    className="absolute inset-0 w-full h-full px-5 py-2 bg-white border-2 border-indigo-500 focus:outline-none text-indigo-900 font-medium z-10"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span>{col.render ? col.render(value, row) : value as React.ReactNode}</span>
                                                    {col.editable && (
                                                        <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No data available for this section.
                    </div>
                )}
            </div>
        </div>
    );
}
