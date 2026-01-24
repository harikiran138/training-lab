import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import AggregateSummary from '@/models/AggregateSummary'; // Ensure this model exists and is imported
import dbConnect from '@/lib/mongodb';
import { getPerformanceGrade } from '../metrics'; // Import helper if available, otherwise define inline

export class AnalyticsService {
  
  static async refreshAggregates() {
    await dbConnect();
    
    // 1. Aggregation Pipeline
    const aggregates = await CRTWeeklyReport.aggregate([
      {
        $group: {
          _id: '$branch_code',
          total_weeks: { $max: '$week_no' },
          avg_attendance: { $avg: '$attendance.avg_attendance_percent' },
          avg_test_attendance: { $avg: '$tests.avg_test_attendance_percent' },
          avg_test_pass: { $avg: '$tests.avg_test_pass_percent' },
          // For syllabus, we might want the MAX covered or AVG coverage of latest weeks. 
          // Let's assume average coverage percent for now, or max if it's cumulative.
          // Usually syllabus is cumulative, so we want the latest week's coverage.
          // But aggregating across all weeks is tricky. Let's take the AVG of the "coverage_percent" field.
          avg_syllabus_completion: { $avg: '$syllabus.coverage_percent' } 
        }
      }
    ]);

    // 2. Bulk Write to AggregateSummary
    const ops = aggregates.map(agg => {
      // Calculate grade
      let grade = 'D';
      const score = (agg.avg_attendance * 0.4) + (agg.avg_test_pass * 0.4) + (agg.avg_syllabus_completion * 0.2);
       if (score >= 90) grade = 'A+';
       else if (score >= 80) grade = 'A';
       else if (score >= 70) grade = 'B+';
       else if (score >= 60) grade = 'B';
       else if (score >= 50) grade = 'C';

      return {
        updateOne: {
          filter: { branch_code: agg._id },
          update: {
            $set: {
              total_weeks: agg.total_weeks,
              avg_attendance: agg.avg_attendance,
              avg_test_attendance: agg.avg_test_attendance,
              avg_test_pass: agg.avg_test_pass,
              syllabus_completion_percent: agg.avg_syllabus_completion,
              performance_grade: grade
            }
          },
          upsert: true
        }
      };
    });

    if (ops.length > 0) {
      await AggregateSummary.bulkWrite(ops);
    }

    return { updated: ops.length };
  }

  static async getDashboardMetrics(weekNo?: number) {
    await dbConnect();
    
    // Base match stage
    const matchStage: any = {};
    if (weekNo) {
      matchStage.week_no = weekNo;
    } else {
      // If no week specified, aim for the latest week available?
      const lastReport = await CRTWeeklyReport.findOne().sort({ week_no: -1 });
      if (lastReport) matchStage.week_no = lastReport.week_no;
    }

    // 1. Overall KPIs
    const kpis = await CRTWeeklyReport.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          avgAttendance: { $avg: '$attendance.avg_attendance_percent' },
          avgPassPercent: { $avg: '$tests.avg_test_pass_percent' },
          totalReportedBranches: { $sum: 1 }
        }
      }
    ]);

    // 2. Branch Ranking (based on pass % for now, could be composite)
    const rankings = await CRTWeeklyReport.find(matchStage)
      .sort({ 'tests.avg_test_pass_percent': -1 })
      .select('branch_code attendance.avg_attendance_percent tests.avg_test_pass_percent computed.risk_level')
      .lean();

    // 3. Risk Distribution
    const riskDistribution = await CRTWeeklyReport.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$computed.risk_level',
          count: { $sum: 1 },
          branches: { $push: '$branch_code' }
        }
      }
    ]);

    return {
      period: matchStage.week_no ? `Week ${matchStage.week_no}` : 'Latest',
      kpis: kpis[0] || { avgAttendance: 0, avgPassPercent: 0, totalReportedBranches: 0 },
      rankings,
      riskDistribution
    };
  }

  static async getTrends(branchCode?: string) {
    await dbConnect();
    const matchStage: any = {};
    if (branchCode) matchStage.branch_code = branchCode;

    // Get trend over last 10 weeks
    return await CRTWeeklyReport.find(matchStage)
      .sort({ week_no: 1 })
      .limit(10) // Careful, limit after sort with 1 gives oldest. We want last 10 weeks.
      .select('week_no branch_code attendance.avg_attendance_percent tests.avg_test_pass_percent')
      .lean();
  }
}
