import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import dbConnect from '@/lib/mongodb';

export class AnalyticsService {
  
  static async getDashboardMetrics(weekNo?: number) {
    await dbConnect();
    
    // Base match stage
    const matchStage: any = {};
    if (weekNo) {
      matchStage.week_no = weekNo;
    } else {
      // If no week specified, aim for the latest week available?
      // Or maybe aggregate across all weeks. For now, let's assume "overall".
      // But typically dashboards default to "latest week".
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
      // Logic: sort desc, limit 10, then sort asc back?
      // Actually if we want specific branch trend it's fine.
      .select('week_no branch_code attendance.avg_attendance_percent tests.avg_test_pass_percent')
      .lean();
  }
}
