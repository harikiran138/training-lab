"use client"

import React from 'react';
import { EditableCell } from './EditableCell';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PerformanceTable({ summaries, onRefresh }: { summaries: any[], onRefresh?: () => void }) {

    // Checking if a value is overridden
    // We assume the data passed here already has 'overrides' populated if available via the API
    // However, the 'summaries' passed from page.tsx might need to be structured to include 'overrides' and 'ai_values'
    // The server-side code finds 'summaries' using .lean(). 
    // We need to ensure we pass overrides.

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
                <h4 className="font-semibold text-slate-900">Branch Performance Summary</h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-sm font-medium">
                            <th className="px-6 py-4">Branch</th>
                            <th className="px-6 py-4">Attendance</th>
                            <th className="px-6 py-4">Test Pass %</th>
                            <th className="px-6 py-4">Syllabus %</th>
                            <th className="px-6 py-4">Weeks</th>
                            <th className="px-6 py-4">Grade</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {summaries.map((branch: any) => {
                            const overrides = branch.overrides || {};

                            return (
                                <tr key={branch.branch_code} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{branch.branch_code}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <EditableCell
                                            value={branch.avg_attendance}
                                            branchCode={branch.branch_code}
                                            field="avg_attendance"
                                            isEdited={!!overrides.avg_attendance}
                                            suffix="%"
                                            onRefresh={onRefresh}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <EditableCell
                                            value={branch.avg_test_pass}
                                            branchCode={branch.branch_code}
                                            field="avg_test_pass"
                                            isEdited={!!overrides.avg_test_pass}
                                            suffix="%"
                                            onRefresh={onRefresh}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <EditableCell
                                            value={branch.syllabus_completion_percent}
                                            branchCode={branch.branch_code}
                                            field="syllabus_completion_percent"
                                            isEdited={!!overrides.syllabus_completion_percent}
                                            suffix="%"
                                            onRefresh={onRefresh}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{branch.total_weeks}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-md text-xs font-bold",
                                            branch.performance_grade.startsWith('A') ? "bg-emerald-100 text-emerald-700" :
                                                branch.performance_grade.startsWith('B') ? "bg-indigo-100 text-indigo-700" :
                                                    "bg-amber-100 text-amber-700"
                                        )}>
                                            {branch.performance_grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {branch.avg_test_pass < 50 ? (
                                            <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Critical
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Stable
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
