import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Week from '@/models/Week';

export async function GET() {
  try {
    await dbConnect();
    const weeks = await Week.find({}).sort({ week_no: 1 });
    return NextResponse.json(weeks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
