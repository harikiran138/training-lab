import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import Student from '../src/models/Student';
import AcademicProfile from '../src/models/AcademicProfile';
import Address from '../src/models/Address';
import PerformanceScore from '../src/models/PerformanceScore';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runSimulation() {
  await dbConnect();
  console.log('🚀 Starting Scalability Simulation: 5000 Students...');
  
  // Cleanup previous simulation data
  const deletedCount = await Student.deleteMany({ student_id: /^SIM_STU_/ });
  console.log(`🧹 Cleaned up ${deletedCount.deletedCount} previous simulation records`);

  // Drop conflicting indexes (to allow sparse: true to take over)
  try {
    const col = mongoose.connection.collection('students');
    await col.dropIndex('aadhaar_no_1');
    await col.dropIndex('admission_no_1');
    await col.dropIndex('roll_no_1');
    await col.dropIndex('email_1');
    console.log('🗑️ Dropped stale indexes for recreation');
  } catch (e) {
    console.log('ℹ️ No stale indexes to drop or index not found');
  }
  
  const startTime = Date.now();

  const BATCH_SIZE = 500;
  const TOTAL_STUDENTS = 5000;
  const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];

  for (let i = 0; i < TOTAL_STUDENTS; i += BATCH_SIZE) {
    const studentsBatch = [];
    const academicBatch = [];
    const performanceBatch = [];

    for (let j = 0; j < BATCH_SIZE; j++) {
      const idx = i + j;
      const studentId = `SIM_STU_${idx.toString().padStart(4, '0')}`;
      
      studentsBatch.push({
        student_id: studentId,
        admission_no: `ADM_SIM_${idx}`,
        roll_no: `ROLL_SIM_${idx}`,
        name: `Student Name ${idx}`,
        email: `student${idx}@example.com`,
        branch_code: branches[idx % branches.length],
        year: (idx % 4) + 1,
        current_status: 'Active'
      });
    }

    // 1. Bulk Insert Students
    const insertedStudents = await Student.insertMany(studentsBatch);
    console.log(`✅ Batch ${i/BATCH_SIZE + 1}: Inserted ${BATCH_SIZE} Students`);

    // 2. Prepare Sub-batch Data using generated ObjectIDs
    for (let k = 0; k < insertedStudents.length; k++) {
      const s = insertedStudents[k];
      academicBatch.push({
        student_id: s._id,
        course: 'B.Tech',
        branch: s.branch_code,
        current_semester: s.year * 2,
        cgpa: (Math.random() * (10 - 6) + 6).toFixed(2)
      });

      performanceBatch.push({
        student_id: s._id,
        aptitude_score: Math.floor(Math.random() * 100),
        coding_score: Math.floor(Math.random() * 100),
        communication_score: Math.floor(Math.random() * 100),
        overall_score: Math.floor(Math.random() * 100)
      });
    }

    // 3. Bulk Insert Related Data
    await AcademicProfile.insertMany(academicBatch);
    await PerformanceScore.insertMany(performanceBatch);
    console.log(`🔗 Batch ${i/BATCH_SIZE + 1}: Linked Academic & Performance Data`);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  console.log(`\n🎉 Simulation Complete!`);
  console.log(`- Total Students: ${TOTAL_STUDENTS}`);
  const total_records = TOTAL_STUDENTS * 3; // Student + Academic + Performance
  console.log(`- Total Records Created: ${total_records}`);
  console.log(`- Time Taken: ${duration.toFixed(2)} seconds`);
  console.log(`- Speed: ${(TOTAL_STUDENTS / duration).toFixed(2)} students/second`);

  process.exit(0);
}

runSimulation().catch(err => {
  console.error('❌ Simulation Failed:', err);
  process.exit(1);
});
