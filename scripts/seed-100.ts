import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';

// Load environment variables
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crt_analytics';

import Branch from '../src/models/Branch';
import GenericRecord from '../src/models/GenericRecord';
import User from '../src/models/User';
import CRTWeeklyReport from '../src/models/CRTWeeklyReport';
import { INSTITUTIONAL_SCHEMAS } from '../src/config/SchemaManager';

async function seed100() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // 1. Create Branches if they don't exist
    const branches = ['CSE-A', 'CSE-B', 'ECE-A', 'ECE-B', 'EEE', 'MECH', 'CIVIL', 'CSM', 'CSD', 'IT'];
    console.log('Seeding Branches...');
    for (const b of branches) {
      await Branch.findOneAndUpdate(
        { branch_code: b },
        { 
          branch_code: b, 
          branch_name: `${b} Department`,
          department: b.split('-')[0],
          current_strength: 60 + Math.floor(Math.random() * 20)
        },
        { upsert: true }
      );
    }

    // 1.5 Seed 100 CRTWeeklyReports (for dashboard metrics)
    console.log('Seeding 100 CRTWeeklyReports...');
    for (let i = 0; i < 100; i++) {
      const branch = branches[i % branches.length];
      const week = Math.floor(i / branches.length) + 1;
      await CRTWeeklyReport.findOneAndUpdate(
        { branch_code: branch, week_no: week },
        {
          branch_code: branch,
          week_no: week,
          status: 'finalized',
          attendance: { avg_attendance_percent: 70 + Math.random() * 25 },
          tests: {
            avg_test_attendance_percent: 80 + Math.random() * 15,
            avg_test_pass_percent: 60 + Math.random() * 30
          },
          syllabus: {
            covered: 2 + Math.floor(Math.random() * 3),
            total: 10,
            status: 'On-Track'
          },
          computed: {
            overall_score: 70 + Math.random() * 20,
            risk_level: 'Low'
          }
        },
        { upsert: true }
      );
    }

    // 2. Seed 100 Generic Records across different schemas
    console.log('Seeding 100 Generic Records...');
    const schemas = Object.keys(INSTITUTIONAL_SCHEMAS).filter(s => s !== 'crt_attendance');
    
    for (let i = 0; i < 100; i++) {
      const schemaId = schemas[i % schemas.length];
      const schemaDef = INSTITUTIONAL_SCHEMAS[schemaId];
      
      const mockData = branches.map(b => {
        const row: any = {};
        schemaDef.fields.forEach(f => {
          if (f.key === 'branch' || f.key === 'branch_code') row[f.key] = b;
          else if (f.type === 'number') row[f.key] = Math.floor(Math.random() * 100);
          else if (f.type === 'percent') row[f.key] = Math.floor(Math.random() * 100);
          else if (f.type === 'text') row[f.key] = `Sample ${f.label}`;
          else if (f.type === 'textarea') row[f.key] = `Sample long text for ${f.label} to test UI overflow and wrapping.`;
        });
        return row;
      });

      await GenericRecord.findOneAndUpdate(
        { schema_id: schemaId, epoch: Math.floor(i / schemas.length) + 1 },
        {
          data: mockData,
          status: 'LOCKED',
          metadata: { seeded: true }
        },
        { upsert: true }
      );
    }

    // 3. Generate Sample Excel File
    console.log('Generating Sample Excel File...');
    const sampleDir = path.resolve(__dirname, '../public/samples');
    if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });

    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Branch', 'Strength', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
      ...branches.map(b => [b, 70, 65, 62, 58, 'No CRT', 60, 55])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, path.join(sampleDir, 'test-attendance.xlsx'));

    console.log('Seed Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed Failed:', err);
    process.exit(1);
  }
}

seed100();
