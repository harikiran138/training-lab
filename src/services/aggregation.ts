import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import AggregateSummary from '@/models/AggregateSummary';
import { getPerformanceGrade } from './metrics';

export const refreshAggregateSummary = async (branch_code?: string) => {
  await dbConnect();

  const pipeline: any[] = [];

  if (branch_code) {
    pipeline.push({ $match: { branch_code, status: 'finalized' } });
  } else {
    pipeline.push({ $match: { status: 'finalized' } });
  }

  pipeline.push({
    $group: {
      _id: '$branch_code',
      total_weeks: { $sum: 1 },
      avg_attendance: { $avg: '$attendance.avg_attendance_percent' },
      avg_test_attendance: { $avg: '$tests.avg_test_attendance_percent' },
      avg_test_pass: { $avg: '$tests.avg_test_pass_percent' },
      avg_overall_score: { $avg: '$computed.overall_score' },
      // Note: Syllabus coverage is cumulative, but for summary we might want the latest or average coverage percent
      // For simplicity, let's average the coverage percentages computed per week
      avg_syllabus_covered: { $avg: '$syllabus.covered' },
      avg_syllabus_total: { $avg: '$syllabus.total' }
    }
  });

  const results = await CRTWeeklyReport.aggregate(pipeline);

  for (const res of results) {
    const syllabus_completion_percent = res.avg_syllabus_total > 0
      ? (res.avg_syllabus_covered / res.avg_syllabus_total) * 100
      : 0;

    // Check for existing document to get overrides
    const existing = await AggregateSummary.findOne({ branch_code: res._id });
    const overrides = existing?.overrides || {}; // overrides is a Map or Object

    // AI Calculated Values
    const ai_values = {
      avg_attendance: res.avg_attendance,
      avg_test_pass: res.avg_test_pass,
      syllabus_completion_percent
    };

    // Effective Values (Override takes precedence)
    const effective_avg_attendance = overrides.get?.('avg_attendance') ?? overrides.avg_attendance ?? res.avg_attendance;
    const effective_avg_test_pass = overrides.get?.('avg_test_pass') ?? overrides.avg_test_pass ?? res.avg_test_pass;
    const effective_syllabus_completion = overrides.get?.('syllabus_completion_percent') ?? overrides.syllabus_completion_percent ?? syllabus_completion_percent;

    await AggregateSummary.findOneAndUpdate(
      { branch_code: res._id },
      {
        total_weeks: res.total_weeks,
        avg_attendance: effective_avg_attendance,
        avg_test_attendance: res.avg_test_attendance,
        avg_test_pass: effective_avg_test_pass,
        syllabus_completion_percent: effective_syllabus_completion,
        performance_grade: getPerformanceGrade((effective_avg_attendance * 0.4) + (effective_avg_test_pass * 0.4) + (effective_syllabus_completion * 0.2)),
        ai_values: ai_values
        // overrides are preserved by not overwriting them here, or we could explicitly set them but they shouldn't change
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  return results;
};
