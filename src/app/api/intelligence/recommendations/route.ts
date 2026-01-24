import { NextResponse } from 'next/server';
import Recommendation from '@/models/Recommendation';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const recommendations = await Recommendation.find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    return NextResponse.json(recommendations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
