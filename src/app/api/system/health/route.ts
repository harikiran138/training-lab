import { NextResponse } from 'next/server';
import { DataAvailabilityService } from '@/services/DataAvailabilityService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await DataAvailabilityService.getSystemHealth();
    
    // Calculate overall system readiness
    const activeCount = health.filter(h => h.status === 'active').length;
    const readiness = Math.round((activeCount / health.length) * 100);

    return NextResponse.json({
      success: true,
      health,
      readiness,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
