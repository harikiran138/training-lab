import { NextRequest, NextResponse } from 'next/server';
import { analyzeStudentPerformance, analyzeDepartmentTrends } from '@/services/intelligence';
import Recommendation from '@/models/Recommendation';
import dbConnect from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'Student';
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (forceRefresh) {
      if (type === 'Student') {
        await analyzeStudentPerformance(id);
      } else {
        await analyzeDepartmentTrends(id);
      }
    }

    await dbConnect();
    const insights = await Recommendation.find({ 
      target_id: id, 
      is_active: true 
    }).sort({ createdAt: -1 });

    return NextResponse.json(insights);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
