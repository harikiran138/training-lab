import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GenericRecord from '@/models/GenericRecord';
import { INSTITUTIONAL_SCHEMAS } from '@/config/SchemaManager';
import { getSession } from '@/lib/auth';
import { logAction } from '@/services/audit';

/**
 * Generic Records API Handler (BUG-02 Fix & Missing Infrastructure)
 * Supports dynamic schema-based data persistence.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    await dbConnect();
    const { schema } = await params;

    // Validate schema
    if (!INSTITUTIONAL_SCHEMAS[schema]) {
      return NextResponse.json({ error: 'Schema calibration not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const epoch = parseInt(searchParams.get('epoch') || '1');

    const record = await GenericRecord.findOne({ schema_id: schema, epoch }).lean();

    if (!record) {
      return NextResponse.json([]);
    }

    return NextResponse.json(record.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    await dbConnect();
    const { schema } = await params;
    const body = await request.json();

    // Validate schema
    if (!INSTITUTIONAL_SCHEMAS[schema]) {
      return NextResponse.json({ error: 'Schema calibration not found.' }, { status: 404 });
    }

    const { records, epoch = 1, status = 'DRAFT' } = body;

    const updatedRecord = await GenericRecord.findOneAndUpdate(
      { schema_id: schema, epoch },
      {
        data: records,
        status,
        updated_at: new Date()
      },
      { upsert: true, new: true }
    );

    await logAction(
      session.id,
      'UPDATE_GENERIC_RECORD',
      'GenericRecord',
      updatedRecord._id.toString(),
      { schema, epoch, status }
    );

    return NextResponse.json({
      message: `Repository Synchronized :: ${schema} epoch ${epoch} committed.`,
      result: updatedRecord
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
