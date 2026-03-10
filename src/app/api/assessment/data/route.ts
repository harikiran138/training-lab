import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const branch = searchParams.get('branch');
        const section = searchParams.get('section');
        const semester = searchParams.get('semester') || 'SEM1';

        if (!branch || !section) {
            return NextResponse.json({ error: 'Branch and Section are required' }, { status: 400 });
        }

        const res = await fetch(`${BACKEND_URL}/assessments/weekly/data?branch=${branch}&section=${section}&semester=${semester}`);
        if (!res.ok) throw new Error(`Failed to fetch from NestJS: ${res.statusText}`);

        const data = await res.json();

        // Map NestJS Assessment -> ICRTWeeklyReportData shape
        const mapped = data.map((d: any) => ({
            _id: d.id.toString(),
            week_no: d.weekNo,
            sessions: Number(d.sessions),
            branch_code: d.branchCode,
            semester: d.semester,
            status: d.status,
            attendance: { avg_attendance_percent: Number(d.avgAttendancePercent) },
            tests: {
                avg_test_attendance_percent: Number(d.avgTestAttendancePercent),
                avg_test_pass_percent: Number(d.avgTestPassPercent)
            },
            syllabus: { covered: 0, total: 10 },
            computed: { overall_score: 0 }
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching assessment data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { reportId, updates } = body;

        if (!reportId || !updates) {
            return NextResponse.json({ error: 'Report ID and updates are required' }, { status: 400 });
        }

        const res = await fetch(`${BACKEND_URL}/assessments/weekly/data/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: errorText }, { status: res.status });
        }

        const updatedData = await res.json();
        return NextResponse.json(updatedData);
    } catch (error) {
        console.error('Error updating report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { branch, section, semester } = body;

        if (!branch || !section || !semester) {
            return NextResponse.json({ error: 'Branch, Section, and Semester are required' }, { status: 400 });
        }

        const res = await fetch(`${BACKEND_URL}/assessments/weekly/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branch, section, semester })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to create week in NestJS: ${err}`);
        }

        const d = await res.json();

        const mapped = {
            _id: d.id.toString(),
            week_no: d.weekNo,
            sessions: Number(d.sessions),
            branch_code: d.branchCode,
            semester: d.semester,
            status: d.status,
            attendance: { avg_attendance_percent: Number(d.avgAttendancePercent) },
            tests: {
                avg_test_attendance_percent: Number(d.avgTestAttendancePercent),
                avg_test_pass_percent: Number(d.avgTestPassPercent)
            },
            syllabus: { covered: 0, total: 10 },
            computed: { overall_score: 0 }
        };

        return NextResponse.json(mapped);
    } catch (error: any) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
