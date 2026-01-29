'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // Check if I can use this or just manual events. 
// I don't see react-dropzone in package.json. I will implement manual drag-drop to avoid installing new deps if possible, or just standard file input first.
// Actually, standard file input is safer. I'll implement a custom UI that triggers the hidden input.
import { Upload, File as FileIcon, Loader2, AlertCircle } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';
import { useRouter } from 'next/navigation';

export default function ImageUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (!droppedFile.type.startsWith('image/')) {
                setError('Please upload an image file.');
                return;
            }
            setFile(droppedFile);
            setError(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.set('file', file); // Ensure file is set from state if needed, though input type=file name="file" works too.
        // wait, if I use a controlled file state, the input might not have the file if I set it via drop.
        // So I must append it manually.

        try {
            const result = await uploadImage(formData);

            if (result.success && result.redirectUrl) {
                router.push(result.redirectUrl);
            } else {
                setError(result.error || 'Upload failed');
                setIsUploading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Upload Academic Record</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                        <select name="type" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="ATTENDANCE">Attendance Sheet</option>
                            <option value="TEST_RESULT">Test Result</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch Code</label>
                        <input type="text" name="branch_code" placeholder="e.g. CSE-A" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                        <input type="text" name="section" placeholder="A" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Week No</label>
                        <input type="number" name="week_no" placeholder="1" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                        <input type="text" name="semester" placeholder="1-1" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'
                        } ${file ? 'bg-slate-50' : ''}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        name="file" // Name it so FormData picks it up if selected via dialog
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {file ? (
                        <div className="flex flex-col items-center">
                            <FileIcon className="w-12 h-12 text-blue-600 mb-2" />
                            <p className="text-sm font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 text-slate-400 mb-2" />
                            <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || isUploading}
                    className={`w-full flex justify-center items-center py-3 px-4 rounded-md text-white font-medium transition-all ${!file || isUploading
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                        }`}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Processing with Gemini AI...
                        </>
                    ) : (
                        'Process Image'
                    )}
                </button>
            </form>
        </div>
    );
}
