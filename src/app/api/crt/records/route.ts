import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CrtAttendanceRecord from '@/models/CrtAttendanceRecord';
import Branch from '@/models/Branch';
import { CrtAttendanceService } from '@/services/CrtAttendanceService';
import { generateWeeks, SEED_START_DATE, SEED_END_DATE } from '@/utils/week-generator';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const week_number = searchParams.get('week_number');

    let query: any = {};
    if (week_number) query.week_number = parseInt(week_number);

    // V2: Populate branch_id to get branch_code and name
    const records = await CrtAttendanceRecord.find(query)
      .populate('branch_id', 'branch_code branch_name')
      .lean();
    
    // Transform for Frontend Compatibility (Frontend expects { branch: 'CSE-A', ... })
    const transformed = records.map((r: any) => ({
       ...r,
       branch_code: r.branch_id?.branch_code || "UNKNOWN",
       branch_name: r.branch_id?.branch_name
    }));

    // Sort by branch code
    transformed.sort((a: any, b: any) => a.branch_code.localeCompare(b.branch_code));

    return NextResponse.json(transformed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { records, week_number, status } = await request.json();

    if (!records || !week_number) {
      return NextResponse.json({ error: 'records and week_number are required' }, { status: 400 });
    }

    // 1. Resolve Time Dimension
    const allWeeks = generateWeeks(SEED_START_DATE, SEED_END_DATE);
    const weekData = allWeeks.find(w => w.week_no === parseInt(week_number));
    
    // Generate dates for Mon-Sat of this week
    const dates: Date[] = [];
    if (weekData) {
        for(let i=0; i<6; i++) {
            const d = new Date(weekData.start_date);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
    }

    // 2. Process Records
    const calculatedRecords = CrtAttendanceService.processData(records);
    
    // 3. Prepare Bulk Operations
    const operations = [];
    
    for (const rec of calculatedRecords) {
        // Resolve Branch ID
        const branch = await Branch.findOne({ branch_code: rec.branch_code });
        if (!branch) {
            console.warn(`Branch not found for code: ${rec.branch_code}`);
            continue; 
        }

        const flattened = CrtAttendanceService.flattenForDB(rec, week_number, branch._id, {
            academic_year: "2025-26", // Defaulting for now as per V2
            batch: "3-2",             // Defaulting for now
            dates: dates,
            status: status || 'DRAFT'
        });

        operations.push({
            updateOne: {
                filter: { branch_id: branch._id, week_number: parseInt(week_number) },
                update: { $set: flattened },
                upsert: true
            }
        });
    }

    if (operations.length > 0) {
        const result = await CrtAttendanceRecord.bulkWrite(operations);
        return NextResponse.json({ success: true, result });
    } else {
        return NextResponse.json({ success: false, message: "No valid operations generated" });
    }

  } catch (error: any) {
    console.error("API Error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
