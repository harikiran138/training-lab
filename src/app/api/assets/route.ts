import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Branch from '@/models/Branch';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const branches = await Branch.find({}).sort({ branch_code: 1 }).lean();
    
    // Transform to simplified asset objects if needed, or return branches directly
    const assets = branches.map((b: any) => ({
      branch: b.branch_code,
      total_strength: b.current_strength,
      laptop_available: b.laptop_available || 0,
      laptop_not_available: b.laptop_not_available || 0
    }));

    return NextResponse.json(assets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
