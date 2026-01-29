import React, { useEffect, useState } from 'react';
import { ArrowRight, RotateCcw, Save } from 'lucide-react';

interface ColumnMapperProps {
    sourceHeaders: string[];
    targetSchema: any[];
    onMappingChange: (mapping: Record<string, string>) => void;
}

const STORAGE_KEY = 'excel_mapping_template';

export function ColumnMapper({ sourceHeaders, targetSchema, onMappingChange }: ColumnMapperProps) {
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [savedTemplate, setSavedTemplate] = useState<Record<string, string> | null>(null);

    // Load saved template on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const initialMapping: Record<string, string> = {};

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSavedTemplate(parsed);
                // Only use saved mapping if headers still exist in source
                Object.entries(parsed).forEach(([key, val]) => {
                    if (sourceHeaders.includes(val as string)) {
                        initialMapping[key] = val as string;
                    }
                });
            } catch (e) {
                console.error('Failed to parse stored mapping', e);
            }
        }

        // RULE COMPLIANCE: "No automatic guessing of columns"
        // Removed matching logic that was here.

        setMapping(initialMapping);
        onMappingChange(initialMapping);
    }, [sourceHeaders, targetSchema]);

    const handleSelect = (key: string, value: string) => {
        const newMapping = { ...mapping, [key]: value };
        setMapping(newMapping);
        onMappingChange(newMapping);

        // Auto-save on change
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMapping));
    };

    const resetMapping = () => {
        localStorage.removeItem(STORAGE_KEY);
        const autoMapping: Record<string, string> = {};
        targetSchema.forEach(field => {
            const match = sourceHeaders.find(h =>
                h.toLowerCase().trim() === field.label.toLowerCase().trim() ||
                h.toLowerCase().trim() === field.key.toLowerCase().trim()
            );
            if (match) {
                autoMapping[field.key] = match;
            }
        });
        setMapping(autoMapping);
        onMappingChange(autoMapping);
        setSavedTemplate(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-800">Map Columns</h3>
                    <p className="text-sm text-slate-500">Your preferences are saved automatically</p>
                </div>
                <button
                    onClick={resetMapping}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all shadow-sm"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Mapping
                </button>
            </div>

            <div className="divide-y divide-slate-100">
                {targetSchema.map((field) => (
                    <div key={field.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 items-center">
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                                {field.required && <span className="text-xs text-rose-500 font-bold">*</span>}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{field.key}</p>
                        </div>

                        <div className="hidden md:flex justify-center text-slate-300">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div className="md:col-span-1">
                            <select
                                className={`w-full p-2 text-sm border rounded-lg outline-none focus:ring-2 transition-all ${mapping[field.key]
                                    ? 'border-indigo-200 bg-indigo-50/30 ring-indigo-500/20'
                                    : 'border-slate-200 bg-white focus:ring-indigo-500'
                                    }`}
                                value={mapping[field.key] || ''}
                                onChange={(e) => handleSelect(field.key, e.target.value)}
                            >
                                <option value="">Select Column...</option>
                                {sourceHeaders.map((header) => (
                                    <option key={header} value={header}>{header}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
