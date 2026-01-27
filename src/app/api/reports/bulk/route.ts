import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
<<<<<<< HEAD
import {
  calculateSyllabusCompletion,
  calculateTestEffectiveness,
  calculateOverallScore
=======
import Branch from '@/models/Branch';
import { 
  calculateSyllabusCompletion, 
  calculateTestEffectiveness, 
  calculateOverallScore 
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
} from '@/services/metrics';
import { getSession } from '@/lib/auth';
import { logAction } from '@/services/audit';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();

    if (!session || !['admin', 'faculty'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const input = await request.json();
    const reports = Array.isArray(input) ? input : input.reports;

    if (!Array.isArray(reports)) {
      return NextResponse.json({ error: 'Reports must be an array' }, { status: 400 });
    }

<<<<<<< HEAD
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    const processedReports = [];

    for (let i = 0; i < reports.length; i++) {
      const data = reports[i];
      const { branch_code, week_no, sessions, attendance, tests, syllabus, status, semester } = data;

      if (!branch_code || !week_no) {
        results.failed++;
        results.errors.push({ index: i, error: 'branch_code and week_no are required' });
        continue;
      }

      // Role check per branch if faculty
      if (session.role === 'faculty' && session.branches?.length > 0 && !session.branches.includes(branch_code)) {
        results.failed++;
        results.errors.push({ index: i, error: `Unauthorized for branch ${branch_code}` });
        continue;
      }

      try {
=======
        // V2: Resolve Branch ID
        const branch = await Branch.findOne({ branch_code });
        const branch_id = branch ? branch._id : undefined;

>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974
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

<<<<<<< HEAD
        const reportData = {
          ...data,
          computed,
          semester: semester || 'SEM1'
        };

        if (status === 'finalized') {
          reportData.locked_at = new Date();
          reportData.finalized_by = session.id;
        }

        processedReports.push({
          filter: { branch_code, week_no, semester: reportData.semester },
          update: reportData
        });
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ index: i, error: err.message });
      }
    }

    // Bulk Update in DB
    if (processedReports.length > 0) {
      const bulkOps = processedReports.map(op => ({
        updateOne: {
          filter: op.filter,
          update: { $set: op.update },
          upsert: true
        }
      }));

      await CRTWeeklyReport.bulkWrite(bulkOps);

      await logAction(
        session.id,
        'BULK_UPLOAD_REPORTS',
        'CRTWeeklyReport',
        'multiple',
        { count: processedReports.length }
      );
    }

    return NextResponse.json({
      success: results.failed === 0,
      summary: results,
      count: results.success
    });
=======
        return CRTWeeklyReport.findOneAndUpdate(
          { branch_code, week_no },
          { ...data, branch_id, computed },
          { upsert: true, new: true }
        );
      })
    );
>>>>>>> cc220ba30bbfaba848e3beb1472701385f162974

  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
