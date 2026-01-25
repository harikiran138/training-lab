import dotenv from 'dotenv';
import path from 'path';
import dbConnect from '../src/lib/mongodb';
import { analyzeFacultyExtended } from '../src/services/ai/FacultyAnalysisService';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testFacultyAI() {
  await dbConnect();
  console.log('🧪 Testing Extended Faculty AI Analysis for FAC_2024_001...');

  try {
    const result = await analyzeFacultyExtended('FAC_2024_001');
    console.log('✅ Faculty AI Analysis Successful!');
    console.log('--- AI Performance Report ---');
    console.log(JSON.stringify(result.aiData, null, 2));
    
    console.log('\n--- Persistence Verification ---');
    console.log('Insight ID:', result.insight._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Faculty AI Analysis Failed:', error);
    process.exit(1);
  }
}

testFacultyAI();
