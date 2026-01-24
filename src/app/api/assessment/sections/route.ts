import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const branch = searchParams.get('branch');

        if (!branch) {
            return NextResponse.json({ error: 'Branch is required' }, { status: 400 });
        }

        await dbConnect();

        // Find distinct sections for this branch
        const sections = await CRTWeeklyReport.find({ branch_code: branch })
            .distinct('section');

        // Default to 'A' if no data found
        if (sections.length === 0) {
            return NextResponse.json(['A']);
        }

        return NextResponse.json(sections.sort());
    } catch (error) {
        console.error('Error fetching sections:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
