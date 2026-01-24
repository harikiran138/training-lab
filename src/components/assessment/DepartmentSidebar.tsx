import React from 'react';
import { LayoutGrid, BookOpen, GraduationCap, Activity, Settings, Database, Server, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DEPARTMENTS = [
    { id: 'CIVIL', name: 'Civil Engineering', icon: BookOpen },
    { id: 'EEE', name: 'EEE', icon: Activity },
    { id: 'MECH', name: 'Mechanical', icon: Settings },
    { id: 'ECE', name: 'ECE', icon: Cpu },
    { id: 'EVT', name: 'EVT', icon: Activity }, // Assuming EVT uses a generic icon for now
    { id: 'CSE', name: 'CSE', icon: Server },
    { id: 'CSD', name: 'CSD', icon: Database },
    { id: 'CSM', name: 'CSM', icon: LayoutGrid },
];

interface DepartmentSidebarProps {
    selectedDepartment: string;
    onSelectDepartment: (deptId: string) => void;
}

export function DepartmentSidebar({ selectedDepartment, onSelectDepartment }: DepartmentSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-300">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="font-bold text-white tracking-tight">Academia<span className="text-indigo-400">Hub</span></h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Departments
                </div>
                {DEPARTMENTS.map((dept) => {
                    const Icon = dept.icon;
                    const isSelected = selectedDepartment === dept.id;

                    return (
                        <button
                            key={dept.id}
                            onClick={() => onSelectDepartment(dept.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isSelected
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isSelected ? "text-indigo-200" : "text-slate-500")} />
                            {dept.id}
                            {isSelected && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.8)]" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        AD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Admin User</p>
                        <p className="text-xs text-slate-500 truncate">admin@college.edu</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
