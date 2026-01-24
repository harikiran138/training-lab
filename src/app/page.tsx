import React from 'react';
import { AlertCircle } from 'lucide-react';
import { LiveAnalytics } from '@/components/dashboard/LiveAnalytics';
import dbConnect from '@/lib/mongodb';
import Branch from '@/models/Branch';
import AggregateSummary from '@/models/AggregateSummary';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    await dbConnect();

    // Refreshing summaries on every page load is too heavy for serverless functions
    // await refreshAggregateSummary();

    const branches = await Branch.find({}).lean();
    const summaries = await AggregateSummary.find({}).lean();
    const reports = await CRTWeeklyReport.find({ status: 'finalized' }).sort({ week_no: 1 }).lean();

    // Calculate institution-wide stats
    const totalStudents = branches.reduce((sum, b: any) => sum + b.total_students, 0);
    const totalLaptops = branches.reduce((sum, b: any) => sum + b.laptop_holders, 0);
    const avgAttendance = summaries.reduce((sum, s: any) => sum + s.avg_attendance, 0) / (summaries.length || 1);
    const avgPass = summaries.reduce((sum, s: any) => sum + s.avg_test_pass, 0) / (summaries.length || 1);
    const avgSyllabus = summaries.reduce((sum, s: any) => sum + s.syllabus_completion_percent, 0) / (summaries.length || 1);

    // Group reports by week for trend chart
    const weeklyTrendMap = new Map();
    reports.forEach((r: any) => {
      if (!weeklyTrendMap.has(r.week_no)) {
        weeklyTrendMap.set(r.week_no, {
          week_no: r.week_no,
          overall_score: 0,
          attendance: 0,
          test_pass: 0,
          count: 0
        });
      }
      const data = weeklyTrendMap.get(r.week_no);
      data.overall_score += r.computed.overall_score || 0;
      data.attendance += r.attendance.avg_attendance_percent || 0;
      data.test_pass += r.tests.avg_test_pass_percent || 0;
      data.count += 1;
    });

    const weeklyTrendData = Array.from(weeklyTrendMap.values()).map(d => ({
      week_no: `W${d.week_no}`,
      overall_score: parseFloat((d.overall_score / d.count).toFixed(1)),
      attendance: parseFloat((d.attendance / d.count).toFixed(1)),
      test_pass: parseFloat((d.test_pass / d.count).toFixed(1))
    })).sort((a, b) => parseInt(a.week_no.slice(1)) - parseInt(b.week_no.slice(1)));

    // Calculate Department Summary Data for Radar Chart
    const overallStats = {
      attendance: 0,
      test_pass: 0,
      syllabus: 0,
      laptops: 0,
      count: 0
    };

    summaries.forEach((s: any) => {
      overallStats.attendance += s.avg_attendance;
      overallStats.test_pass += s.avg_test_pass;
      overallStats.syllabus += s.syllabus_completion_percent;
      overallStats.count++;
    });

    const count = overallStats.count || 1;
    const laptopPercent = totalStudents > 0 ? (totalLaptops / totalStudents) * 100 : 0;

    // Calculate Average Sessions for Engagement score (Target: 10 sessions/week)
    const totalSessions = reports.reduce((sum, r: any) => sum + (r.sessions || 0), 0);
    const avgSessions = totalSessions / (reports.length || 1);
    const engagementScore = Math.min(100, (avgSessions / 10) * 100);

    const departmentSummaryData = [
      { subject: 'Attendance', A: parseFloat((overallStats.attendance / count).toFixed(1)), fullMark: 100 },
      { subject: 'Test Pass', A: parseFloat((overallStats.test_pass / count).toFixed(1)), fullMark: 100 },
      { subject: 'Syllabus', A: parseFloat((overallStats.syllabus / count).toFixed(1)), fullMark: 100 },
      { subject: 'Laptop %', A: parseFloat(laptopPercent.toFixed(1)), fullMark: 100 },
      { subject: 'Sessions', A: parseFloat(engagementScore.toFixed(1)), fullMark: 100 },
    ];

    return {
      stats: {
        totalStudents,
        laptopPercent,
        avgAttendance,
        avgPass,
        avgSyllabus
      },
      summaries: JSON.parse(JSON.stringify(summaries)),
      weeklyTrendData,
      departmentSummaryData,
      error: null
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      stats: {
        totalStudents: 0,
        laptopPercent: 0,
        avgAttendance: 0,
        avgPass: 0,
        avgSyllabus: 0
      },
      summaries: [],
      weeklyTrendData: [],
      departmentSummaryData: [],
      error: 'Failed to load data. Please check database connection.'
    };
  }
}

export default async function OverviewPage() {
  const { stats, summaries, weeklyTrendData, departmentSummaryData, error } = await getData();

  const initialData = {
    weeklyTrendData,
    branchComparisonData: summaries,
    departmentSummaryData,
    stats
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Institution Overview</h2>
        <p className="text-slate-500">Real-time performance metrics across all branches</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Replaced static charts with LiveAnalytics */}
      <LiveAnalytics initialData={initialData} />
    </div>
  );
}
