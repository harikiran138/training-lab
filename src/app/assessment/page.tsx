'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AssessmentLayout } from '@/components/assessment/AssessmentLayout';
import { DepartmentSidebar } from '@/components/assessment/DepartmentSidebar';
import { TopMetrics } from '@/components/assessment/TopMetrics';
import { EditableTable, Column } from '@/components/assessment/EditableTable';
import { SectionTrendChart } from '@/components/assessment/SectionTrendChart';
import { SectionInsights } from '@/components/assessment/SectionInsights';
import {
    Loader2,
    CheckCircle2,
    Plus,
    FileText,
    FileSpreadsheet,
    Lock,
    Calendar,
    Settings2
} from 'lucide-react';
import { generatePDF, generateExcel } from '@/utils/export';
import { generateSectionInsights } from '@/services/InsightService';
import { cn } from '@/lib/utils';

// --- Types ---
interface AttendanceRow {
    id: string;
    week: string;
    strength: number;
    hours: number;
    avgAttendance: number;
    status: string;
}

interface AssessmentRow {
    id: string;
    testName: string;
    strength: number;
    avgAttendance: number;
    avgPassed: number;
    status: string;
}

interface ICRTWeeklyReportData {
    _id: string;
    week_no: number;
    sessions: number;
    branch_code: string;
    semester: string;
    status: 'draft' | 'finalized';
    attendance: {
        avg_attendance_percent: number;
    };
    tests: {
        avg_test_attendance_percent: number;
        avg_test_pass_percent: number;
    };
    syllabus: {
        covered: number;
        total: number;
    };
    computed: {
        overall_score: number;
    };
}

interface BranchData {
    branch_code: string;
    branch_name: string;
    total_students: number;
    laptop_holders: number;
}

interface SummaryData {
    branch_code: string;
    avg_attendance: number;
    avg_test_pass: number;
}

// --- Component ---
export default function AssessmentPage() {
    const [selectedDept, setSelectedDept] = useState('CIVIL');
    const [selectedSection, setSelectedSection] = useState('A');
    const [semester, setSemester] = useState('SEM1');
    const [academicYear, setAcademicYear] = useState('2026-27');

    const [availableSections, setAvailableSections] = useState<string[]>(['A']);
    const [branches, setBranches] = useState<BranchData[]>([]);
    const [deptSummaries, setDeptSummaries] = useState<SummaryData[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Data State
    const [rawReports, setRawReports] = useState<ICRTWeeklyReportData[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
    const [assessmentData, setAssessmentData] = useState<AssessmentRow[]>([]);

    // Fetch Reference Data on Mount
    useEffect(() => {
        const fetchRefs = async () => {
            try {
                const [bRes, sRes] = await Promise.all([
                    fetch('/api/branches'),
                    fetch('/api/summary')
                ]);
                if (bRes.ok) setBranches(await bRes.json());
                if (sRes.ok) setDeptSummaries(await sRes.json());
            } catch (err) {
                console.error('Failed to fetch reference data', err);
            }
        };
        fetchRefs();
    }, []);

    // Fetch Sections when Dept changes
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await fetch(`/api/assessment/sections?branch=${selectedDept}`);
                if (res.ok) {
                    const sections = await res.json() as string[];
                    if (Array.isArray(sections) && sections.length > 0) {
                        setAvailableSections(sections);
                        if (!sections.includes(selectedSection)) {
                            setSelectedSection(sections[0]);
                        }
                    } else {
                        setAvailableSections(['A']);
                        setSelectedSection('A');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch sections', err);
                setAvailableSections(['A']);
            }
        };
        fetchSections();
    }, [selectedDept]);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/assessment/data?branch=${selectedDept}&section=${selectedSection}&semester=${semester}`);
            if (res.ok) {
                const reports = await res.json() as ICRTWeeklyReportData[];
                setRawReports(reports);

                const currentBranch = branches.find(b => b.branch_code === selectedDept);
                const strength = currentBranch?.total_students || 60;

                setAttendanceData(reports.map((r) => ({
                    id: r._id,
                    week: `Week ${r.week_no}`,
                    strength: strength,
                    hours: r.sessions,
                    avgAttendance: r.attendance.avg_attendance_percent,
                    status: r.status
                })));

                setAssessmentData(reports.map((r) => ({
                    id: r._id,
                    testName: `Week ${r.week_no} Test`,
                    strength: strength,
                    avgAttendance: r.tests?.avg_test_attendance_percent || 0,
                    avgPassed: r.tests?.avg_test_pass_percent || 0,
                    status: r.status
                })));
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDept, selectedSection, branches, semester]);

    const handleAttendanceUpdate = (rowIndex: number, key: keyof AttendanceRow, value: string | number | boolean) => {
        const row = attendanceData[rowIndex];
        if (row.status === 'finalized') return;

        const updated = [...attendanceData];
        let cleanValue = value;
        if (key === 'hours' || key === 'avgAttendance') {
            cleanValue = Number(value);
        }

        updated[rowIndex] = { ...row, [key]: cleanValue } as AttendanceRow;
        setAttendanceData(updated);

        // Map UI key to DB Structure
        const dbUpdates: Record<string, any> = {};
        if (key === 'hours') dbUpdates['sessions'] = cleanValue;
        if (key === 'avgAttendance') dbUpdates['attendance.avg_attendance_percent'] = cleanValue;

        if (Object.keys(dbUpdates).length > 0) {
            handleUpdate(row.id, dbUpdates);
        }
    };

    const handleAssessmentUpdate = (rowIndex: number, key: keyof AssessmentRow, value: string | number | boolean) => {
        const row = assessmentData[rowIndex];
        if (row.status === 'finalized') return;

        const updated = [...assessmentData];
        let cleanValue = value;
        if (key === 'avgAttendance' || key === 'avgPassed') {
            cleanValue = Number(value);
        }

        updated[rowIndex] = { ...row, [key]: cleanValue } as AssessmentRow;
        setAssessmentData(updated);

        // Map UI key to DB Structure
        const dbUpdates: Record<string, any> = {};
        if (key === 'avgAttendance') dbUpdates['tests.avg_test_attendance_percent'] = cleanValue;
        if (key === 'avgPassed') dbUpdates['tests.avg_test_pass_percent'] = cleanValue;

        if (Object.keys(dbUpdates).length > 0) {
            handleUpdate(row.id, dbUpdates);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Analytics & Insights ---
    const chartData = useMemo(() => {
        return attendanceData.map((att, index) => {
            const assess = assessmentData[index];
            return {
                week: att.week,
                attendance: att.avgAttendance,
                passRate: assess?.avgPassed || 0
            };
        });
    }, [attendanceData, assessmentData]);

    const insights = useMemo(() => {
        const currentDeptSummary = deptSummaries.find(s => s.branch_code === selectedDept);
        return generateSectionInsights(chartData, currentDeptSummary ? {
            attendance: currentDeptSummary.avg_attendance,
            passRate: currentDeptSummary.avg_test_pass
        } : undefined);
    }, [chartData, deptSummaries, selectedDept]);

    const metrics = useMemo(() => {
        const totalAttend = attendanceData.reduce((acc, curr) => acc + curr.avgAttendance, 0);
        const avgAttend = attendanceData.length ? Math.round(totalAttend / attendanceData.length) : 0;
        const totalPass = assessmentData.reduce((acc, curr) => acc + curr.avgPassed, 0);
        const avgPass = assessmentData.length ? Math.round(totalPass / assessmentData.length) : 0;
        const currentBranch = branches.find(b => b.branch_code === selectedDept);

        return {
            crtDays: attendanceData.length * 2,
            crtHours: attendanceData.reduce((acc, curr) => acc + curr.hours, 0),
            laptopCount: currentBranch?.laptop_holders || 0,
            laptopPercentage: currentBranch?.total_students ? Math.round((currentBranch.laptop_holders / currentBranch.total_students) * 100) : 0,
            overallAttendance: avgAttend,
            testPassPercentage: avgPass,
        };
    }, [attendanceData, assessmentData, branches, selectedDept]);

    // --- Handlers ---
    const handleUpdate = async (reportId: string, updates: Record<string, string | number>) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/assessment/data', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, updates })
            });
            if (!res.ok) {
                const error = await res.json() as { error: string };
                throw new Error(error.error || 'Update failed');
            }
            setLastSaved(new Date());
            // If it was a status update, refresh everything
            if (updates.status) fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            alert(message);
            console.error('Error saving update:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalizeSection = async () => {
        if (!confirm('This will lock all currently visible reports for this section. Edits will be disabled. Continue?')) return;

        const updatePromises = rawReports
            .filter(r => r.status === 'draft')
            .map(r => handleUpdate(r._id, { status: 'finalized' }));

        await Promise.all(updatePromises);
    };

    const handleAddWeek = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/assessment/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branch: selectedDept, section: selectedSection, semester })
            });
            if (res.ok) {
                fetchData();
                setLastSaved(new Date());
            }
        } catch (err) {
            console.error('Failed to add week', err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Export ---
    const handleExportPDF = async () => {
        const doc = await generatePDF(rawReports as any, `${selectedDept} - Section ${selectedSection} Assessment Report`);
        doc.save(`${selectedDept}_Section_${selectedSection}_Report.pdf`);
    };

    const handleExportExcel = async () => {
        const workbook = await generateExcel(rawReports as any);
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${selectedDept}_Section_${selectedSection}_Report.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    // --- Column Configs ---
    const attendanceCols: Column<AttendanceRow>[] = [
        { key: 'week', header: 'Week / Topic' },
        {
            key: 'status',
            header: 'Locked',
            width: 'w-20',
            render: (val) => val === 'finalized' ? <Lock className="w-3.5 h-3.5 text-orange-400" /> : <div className="w-1 h-1 rounded-full bg-slate-200 ml-1.5" />
        },
        { key: 'hours', header: 'No of Hours', editable: true, width: 'w-32' },
        {
            key: 'avgAttendance',
            header: 'Avg Attendance (%)',
            editable: true,
            width: 'w-40',
            render: (val: unknown) => (val as number) === 0 ? '-' : `${val as number}%`
        },
    ];

    const assessmentCols: Column<AssessmentRow>[] = [
        { key: 'testName', header: 'Test Name / Topic' },
        {
            key: 'status',
            header: 'Locked',
            width: 'w-20',
            render: (val) => val === 'finalized' ? <Lock className="w-3.5 h-3.5 text-orange-400" /> : <div className="w-1 h-1 rounded-full bg-slate-200 ml-1.5" />
        },
        {
            key: 'avgAttendance',
            header: 'Avg Attend (%)',
            editable: true,
            width: 'w-40',
            render: (val: unknown) => `${val as number}%`
        },
        {
            key: 'avgPassed',
            header: 'Avg Passed (%)',
            editable: true,
            width: 'w-40',
            render: (val: unknown) => (
                <span className={(val as number) < 60 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {val as number}%
                </span>
            )
        },
    ];

    const currentBranchName = branches.find(b => b.branch_code === selectedDept)?.branch_name || selectedDept;

    return (
        <AssessmentLayout
            sidebar={
                <DepartmentSidebar
                    selectedDepartment={selectedDept}
                    onSelectDepartment={setSelectedDept}
                />
            }
        >
            <div className="space-y-8 max-w-7xl mx-auto pb-12 text-slate-900 px-4 sm:px-0">
                {/* Global Config Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Timeline
                        </div>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                            <option>2025-26</option>
                            <option>2026-27</option>
                        </select>
                        <div className="w-px h-4 bg-slate-200" />
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                            <option value="SEM1">Semester 1</option>
                            <option value="SEM2">Semester 2</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleFinalizeSection}
                            disabled={rawReports.length === 0 || rawReports.every(r => r.status === 'finalized')}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            Finalize All
                        </button>
                    </div>
                </div>

                {/* Dashboard Header */}
                <div className="flex flex-wrap justify-between items-end gap-6 pb-6 border-b border-slate-200">
                    <div className="min-w-[300px]">
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-none">{currentBranchName}</h2>
                        <div className="flex items-center gap-2 mt-3">
                            <p className="text-slate-500 font-semibold italic">Section {selectedSection} Performance Hub</p>
                            {isSaving ? (
                                <div className="flex items-center gap-2 ml-4 text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border-2 border-indigo-100 animate-pulse">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Synchronizing
                                </div>
                            ) : lastSaved && (
                                <div className="flex items-center gap-2 ml-4 text-[10px] uppercase font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border-2 border-emerald-100">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Vault Updated
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white rounded-xl border-2 border-slate-100 p-1 shadow-sm">
                            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all">
                                <FileText className="w-4 h-4" />
                                Export PDF
                            </button>
                            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-all">
                                <FileSpreadsheet className="w-4 h-4" />
                                Excel
                            </button>
                        </div>
                        <button
                            onClick={handleAddWeek}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            Add Week
                        </button>
                    </div>
                </div>

                {/* Top Metrics Area */}
                <TopMetrics
                    sections={availableSections}
                    selectedSection={selectedSection}
                    onSelectSection={setSelectedSection}
                    metrics={metrics}
                />

                {/* Analytics & Performance Diagnostics */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        <SectionTrendChart data={chartData} />
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-50 shadow-sm flex flex-col justify-center items-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="font-bold text-slate-900 mb-6 w-full text-center tracking-tight border-b border-slate-50 pb-4">Efficiency Index</h4>
                        <div className="relative flex items-center justify-center scale-110">
                            <svg className="w-44 h-44 transform -rotate-90">
                                <circle className="text-slate-50" strokeWidth="12" stroke="currentColor" fill="transparent" r="80" cx="88" cy="88" />
                                <circle className="text-indigo-600 transition-all duration-1000 ease-in-out" strokeWidth="12" strokeDasharray={502} strokeDashoffset={502 - (502 * metrics.overallAttendance) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="80" cx="88" cy="88" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-black text-slate-900">{metrics.overallAttendance}<span className="text-2xl">%</span></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Institutional</span>
                            </div>
                        </div>
                        <div className="mt-10 flex w-full border-t border-slate-50 pt-6">
                            <div className="flex-1 text-center border-r-2 border-slate-50 px-2">
                                <div className="text-lg font-black text-indigo-600">{metrics.testPassPercentage}%</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Certification</div>
                            </div>
                            <div className="flex-1 text-center px-2">
                                <div className="text-lg font-black text-slate-900">{attendanceData.length}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Cycles Completed</div>
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-1">
                        <SectionInsights insights={insights} />
                    </div>
                </div>

                {/* Data Entry & Audit Area */}
                <div className="pt-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-48 space-y-6">
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin opacity-20" />
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin absolute inset-0 m-auto" />
                            </div>
                            <p className="text-lg font-black text-slate-400 tracking-tighter uppercase italic">Aggregating workforce logistics</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-bold text-slate-900">Engagement Logs</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                        Manual Audit Required
                                    </div>
                                </div>
                                <EditableTable
                                    title="Weekly Attendance & Interaction"
                                    columns={attendanceCols}
                                    data={attendanceData}
                                    onUpdate={handleAttendanceUpdate}
                                    className="border-2 border-slate-50"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-bold text-slate-900">Knowledge Assessment</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                        Certification Track
                                    </div>
                                </div>
                                <EditableTable
                                    title="Performance & Testing Accuracy"
                                    columns={assessmentCols}
                                    data={assessmentData}
                                    onUpdate={handleAssessmentUpdate}
                                    className="border-2 border-slate-50"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AssessmentLayout>
    );
}
