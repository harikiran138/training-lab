"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X, History, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditHistory } from './AuditHistory';
import { useRouter } from 'next/navigation';

interface EditableCellProps {
    value: any;
    branchCode: string;
    field: string;
    isEdited?: boolean;
    type?: 'number' | 'text';
    suffix?: string;
    onRefresh?: () => void;
}

export function EditableCell({ value, branchCode, field, isEdited = false, type = 'number', suffix = '', onRefresh }: EditableCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [tempValue, setTempValue] = useState(value);
    const [saving, setSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const router = useRouter();

    // Update local state when prop value changes (e.g. after refresh)
    useEffect(() => {
        setCurrentValue(value);
        setTempValue(value);
    }, [value]);

    const handleSave = async () => {
        if (tempValue === currentValue) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/summary/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branch_code: branchCode,
                    field,
                    value: type === 'number' ? Number(tempValue) : tempValue
                })
            });

            if (res.ok) {
                setIsEditing(false);
                setCurrentValue(tempValue);
                if (onRefresh) onRefresh();
                router.refresh();
            } else {
                alert('Failed to save');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const handleRevert = async () => {
        if (!confirm('Are you sure you want to revert to the original AI-calculated value?')) return;

        try {
            const res = await fetch('/api/summary/revert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branch_code: branchCode,
                    field
                })
            });

            if (res.ok) {
                setShowHistory(false);
                if (onRefresh) onRefresh();
                router.refresh();
            } else {
                alert('Failed to revert');
            }
        } catch (e) {
            console.error(e);
            alert('Error reverting');
        }
    };

    return (
        <div className="relative group flex items-center gap-2 min-h-[32px]">
            {isEditing ? (
                <div className="flex items-center gap-1 bg-white shadow-lg rounded p-1 absolute left-[-8px] z-10 border border-indigo-100">
                    <input
                        autoFocus
                        type={type}
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                                setTempValue(currentValue);
                            }
                        }}
                    />
                    <button onClick={handleSave} disabled={saving} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded disabled:opacity-50">
                        <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setIsEditing(false); setTempValue(currentValue); }} className="p-1 hover:bg-rose-50 text-rose-600 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <>
                    <div
                        onClick={() => setIsEditing(true)}
                        className={cn(
                            "cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors flex items-center gap-1.5 group/value",
                            isEdited && "bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium"
                        )}
                    >
                        <span>{typeof currentValue === 'number' && type === 'number' ? Number(currentValue).toFixed(1) : currentValue}{suffix}</span>
                        {isEdited && <Edit2 className="w-3 h-3 opacity-50" />}
                        <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/value:opacity-100 transition-opacity" />
                    </div>

                    <button
                        onClick={() => setShowHistory(true)}
                        className={cn(
                            "p-1 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all",
                            isEdited && "opacity-100 text-amber-400 hover:text-amber-600 hover:bg-amber-100"
                        )}
                        title="View History"
                    >
                        <History className="w-3.5 h-3.5" />
                    </button>
                </>
            )}

            <AuditHistory
                branchCode={branchCode}
                field={field}
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onRevert={handleRevert}
            />
        </div>
    );
}
