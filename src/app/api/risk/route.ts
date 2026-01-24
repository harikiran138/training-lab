import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AggregateSummary from '@/models/AggregateSummary';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const summaries = await AggregateSummary.find({}).lean();

        const highRisk = summaries.filter((s: any) => s.avg_test_pass < 50 || s.avg_attendance < 65);
        const criticalSyllabus = summaries.filter((s: any) => s.syllabus_completion_percent < 30);

        return NextResponse.json({
            success: true,
            highRisk: JSON.parse(JSON.stringify(highRisk)),
            criticalSyllabus: JSON.parse(JSON.stringify(criticalSyllabus))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
