import dotenv from 'dotenv';
import path from 'path';
import dbConnect from '../src/lib/mongodb';
import { analyzeStudentExtended } from '../src/services/ai/StudentAnalysisService';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testAI() {
  await dbConnect();
  console.log('🧪 Testing Extended AI Analysis for TEST_CRT_001...');

  try {
    const result = await analyzeStudentExtended('TEST_CRT_001');
    console.log('✅ AI Analysis Successful!');
    console.log('--- AI Recommendation ---');
    console.log(JSON.stringify(result.aiData, null, 2));
    
    console.log('\n--- Persistence Verification ---');
    console.log('Recommendation ID:', result.recommendation._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ AI Analysis Failed:', error);
    process.exit(1);
  }
}

testAI();
