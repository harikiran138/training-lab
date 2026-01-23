import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Branch from '@/models/Branch';

export async function GET() {
  try {
    await dbConnect();
    const branches = await Branch.find({}).sort({ branch_code: 1 });
    return NextResponse.json(branches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
