import { NextRequest, NextResponse } from 'next/server';
import { IngestionService } from '@/services/ingestion/IngestionService';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await IngestionService.processFile(buffer, file.name, file.type);

    return NextResponse.json({ 
      message: 'File processing completed',
      details: result
    });

  } catch (error: any) {
    console.error('Ingestion Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
