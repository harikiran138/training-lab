import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import { 
  calculateSyllabusCompletion, 
  calculateTestEffectiveness, 
  calculateOverallScore 
} from '@/services/metrics';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const branch_code = searchParams.get('branch_code');
    const week_no = searchParams.get('week_no');

    let query: any = {};
    if (branch_code) query.branch_code = branch_code;
    if (week_no) query.week_no = parseInt(week_no);

    const reports = await CRTWeeklyReport.find(query).sort({ week_no: -1 });
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { branch_code, week_no, sessions, attendance, tests, syllabus } = data;

    if (!branch_code || !week_no) {
      return NextResponse.json({ error: 'branch_code and week_no are required' }, { status: 400 });
    }

    // Calculate computed fields
    const syllabus_completion = calculateSyllabusCompletion(syllabus.covered, syllabus.total);
    const test_effectiveness = calculateTestEffectiveness(tests.avg_test_attendance_percent, tests.avg_test_pass_percent);
    
    const computed = {
      attendance_score: attendance.avg_attendance_percent,
      test_score: test_effectiveness,
      overall_score: calculateOverallScore(
        attendance.avg_attendance_percent,
        test_effectiveness,
        syllabus_completion
      )
    };

    const report = await CRTWeeklyReport.findOneAndUpdate(
      { branch_code, week_no },
      { ...data, computed },
      { upsert: true, new: true }
    );

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
