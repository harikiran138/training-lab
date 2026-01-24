import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import { calculateTestEffectiveness, calculateSyllabusCompletion, calculateOverallScore } from '@/services/metrics';
import { refreshAggregateSummary } from '@/services/aggregation';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const branch = searchParams.get('branch');
        const section = searchParams.get('section');

        if (!branch || !section) {
            return NextResponse.json({ error: 'Branch and Section are required' }, { status: 400 });
        }

        await dbConnect();

        const reports = await CRTWeeklyReport.find({
            branch_code: branch,
            section: section
        }).sort({ week_no: 1 });

        return NextResponse.json(reports);
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

        await dbConnect();

        // 1. Get current report to perform calculations
        const report = await CRTWeeklyReport.findById(reportId);
        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // 1.1 Prevent updates to finalized reports (unless changing status back to draft, if enabled)
        if (report.status === 'finalized' && !updates.status) {
            return NextResponse.json({ error: 'Finalized reports cannot be edited' }, { status: 403 });
        }

        // 2. Apply updates to the document (in-memory first for calculation)
        Object.keys(updates).forEach(key => {
            const keys = key.split('.');
            if (keys.length === 2) {
                // Handle nested updates like attendance.avg_attendance_percent
                (report as any)[keys[0]][keys[1]] = updates[key];
            } else {
                (report as any)[key] = updates[key];
            }
        });

        // 3. Recalculate computed scores (only if still draft or transitioning)
        if (report.status === 'draft' || updates.status === 'finalized') {
            const syllabusCompletion = calculateSyllabusCompletion(report.syllabus.covered, report.syllabus.total);
            const testEffectiveness = calculateTestEffectiveness(
                report.tests.avg_test_attendance_percent,
                report.tests.avg_test_pass_percent
            );

            report.computed.attendance_score = report.attendance.avg_attendance_percent;
            report.computed.test_score = testEffectiveness;
            report.computed.overall_score = calculateOverallScore(
                report.attendance.avg_attendance_percent,
                testEffectiveness,
                syllabusCompletion
            );
        }

        // 4. Save changes
        await report.save();

        // 5. Refresh global summary for this branch
        await refreshAggregateSummary(report.branch_code);

        return NextResponse.json(report);
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

        await dbConnect();

        // Find the latest week for this branch/section/semester
        const latestReport = await CRTWeeklyReport.findOne({
            branch_code: branch,
            section: section,
            semester: semester
        }).sort({ week_no: -1 });

        const nextWeek = latestReport ? latestReport.week_no + 1 : 1;

        const newReport = await CRTWeeklyReport.create({
            branch_code: branch,
            section: section,
            semester: semester,
            week_no: nextWeek,
            status: 'draft',
            sessions: 0,
            attendance: { avg_attendance_percent: 0 },
            tests: { avg_test_attendance_percent: 0, avg_test_pass_percent: 0 },
            syllabus: { covered: 0, total: 10 }, // Default total units
            computed: { attendance_score: 0, test_score: 0, overall_score: 0 }
        });

        return NextResponse.json(newReport);
    } catch (error: any) {
        console.error('Error creating report:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'This week already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
