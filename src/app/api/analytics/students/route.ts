import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${backendUrl}/analytics/students`, { cache: 'no-store' });

        if (!res.ok) {
            console.error('Backend API Error', res.status);
            throw new Error('Failed to fetch from backend');
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Student Analytics Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to fetch student analytics' }, { status: 500 });
    }
}
