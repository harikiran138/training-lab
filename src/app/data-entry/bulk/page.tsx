"use client"

import React, { useState } from 'react';
import { ExcelUploader } from '@/components/excel/ExcelUploader';
import { ColumnMapper } from '@/components/excel/ColumnMapper';
import { PreviewTable } from '@/components/excel/PreviewTable';
import { reportSchema } from '@/config/report-schema';
import { parseExcel, validateRows, getSheetData } from '@/lib/excel-utils';
import { ArrowLeft, Save, Loader2, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function BulkUploadPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [rawFile, setRawFile] = useState<{ headers: string[], data: any[] } | null>(null);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [validationResult, setValidationResult] = useState<{ valid: any[], invalid: any[] } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleUpload = async (file: File) => {
        try {
            const result = await parseExcel(file);
            setWorkbook(result.workbook);
            setSheetNames(result.sheetNames);
            if (result.sheetNames.length === 1) {
                handleSheetSelect(result.sheetNames[0], result.workbook);
            } else {
                setStep(1.5); // Sheet selection step
            }
        } catch (e) {
            console.error(e);
            alert('Failed to parse Excel file');
        }
    };

    const handleSheetSelect = (sheetName: string, activeWorkbook?: XLSX.WorkBook) => {
        const wb = activeWorkbook || workbook;
        if (!wb) return;
        const result = getSheetData(wb, sheetName);
        setRawFile(result);
        setSelectedSheet(sheetName);
        setStep(2);
    };

    const handleMappingChange = (newMapping: Record<string, string>) => {
        setMapping(newMapping);
    };

    const goToPreview = () => {
        if (!rawFile) return;
        const result = validateRows(rawFile.data, mapping, reportSchema);
        setValidationResult(result);
        setStep(3);
    };

    const handleSubmit = async () => {
        if (!validationResult || validationResult.valid.length === 0) return;

        setIsSubmitting(true);
        try {
            // Loop through and POST each record
            // The API uses findOneAndUpdate with upsert, so it handles duplicates
            const promises = validationResult.valid.map(row =>
                fetch('/api/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(row)
                })
            );

            const results = await Promise.all(promises);
            const allOk = results.every(r => r.ok);

            if (allOk) {
                setSubmitSuccess(true);
                // Refresh aggregate summary in background
                fetch('/api/summary?refresh=true');
                setTimeout(() => {
                    router.push('/data-entry');
                }, 2000);
            } else {
                alert('Some records failed to import. Please check the network log.');
            }

        } catch (e) {
            console.error(e);
            alert('Error submitting data');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Successful!</h2>
                <p className="text-slate-500">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/data-entry" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bulk Upload</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span className={step >= 1 ? "text-indigo-600 font-semibold" : ""}>1. Upload</span>
                        <span className="text-slate-300">/</span>
                        {sheetNames.length > 1 && (
                            <>
                                <span className={step === 1.5 ? "text-indigo-600 font-semibold" : ""}>Select Sheet</span>
                                <span className="text-slate-300">/</span>
                            </>
                        )}
                        <span className={step >= 2 ? "text-indigo-600 font-semibold" : ""}>2. Map Columns</span>
                        <span className="text-slate-300">/</span>
                        <span className={step >= 3 ? "text-indigo-600 font-semibold" : ""}>3. Validate & Submit</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[400px] p-8">

                {step === 1 && (
                    <div className="max-w-xl mx-auto py-12">
                        <ExcelUploader onUpload={handleUpload} />
                    </div>
                )}

                {step === 1.5 && (
                    <div className="max-w-md mx-auto py-12 space-y-6">
                        <div className="text-center">
                            <FileSpreadsheet className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900">Select Sheet</h3>
                            <p className="text-slate-500 text-sm">This file contains multiple sheets. Choose one to import.</p>
                        </div>
                        <div className="grid gap-3">
                            {sheetNames.map((name) => (
                                <button
                                    key={name}
                                    onClick={() => handleSheetSelect(name)}
                                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-slate-100 transition-all group"
                                >
                                    <span className="font-medium text-slate-700">{name}</span>
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                                        <Save className="w-3 h-3 text-transparent group-hover:text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Back to Upload
                        </button>
                    </div>
                )}

                {step === 2 && rawFile && (
                    <div className="space-y-6">
                        <ColumnMapper
                            sourceHeaders={rawFile.headers}
                            targetSchema={reportSchema}
                            onMappingChange={handleMappingChange}
                        />
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={goToPreview}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-slate-900 transition-all"
                            >
                                Next: Validate Data
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && validationResult && (
                    <div className="space-y-8">
                        <PreviewTable
                            validCount={validationResult.valid.length}
                            invalidRows={validationResult.invalid}
                            previewData={validationResult.valid.slice(0, 5)}
                            totalCount={validationResult.valid.length + validationResult.invalid.length}
                        />

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-all"
                            >
                                Back to Mapping
                            </button>

                            <div className="flex items-center gap-4">
                                <p className="text-sm text-slate-500">
                                    Ready to import <b>{validationResult.valid.length}</b> records
                                </p>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || validationResult.valid.length === 0}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-slate-900 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSubmitting ? 'Importing...' : 'Import Records'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
