import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Week from '@/models/Week';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    await dbConnect();
    const weeks = await Week.find({}).sort({ week_no: 1 });
    return NextResponse.json(weeks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
