import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'dashboard';

    try {
        if (type === 'trend') {
            const res = await fetch(`${BACKEND_URL}/analytics/trends`, { cache: 'no-store' });
            const data = await res.json();

            // Map NestJS trend data to frontend expected format if necessary
            // NestJS returns [{ period, attendance, average_score }]
            const formattedTrends = data.map((d: any) => ({
                week_no: d.period,
                attendance: parseFloat(d.attendance),
                overall_score: parseFloat(d.average_score) || 0
            }));

            return NextResponse.json(formattedTrends);
        }

        // Dashboard Metrics
        const res = await fetch(`${BACKEND_URL}/analytics/dashboard`, { cache: 'no-store' });
        const data = await res.json();

        // format to match expected dashboard structure
        return NextResponse.json({
            weeklyTrendData: [], // Dashboard might fetch trends separately or expects them here
            branchComparisonData: data.rankings,
            stats: {
                avgAttendance: data.kpis.avg_attendance,
                avgPass: data.kpis.avg_pass_rate,
                totalDepartments: data.kpis.total_departments
            }
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics from backend' }, { status: 500 });
    }
}
