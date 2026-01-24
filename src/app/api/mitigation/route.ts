import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MitigationTask from '@/models/MitigationTask';
import { getSession } from '@/lib/auth';
import { logAction } from '@/services/audit';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const branch_code = searchParams.get('branch_code');
        const status = searchParams.get('status');

        let query: any = {};
        if (branch_code) query.branch_code = branch_code;
        if (status) query.status = status;

        const tasks = await MitigationTask.find(query)
            .sort({ createdAt: -1 })
            .populate('created_by', 'name')
            .populate('assigned_to', 'name')
            .lean();

        return NextResponse.json({ success: true, data: tasks });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession();

        if (!session || !['admin', 'faculty'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const data = await req.json();
        const { branch_code, type, description, priority, assigned_to, due_date } = data;

        if (!branch_code || !type || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const task = await MitigationTask.create({
            branch_code,
            type,
            description,
            priority: priority || 'MEDIUM',
            assigned_to,
            due_date,
            created_by: session.id,
            status: 'PENDING'
        });

        await logAction(
            session.id,
            'CREATE_MITIGATION',
            'MitigationTask',
            task._id.toString(),
            { branch: branch_code, type }
        );

        return NextResponse.json({ success: true, data: task });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status, notes } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
        }

        const updateData: any = { status };
        if (notes) updateData.notes = notes;
        if (status === 'COMPLETED') {
            updateData.completed_at = new Date();
        }

        const task = await MitigationTask.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        await logAction(
            session.id,
            'UPDATE_MITIGATION_STATUS',
            'MitigationTask',
            task._id.toString(),
            { status }
        );

        return NextResponse.json({ success: true, data: task });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
