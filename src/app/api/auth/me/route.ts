import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({
        success: true,
        user: {
            id: session.id,
            name: session.name,
            email: session.email,
            role: session.role,
            branches: session.branches
        }
    });
}
