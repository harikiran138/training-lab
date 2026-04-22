import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StudentFeedbackWeekly from '@/models/StudentFeedbackWeekly';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('academic_year') || '2025-26';
        
        const feedbacks = await StudentFeedbackWeekly.find({ academic_year: year })
            .populate('branch_id', 'branch_code branch_name')
            .sort({ week_number: -1 })
            .lean();
            
        return NextResponse.json(feedbacks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const feedback = await StudentFeedbackWeekly.create(body);
        return NextResponse.json(feedback);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
