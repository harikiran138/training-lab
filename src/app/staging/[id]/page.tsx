import dbConnect from '@/lib/mongodb';
import StagingData from '@/models/StagingData';
import DataReviewTable from '@/components/staging/DataReviewTable';
import { notFound } from 'next/navigation';
import { commitStagingData } from '@/app/actions/commit';
import { FileText } from 'lucide-react';

async function getStagingData(id: string) {
    await dbConnect();
    const doc = await StagingData.findById(id).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc)); // Serialize for Client Component
}

export default async function StagingPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params as per Next.js 15+ requirement
    const { id } = await params;
    const record = await getStagingData(id);

    if (!record) {
        notFound();
    }

    // Server Action to handle Commit (passed to client component or called via wrapper)
    // For simplicity, we can pass a server action via prop if we define it, 
    // or the client component calls an API/Action internally.
    // Let's create a separate action file for committing, and pass a wrapper function here or import it in Client Component.
    // I will import the action in the client component, so I don't need to pass it here.
    // However, the `DataReviewTable` expects `onCommit`. I'll wire it up in a wrapper or change `DataReviewTable` to `DataReviewContainer` later.
    // For now, let's just make `DataReviewTable` verify logic.
    // ACTUALLY: Defining `commitAction` here and passing it is cleaner.

    // BUT, Client Components cannot accept Server Actions as props directly if they are not Serialized? 
    // No, they can.

    // Wait, let's just mock the onCommit for now or better, create `src/app/actions/commit.ts`.

    // Server Action for Committing
    async function handleCommit(data: any[]) {
        'use server';
        await commitStagingData(id, data);
        // We could redirect here too, but the action revalidates.
    }

    return (
        <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden font-sans">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center z-30 shadow-sm sticky top-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                            Verification <span className="text-indigo-600">Terminal</span>
                        </h1>
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${record.type === 'ATTENDANCE'
                            ? 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm shadow-purple-50'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm shadow-indigo-50'
                            }`}>
                            {record.type}
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target:</span>
                            <span className="text-[11px] font-extrabold text-slate-700 uppercase">
                                {record.branch_code || 'ALL'} / {record.section || 'GEN'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Record Identifier</p>
                        <p className="font-mono text-xs text-slate-700 font-medium mt-1">{id}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Image Viewer with Glass Effect */}
                <div className="w-1/2 p-10 bg-slate-100/30 flex items-center justify-center overflow-auto border-r border-slate-200 relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                    <div className="relative z-10 bg-white p-3 rounded-2xl shadow-2xl shadow-slate-300 ring-1 ring-slate-200 transition-transform duration-500 group-hover:scale-[1.02]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={record.imageUrl}
                            alt="Ingested Document"
                            className="max-w-full h-auto rounded-lg object-contain max-h-[75vh]"
                        />
                        <div className="absolute -bottom-4 right-6 bg-slate-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest border border-slate-700">
                            Optical Ingestion Active
                        </div>
                    </div>
                </div>

                {/* Right Panel: Data Table with Modern Spacing */}
                <div className="w-1/2 p-10 flex flex-col bg-white">
                    <DataReviewTable
                        record={record}
                        onCommit={handleCommit}
                    />
                </div>
            </main>
        </div>
    );
}
