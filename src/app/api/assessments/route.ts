import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AssessmentWeekly from '@/models/AssessmentWeekly';
import Branch from '@/models/Branch';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const assessments = await AssessmentWeekly.find({ academic_year: '2025-26' })
        .populate('branch_id', 'branch_code')
        .sort({ week_number: 1, 'branch_id.branch_code': 1 })
        .lean();
        
    const transformed = assessments.map((a: any) => ({
        branch: a.branch_id?.branch_code || 'Unknown',
        week: a.week_number,
        type: a.exam_type,
        appeared: a.appeared_count,
        passed: a.passed_count,
        pass_percent: a.appeared_count > 0 ? Math.round((a.passed_count / a.appeared_count) * 100) : 0
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
