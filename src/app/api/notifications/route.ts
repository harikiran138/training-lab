import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MitigationTask from '@/models/MitigationTask';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch pending/in-progress tasks for user's branches or explicitly assigned.
        // For Faculty, show tasks for their assigned branches.
        const query: any = { status: { $in: ['PENDING', 'IN_PROGRESS'] } };

        if (session.role === 'faculty' && session.branches && session.branches.length > 0) {
            query.branch_code = { $in: session.branches };
        } else if (session.role !== 'admin') {
            // viewer/other see nothing or just explicitly assigned?
            // for now let's assume faculty is the primary receiver.
            return NextResponse.json({ success: true, data: [] });
        }

        const tasks = await MitigationTask.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({ success: true, data: tasks });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
