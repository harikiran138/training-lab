import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AggregateSummary from '@/models/AggregateSummary';
import { refreshAggregateSummary } from '@/services/aggregation';

import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh');

    if (refresh === 'true') {
      await refreshAggregateSummary();
    }

    const summaries = await AggregateSummary.find({}).sort({ performance_grade: 1 });
    return NextResponse.json(summaries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
