import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IngestionLog from '@/models/IngestionLog';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        await dbConnect();
        const logs = await IngestionLog.find({}).sort({ upload_date: -1 }).limit(50).lean();
        
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
