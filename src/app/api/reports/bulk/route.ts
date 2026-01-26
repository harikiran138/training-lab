import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import Branch from '@/models/Branch';
import { 
  calculateSyllabusCompletion, 
  calculateTestEffectiveness, 
  calculateOverallScore 
} from '@/services/metrics';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const reports = await request.json();

    if (!Array.isArray(reports)) {
      return NextResponse.json({ error: 'Expected an array of reports' }, { status: 400 });
    }

    const savedReports = await Promise.all(
      reports.map(async (data) => {
        const { branch_code, week_no, sessions, attendance, tests, syllabus } = data;

        if (!branch_code || !week_no) {
          throw new Error(`branch_code and week_no are required for all reports`);
        }

        // V2: Resolve Branch ID
        const branch = await Branch.findOne({ branch_code });
        const branch_id = branch ? branch._id : undefined;

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

        return CRTWeeklyReport.findOneAndUpdate(
          { branch_code, week_no },
          { ...data, branch_id, computed },
          { upsert: true, new: true }
        );
      })
    );

    return NextResponse.json({ success: true, count: savedReports.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
