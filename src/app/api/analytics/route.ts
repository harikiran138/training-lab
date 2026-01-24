import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const week = searchParams.get('week');
  const type = searchParams.get('type') || 'dashboard'; // 'dashboard' | 'trend'
  const branch = searchParams.get('branch');

  try {
    if (type === 'trend') {
      const data = await AnalyticsService.getTrends(branch || undefined);
      return NextResponse.json(data);
    } 
    
    // Default dashboard metrics
    const weekNo = week ? parseInt(week) : undefined;
    const data = await AnalyticsService.getDashboardMetrics(weekNo);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
