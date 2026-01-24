import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AggregateSummary from '@/models/AggregateSummary';
import { logAction } from '@/services/audit';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { branch_code, field, value } = body;

        if (!branch_code || !field || value === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // specific fields allowed for editing
        const allowedFields = ['avg_attendance', 'avg_test_pass', 'syllabus_completion_percent'];
        if (!allowedFields.includes(field)) {
            return NextResponse.json(
                { error: 'Field not allowed for editing' },
                { status: 400 }
            );
        }

        const summary = await AggregateSummary.findOne({ branch_code });
        if (!summary) {
            return NextResponse.json(
                { error: 'Branch summary not found' },
                { status: 404 }
            );
        }

        const oldValue = summary.get(field);

        // Update overrides
        const overrides = summary.overrides || new Map();
        if (overrides instanceof Map) {
            overrides.set(field, value);
        } else {
            (overrides as any)[field] = value;
        }

        // Update root field (Effective Value)
        summary.set(field, value);

        // Recalculate grade based on new effective values
        // Note: We use the summary's root fields which now contain common effective values
        const overallScore = (summary.avg_attendance * 0.4) +
            (summary.avg_test_pass * 0.4) +
            (summary.syllabus_completion_percent * 0.2);

        // Simple grade mapping (matching metrics.ts getPerformanceGrade)
        let newGrade = 'D';
        if (overallScore >= 90) newGrade = 'A+';
        else if (overallScore >= 80) newGrade = 'A';
        else if (overallScore >= 70) newGrade = 'B+';
        else if (overallScore >= 60) newGrade = 'B';
        else if (overallScore >= 50) newGrade = 'C';

        summary.performance_grade = newGrade;

        // Mark modified
        summary.markModified('overrides');
        summary.markModified(field);

        await summary.save();

        // Log the action
        await logAction(
            session.id,
            'MANUAL_EDIT',
            'AggregateSummary',
            branch_code,
            {
                field,
                old_value: oldValue,
                new_value: value,
                new_grade: newGrade,
                user_name: session.name
            }
        );

        return NextResponse.json({ success: true, data: summary });
    } catch (error) {
        console.error('Error updating summary:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
