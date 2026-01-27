import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CrtAttendanceRecord from '@/models/CrtAttendanceRecord';
import { ExcelExportService } from '@/services/ExcelExportService';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const week_number = searchParams.get('week_number') || '1';

    const records = await CrtAttendanceRecord.find({ 
      week_number: parseInt(week_number) 
    }).sort({ branch_code: 1 });

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records found for this week' }, { status: 404 });
    }

    const buffer = ExcelExportService.generateAttendanceTemplate(records, parseInt(week_number));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="CRT_Attendance_Week_${week_number}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
