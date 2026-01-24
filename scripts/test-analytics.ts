import { AnalyticsService } from '../src/services/analytics/AnalyticsService';
import dbConnect from '../src/lib/mongodb';

async function runTest() {
  await dbConnect();
  
  console.log('--- Starting Analytics Test ---');
  try {
    const metrics = await AnalyticsService.getDashboardMetrics(1);
    console.log('Dashboard Metrics (Week 1):', JSON.stringify(metrics, null, 2));
    
    if (metrics.kpis.totalReportedBranches >= 2) {
         console.log('✅ Analytics correctly aggregated data.');
    } else {
         console.log('❌ Analytics returned unexpected branch count.');
    }

  } catch (e) {
    console.error('Test Failed:', e);
  }
  process.exit(0);
}

runTest();
