import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import AggregateSummary from '@/models/AggregateSummary';
import Branch from '@/models/Branch';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        // 1. Fetch Weekly Trends (Attendance & Tests)
        const weeklyTrends = await CRTWeeklyReport.aggregate([
            {
                $group: {
                    _id: "$week_no",
                    avgAttendance: { $avg: "$attendance.avg_attendance_percent" },
                    avgOverallScore: { $avg: "$computed.overall_score" },
                    avgTestPass: { $avg: "$tests.avg_test_pass_percent" }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    week_no: { $concat: ["W", { $toString: "$_id" }] },
                    attendance: { $round: ["$avgAttendance", 1] },
                    overall_score: { $round: ["$avgOverallScore", 1] },
                    test_pass: { $round: ["$avgTestPass", 1] },
                    _id: 0
                }
            }
        ]);

        // 2. Fetch Branch Comparisons
        const branchComparisons = await AggregateSummary.find({})
            .select('branch_code avg_attendance avg_test_pass syllabus_completion_percent')
            .lean();

        // Map to format expected by BranchBarChart (snake_case keys) and PerformanceTable
        const formattedComparisons = branchComparisons.map(b => ({
            branch_code: b.branch_code,
            avg_attendance: Math.round(b.avg_attendance || 0),
            avg_test_pass: Math.round(b.avg_test_pass || 0),
            syllabus_completion_percent: Math.round(b.syllabus_completion_percent || 0)
        }));

        // 3. Institution Stats (Students, Laptops, Global Averages)
        const branches = await Branch.find({}).lean();
        const totalStudents = branches.reduce((sum: number, b: any) => sum + (b.total_students || 0), 0);
        const totalLaptops = branches.reduce((sum: number, b: any) => sum + (b.laptop_holders || 0), 0);
        const laptopPercent = totalStudents > 0 ? (totalLaptops / totalStudents) * 100 : 0;

        // Global averages from AggregateSummary
        const departmentSummary = await AggregateSummary.aggregate([
            {
                $group: {
                    _id: null,
                    avgAttendance: { $avg: "$avg_attendance" },
                    avgTestPass: { $avg: "$avg_test_pass" },
                    totalBranches: { $sum: 1 },
                    avgSyllabus: { $avg: "$syllabus_completion_percent" }
                }
            }
        ]);

        const summaryStats = departmentSummary[0] || {};

        return NextResponse.json({
            weeklyTrendData: weeklyTrends,
            branchComparisonData: formattedComparisons,
            // Required by LiveAnalytics to update cards
            stats: {
                totalStudents,
                laptopPercent,
                avgAttendance: Math.round(summaryStats.avgAttendance || 0),
                avgPass: Math.round(summaryStats.avgTestPass || 0),
                avgSyllabus: Math.round(summaryStats.avgSyllabus || 0),
                totalDepartments: summaryStats.totalBranches || 0
            },
            // For DepartmentRadarChart (if used), pass comparisons as summary list
            // mimicking page.tsx structure where summaries is the list of branch summaries
            departmentSummaryData: [],
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
