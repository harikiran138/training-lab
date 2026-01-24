
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Branch from '@/models/Branch';
import AggregateSummary from '@/models/AggregateSummary';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        const [branches, summaries, reports] = await Promise.all([
            Branch.find({}).lean(),
            AggregateSummary.find({}).lean(),
            CRTWeeklyReport.find({ status: 'finalized' }).sort({ week_no: 1 }).lean()
        ]);

        // 1. Weekly Trends (Attendance & Test Pass)
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
            data.attendance += r.attendance?.avg_attendance_percent || 0;
            data.test_pass += r.tests?.avg_test_pass_percent || 0;
            data.count += 1;
        });

        const weeklyTrendData = Array.from(weeklyTrendMap.values()).map(d => ({
            week_no: `W${d.week_no}`,
            overall_score: parseFloat((d.overall_score / d.count).toFixed(1)),
            attendance: parseFloat((d.attendance / d.count).toFixed(1)),
            test_pass: parseFloat((d.test_pass / d.count).toFixed(1))
        })).sort((a, b) => parseInt(a.week_no.slice(1)) - parseInt(b.week_no.slice(1)));

        // 2. Branch Comparison (already in summaries, but ensuring format)
        // summaries has avg_attendance, avg_test_pass

        // 3. Department Summary (Radar Chart Data)
        // We can aggregate across all branches for a "Total" or compare top/bottom
        // For now, let's create a summary that maps 5 key metrics
        const overallStats = {
            attendance: 0,
            test_pass: 0,
            syllabus: 0,
            laptops: 0, // This is % from Branch
            count: 0
        };

        const totalStudents = branches.reduce((sum: number, b: any) => sum + b.total_students, 0);
        const totalLaptops = branches.reduce((sum: number, b: any) => sum + b.laptop_holders, 0);
        const laptopPercent = totalStudents > 0 ? (totalLaptops / totalStudents) * 100 : 0;

        summaries.forEach((s: any) => {
            overallStats.attendance += s.avg_attendance;
            overallStats.test_pass += s.avg_test_pass;
            overallStats.syllabus += s.syllabus_completion_percent;
            overallStats.count++;
        });

        const count = overallStats.count || 1;
        // Calculate Average Sessions for Engagement score (Target: 10 sessions/week)
        const totalSessions = reports.reduce((sum: number, r: any) => sum + (r.sessions || 0), 0);
        const avgSessions = totalSessions / (reports.length || 1);
        const engagementScore = Math.min(100, (avgSessions / 10) * 100);

        const departmentSummaryData = [
            { subject: 'Attendance', A: parseFloat((overallStats.attendance / count).toFixed(1)), fullMark: 100 },
            { subject: 'Test Pass', A: parseFloat((overallStats.test_pass / count).toFixed(1)), fullMark: 100 },
            { subject: 'Syllabus', A: parseFloat((overallStats.syllabus / count).toFixed(1)), fullMark: 100 },
            { subject: 'Laptop %', A: parseFloat(laptopPercent.toFixed(1)), fullMark: 100 },
            { subject: 'Sessions', A: parseFloat(engagementScore.toFixed(1)), fullMark: 100 },
        ];

        return NextResponse.json({
            weeklyTrendData,
            branchComparisonData: summaries,
            departmentSummaryData,
            stats: {
                totalStudents,
                laptopPercent,
                avgAttendance: overallStats.attendance / count,
                avgPass: overallStats.test_pass / count,
                avgSyllabus: overallStats.syllabus / count
            }
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
