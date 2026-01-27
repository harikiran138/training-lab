import { NextRequest, NextResponse } from 'next/server';
import { VisionIntelligenceService } from '@/services/ai/VisionIntelligenceService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image stream provided.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process through Vision Engine
    const extractedData = await VisionIntelligenceService.extractTableData(buffer);
    const mappedData = VisionIntelligenceService.mapToCrtSchema(extractedData);

    return NextResponse.json({
      success: true,
      data: mappedData,
      raw_count: extractedData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Vision Failure:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Vision link failure: ' + error.message 
    }, { status: 500 });
  }
}
