import * as XLSX from 'xlsx';
import { IngestionService } from '../src/services/ingestion/IngestionService';
import dbConnect from '../src/lib/mongodb';
import path from 'path';
import fs from 'fs';

async function runTest() {
  await dbConnect();

  // 1. Create a dummy Excel file
  const rows = [
    {
      "Branch": "CSE",
      "Week No": "1",
      "Sessions": "5",
      "Avg Attendance": "85%",
      "Test Attendance": "90%",
      "Pass %": "75%",
      "Covered Topics": "5",
      "Total Topics": "50"
    },
    {
      "Branch": "ECE",
      "Week No": "1",
      "Sessions": "5",
      "Avg Attendance": "60%", // Low attendance -> Needs Attention
      "Test Attendance": "80%",
      "Pass %": "40%", // Low pass -> Risk
      "Covered Topics": "4",
      "Total Topics": "50"
    },
    {
      "Branch": "MECH", 
      "Week No": "1",
      "Sessions": "5",
      "Avg Attendance": "105%", // Invalid -> Should fail validation
      "Test Attendance": "20%",
      "Pass %": "20%",
      "Covered Topics": "5",
      "Total Topics": "50"
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const fileName = 'test_report.xlsx';

  console.log('--- Starting Ingestion Test ---');
  
  try {
    const result = await IngestionService.processFile(buffer, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    console.log('Ingestion Result:', JSON.stringify(result, null, 2));

    if (result.fails >= 1) {
      console.log('✅ Validation correctly caught invalid rows.');
    } else {
      console.log('❌ Validation FAILED to catch invalid rows.');
    }

  } catch (e) {
    console.error('Test Failed:', e);
  }

  process.exit(0);
}

runTest();
