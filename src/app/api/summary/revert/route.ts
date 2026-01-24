import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AggregateSummary from '@/models/AggregateSummary';
import { logAction } from '@/services/audit';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { branch_code, field } = body;

        if (!branch_code || !field) {
            return NextResponse.json(
                { error: 'Missing required fields' },
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

        const overrides = summary.overrides || new Map();
        const currentValue = summary.get(field);

        // Remove override
        if (overrides instanceof Map) {
            overrides.delete(field);
        } else {
            delete (overrides as any)[field];
        }

        // Restore from ai_values if available, else standard fallback
        const aiValues = summary.ai_values || new Map();

        let originalValue;
        if (aiValues instanceof Map) {
            originalValue = aiValues.get(field);
        } else {
            originalValue = (aiValues as any)[field];
        }

        // Fallback if ai_value missing ( shouldn't happen usually if refreshed, but fallback to 0 or keeping current if critical)
        // Actually, we should check if ai_values exists. If not, we might need to re-trigger calculation or set to 0.
        // For now, let's assume if undefined, we set it to 0 or leave it? 
        // Best behavior: revert to Safe AI value.
        if (originalValue === undefined) {
            // If we don't have an AI value stored, we might want to keep the current value but remove the override marker? 
            // Or set to 0. Let's set to 0 or some default to indicate reset.
            originalValue = 0;
        }

        summary.set(field, originalValue);

        summary.markModified('overrides');
        summary.markModified(field);

        await summary.save();

        await logAction(
            session.id,
            'REVERT_EDIT',
            'AggregateSummary',
            branch_code,
            {
                field,
                old_value: currentValue,
                new_value: originalValue,
                user_name: session.name
            }
        );

        return NextResponse.json({ success: true, data: summary });
    } catch (error) {
        console.error('Error reverting summary:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
