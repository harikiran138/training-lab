import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Branch from '@/models/Branch';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    await dbConnect();

    const query: any = {};

    // Filter by branch for Faculty if restricted
    if (session && session.role === 'faculty' && session.branches && session.branches.length > 0) {
      query.branch_code = { $in: session.branches };
    }

    const branches = await Branch.find(query).sort({ branch_code: 1 });
    return NextResponse.json(branches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
