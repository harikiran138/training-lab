import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import {
  calculateSyllabusCompletion,
  calculateTestEffectiveness,
  calculateOverallScore
} from '@/services/metrics';
import { getSession } from '@/lib/auth';
import { logAction } from '@/services/audit';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const branch_code = searchParams.get('branch_code');
    const week_no = searchParams.get('week_no');

    let query: any = {};
    if (branch_code) query.branch_code = branch_code;
    if (week_no) query.week_no = parseInt(week_no);

    // Filter by branch for Faculty if restricted
    const session = await getSession();
    if (session && session.role === 'faculty' && session.branches && session.branches.length > 0) {
      if (branch_code && !session.branches.includes(branch_code)) {
        return NextResponse.json({ error: 'Unauthorized for this branch' }, { status: 403 });
      }
      query.branch_code = { $in: session.branches };
    }

    const reports = await CRTWeeklyReport.find(query).sort({ week_no: -1 });
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();

    if (!session || !['admin', 'faculty'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { branch_code, week_no, sessions, attendance, tests, syllabus, status, semester } = data;

    if (!branch_code || !week_no) {
      return NextResponse.json({ error: 'branch_code and week_no are required' }, { status: 400 });
    }

    // Role check for specific branch
    if (session.role === 'faculty' && session.branches?.length > 0 && !session.branches.includes(branch_code)) {
      return NextResponse.json({ error: 'Unauthorized for this branch' }, { status: 403 });
    }

    // Check for existing report to handle locking
    const existingReport = await CRTWeeklyReport.findOne({
      branch_code,
      week_no,
      semester: semester || 'SEM1'
    });

    if (existingReport && existingReport.status === 'finalized') {
      return NextResponse.json({ error: 'Report is finalized and cannot be edited' }, { status: 403 });
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

    const updateData: any = { ...data, computed };

    // Handle finalization
    if (status === 'finalized') {
      updateData.locked_at = new Date();
      updateData.finalized_by = session.id;
    }

    const report = await CRTWeeklyReport.findOneAndUpdate(
      { branch_code, week_no, semester: semester || 'SEM1' },
      updateData,
      { upsert: true, new: true }
    );

    await logAction(
      session.id,
      existingReport ? 'UPDATE_REPORT' : 'CREATE_REPORT',
      'CRTWeeklyReport',
      report._id.toString(),
      { branch: branch_code, week: week_no, status: report.status }
    );

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
