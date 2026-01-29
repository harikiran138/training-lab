import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    try {
        // Fetch data from NestJS backend
        const [dashboardRes, trendsRes] = await Promise.all([
            fetch(`${backendUrl}/analytics/dashboard`, { cache: 'no-store' }),
            fetch(`${backendUrl}/analytics/trends`, { cache: 'no-store' })
        ]);

        if (!dashboardRes.ok || !trendsRes.ok) {
            console.error('Backend API Error', dashboardRes.status, trendsRes.status);
            throw new Error('Failed to fetch from backend');
        }

        const dashboardData = await dashboardRes.json();
        const trendData = await trendsRes.json();

        // 0. Fetch auxiliary data from MongoDB (Laptops, Syllabus progress)
        // In a real scenario, we would aggregate these. For now, using mock or small counts.
        // const totalLaptops = await StudentAsset.countDocuments({ type: 'LAPTOP' });
        // const syllabusAvg = await SyllabusLog.aggregate([...]);
        const auxiliaryStats = {
            totalLaptops: 842, // Mock or from DB
            syllabusProgress: 68
        };

        // Map Backend Response to Frontend UI Contract

        // 1. Weekly Trends
        const weeklyTrendData = Array.isArray(trendData) ? trendData.map((t: any) => ({
            week_no: t.period ? `W${new Date(t.period).toISOString().slice(0, 10)}` : 'W?',
            attendance: Math.round(t.attendance || 0),
            overall_score: Math.round(t.average_score || 0),
            test_pass: Math.round(t.average_score || 0)
        })) : [];

        // 2. Branch Comparisons
        const branchComparisonData = Array.isArray(dashboardData.rankings) ? dashboardData.rankings.map((r: any) => ({
            branch_code: r.dept_code || r.section_name,
            avg_attendance: Math.round(r.attendance_pct || 0),
            avg_test_pass: Math.round(Math.random() * 20 + 70), // Fallback random for display
            syllabus_completion_percent: Math.round(Math.random() * 30 + 50)
        })) : [];

        // 3. Overall Stats
        const kpis = dashboardData.kpis || {};
        const totalStudents = 1250; // Should be fetched from backend or DB
        const stats = {
            totalStudents,
            laptopPercent: Math.round((auxiliaryStats.totalLaptops / totalStudents) * 100),
            avgAttendance: Math.round(kpis.avg_attendance || 0),
            avgPass: Math.round(kpis.avg_pass_rate || 0),
            avgSyllabus: auxiliaryStats.syllabusProgress,
            totalDepartments: parseInt(kpis.total_departments || '0')
        };

        return NextResponse.json({
            weeklyTrendData,
            branchComparisonData,
            stats,
            departmentSummaryData: [],
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Analytics Proxy Error:', error);
        // Return fallback data to avoid crashing UI
        return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
