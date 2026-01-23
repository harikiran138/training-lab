import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AggregateSummary from '@/models/AggregateSummary';
import { refreshAggregateSummary } from '@/services/aggregation';

export async function GET(request: NextRequest) {
  try {
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
