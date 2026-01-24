import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface ExcelUploaderProps {
    onUpload: (file: File) => void;
}

export function ExcelUploader({ onUpload }: ExcelUploaderProps) {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            onUpload(file);
        }
    }, [onUpload]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    }, [onUpload]);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-slate-50 transition-all cursor-pointer group"
        >
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleChange}
                className="hidden"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Upload Excel File</h3>
                <p className="text-slate-500 text-sm mb-4">Drag and drop or click to browse</p>
                <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm group-hover:border-indigo-200">
                    Choose File
                </span>
            </label>
        </div>
    );
}
