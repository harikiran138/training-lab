import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SyllabusLog from '@/models/SyllabusLog';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('academic_year') || '2025-26';
        
        const logs = await SyllabusLog.find({ academic_year: year })
            .populate('branch_id', 'branch_code branch_name')
            .sort({ week_number: -1, subject_name: 1 })
            .lean();
            
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const log = await SyllabusLog.create(body);
        return NextResponse.json(log);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, ...updates } = body;
        
        const log = await SyllabusLog.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json(log);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
