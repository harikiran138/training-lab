
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Branch from '../src/models/Branch';
import CrtAttendanceRecord from '../src/models/CrtAttendanceRecord';
import AssessmentWeekly from '../src/models/AssessmentWeekly';
import PlacementDrive from '../src/models/PlacementDrive';
import SwotAnalysis from '../src/models/SwotAnalysis';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function verify() {
  try {
    console.log('--- STARTING DATABASE VERIFICATION ---\n');
    await mongoose.connect(MONGODB_URI as string);

    // 1. Branches & Assets
    const branches = await Branch.find({});
    console.log(`✅ Branches Found: ${branches.length} (Expected ~13)`);
    const cseA = branches.find(b => b.branch_code === 'CSE-A');
    if (cseA) {
        console.log(`   Sample (CSE-A): Strength=${cseA.current_strength}, Laptops=${cseA.get('laptop_available')}/${cseA.get('laptop_not_available')}`);
    }

    // 2. CRT Attendance
    const crtRecords = await CrtAttendanceRecord.find({});
    console.log(`\n✅ CRT Attendance Records: ${crtRecords.length}`);
    const batch32 = await CrtAttendanceRecord.countDocuments({ batch: '3-2' });
    const batch22 = await CrtAttendanceRecord.countDocuments({ batch: '2-2' });
    console.log(`   - 3-2 Batch Records: ${batch32} (Expected ~13 branches * 4 weeks = 52)`);
    console.log(`   - 2-2 Batch Records: ${batch22} (Expected ~5 branches * 2 weeks = 10)`);
    
    // Check specific specific record: 3-2, Week 1, EEE
    const sampleCrt = await CrtAttendanceRecord.findOne({ batch: '3-2', week_number: 1 }).populate('branch_id');
    if (sampleCrt) {
         console.log(`   Sample (3-2 Week 1): Branch=${(sampleCrt.branch_id as any).branch_code}, Attended=${sampleCrt.attended_count}, %=${sampleCrt.attendance_percentage}`);
    }

    // 3. Placements
    const placements = await PlacementDrive.find({});
    console.log(`\n✅ Placement Drives: ${placements.length} (Expected 3)`);
    placements.forEach(p => {
        console.log(`   - ${p.company_name} (${p.status}) - CTC: ${p.ctc_range}`);
    });

    // 4. Assessments
    const assessments = await AssessmentWeekly.find({});
    console.log(`\n✅ Assessment Records: ${assessments.length}`);
    const week2Assess = assessments.filter(a => a.week_number === 2);
    console.log(`   - Week 2 Assessments: ${week2Assess.length}`);

    // 5. SWOT
    const swot = await SwotAnalysis.find({});
    console.log(`\n✅ SWOT Analysis Entries: ${swot.length}`);
    swot.forEach(s => {
        console.log(`   - ${s.category}: ${s.points.length} points`);
    });

    console.log('\n--- VERIFICATION COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
