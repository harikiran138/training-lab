import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CrtAttendanceRecord from '@/models/CrtAttendanceRecord';
import { CrtAttendanceService } from '@/services/CrtAttendanceService';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const week_number = searchParams.get('week_number');

    let query: any = {};
    if (week_number) query.week_number = parseInt(week_number);

    const records = await CrtAttendanceRecord.find(query).sort({ branch_code: 1 });
    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { records, week_number } = await request.json();

    if (!records || !week_number) {
      return NextResponse.json({ error: 'records and week_number are required' }, { status: 400 });
    }

    // Process all records using the service to ensure consistent calculation
    const calculatedRecords = CrtAttendanceService.processData(records);
    
    // Prepare for bulk write
    const operations = calculatedRecords.map(rec => {
      const flattened = CrtAttendanceService.flattenForDB(rec, week_number);
      return {
        updateOne: {
          filter: { branch_code: rec.branch_code, week_number },
          update: { $set: flattened },
          upsert: true
        }
      };
    });

    const result = await CrtAttendanceRecord.bulkWrite(operations);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
