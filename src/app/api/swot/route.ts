import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SwotAnalysis from '@/models/SwotAnalysis';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const swot = await SwotAnalysis.find({ academic_year: '2025-26' }).lean();
    
    // Transform to array of objects { category, points } to match UI expectation if needed
    // or just return plain list
    const data = swot.map((s: any) => ({
        factor: "CRT Program", // Dummy context
        [s.category.toLowerCase()]: s.points.join(', ') // "strengths": "Point 1, Point 2"
    }));
    
    // Actually better to return the raw list and let UI group it
    return NextResponse.json(swot);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
