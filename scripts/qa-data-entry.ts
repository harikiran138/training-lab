import dbConnect from '@/lib/mongodb';
import CrtAttendanceRecord from '@/models/CrtAttendanceRecord';
import AssessmentWeekly from '@/models/AssessmentWeekly';
import { CrtAttendanceService, BranchAttendanceInput } from '@/services/CrtAttendanceService';
import mongoose from 'mongoose';

async function testDataIntegrity() {
  await dbConnect();
  console.log("Starting QA Integrity Check...");

  // 1. CRT ATTENDANCE LOGIC CHECK
  // Scenario: Attendance > Period Total (Should be handled/capped or flagged)
  const mockInput = [
    { branch_code: "QA-TEST", strength: 50, daily: [55, 60, "No CRT", 0, 0, 0], academic_year: "2025-26" }
  ] as any as BranchAttendanceInput[];
  
  const processed = CrtAttendanceService.processData(mockInput);
  
  const invalidDay = processed[0].days.percent[0];
  console.log(`[QA] Input Strength: 50, Attended: 55. Result Percent: ${invalidDay}%`);
  
  if (typeof invalidDay === 'number' && invalidDay > 100) {
      console.error("❌ CRITICAL: Attendance > 100% allowed without clamping.");
  } else {
      console.log("✅ Validation: Attendance percentage correctly clamped/handled.");
  }

  // 2. DUPLICATE ENTRY CHECK
  // Attempting to create duplicate Assessment record
  try {
     const dupData = {
         branch_id: new mongoose.Types.ObjectId(),
         academic_year: "2025-26",
         week_number: 10,
         exam_type: "Aptitude",
         exam_date: new Date(),
         total_students: 100,
         appeared_count: 90,
         passed_count: 80,
         avg_score: 75
     };
     
     // Clean up
     await AssessmentWeekly.deleteMany({ week_number: 10 });

     await AssessmentWeekly.create(dupData);
     console.log("✅ Created first assessment record.");
     
     await AssessmentWeekly.create(dupData);
     console.error("❌ CRITICAL: Duplicate assessment record created! Unique index failed.");
  } catch (e: any) {
      if (e.code === 11000) {
          console.log("✅ Index Consistency: Duplicate entry prevented by unique index.");
      } else {
          console.error("❌ Unexpected error:", e);
      }
  }

  // 3. SCHEMA EXISTENCE CHECK
  console.log("Checking 7-Point Schema Availability...");
  const schemas = [
      'CrtAttendanceRecord', 'AssessmentWeekly', 'StudentCareerLog', 
      'StudentAsset', 'SyllabusLog', 'StudentFeedbackWeekly', 'ProgramConclusion'
  ];
  
  for (const s of schemas) {
      if (mongoose.models[s]) {
          console.log(`✅ Schema Active: ${s}`);
      } else {
          console.error(`❌ Schema Missing: ${s}`);
      }
  }
}

testDataIntegrity()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
