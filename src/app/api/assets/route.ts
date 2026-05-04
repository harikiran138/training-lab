import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StudentAsset from '@/models/StudentAsset';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('academic_year') || '2025-26';
        
        const assets = await StudentAsset.find({ academic_year: year })
            .populate('student_id', 'name roll_no branch')
            .lean();
            
        return NextResponse.json(assets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }
        await dbConnect();
        const body = await request.json();
        const asset = await StudentAsset.create(body);
        return NextResponse.json(asset);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }
        await dbConnect();
        const body = await request.json();
        const { id, ...updates } = body;
        
        const asset = await StudentAsset.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json(asset);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
