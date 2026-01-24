import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ branch_code: string }> }
) {
    try {
        await dbConnect();
        const { branch_code } = await params;

        const logs = await AuditLog.find({
            entity_type: 'AggregateSummary',
            entity_id: branch_code
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Transform to friendly format if needed, or send as is
        const formattedLogs = logs.map(log => ({
            _id: log._id,
            timestamp: log.createdAt,
            action: log.action,
            user: log.details?.user_name || 'Unknown',
            field: log.details?.field,
            old_value: log.details?.old_value,
            new_value: log.details?.new_value
        }));

        return NextResponse.json({ success: true, data: formattedLogs });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
