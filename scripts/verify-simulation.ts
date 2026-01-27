import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import Student from '../src/models/Student';
import AcademicProfile from '../src/models/AcademicProfile';
import PerformanceScore from '../src/models/PerformanceScore';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verify() {
  await dbConnect();
  console.log('🔍 Verifying Simulation Data...');

  // 1. Counts
  const studentCount = await Student.countDocuments({ student_id: /^SIM_STU_/ });
  const academicCount = await AcademicProfile.countDocuments({});
  const performanceCount = await PerformanceScore.countDocuments({});

  console.log(`- Simulated Students: ${studentCount}`);
  console.log(`- Total Academic Profiles: ${academicCount}`);
  console.log(`- Total Performance Scores: ${performanceCount}`);

  // 2. Sample Query Performance
  console.log('\n⚡ Testing Query Performance (Random Access)...');
  const randomIdx = Math.floor(Math.random() * 5000);
  const targetId = `SIM_STU_${randomIdx.toString().padStart(4, '0')}`;
  
  const startTime = performance.now();
  
  const student = await Student.findOne({ student_id: targetId }).lean();
  if (student) {
    const [academic, performanceScore] = await Promise.all([
      AcademicProfile.findOne({ student_id: student._id }).lean(),
      PerformanceScore.findOne({ student_id: student._id }).lean()
    ]);
    
    const endTime = performance.now();
    console.log(`✅ Fetched complete profile for ${targetId} in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`- Name: ${student.name}`);
    console.log(`- GPA: ${academic?.cgpa}`);
    console.log(`- Overall AI Score: ${performanceScore?.overall_score}`);
  } else {
    console.log(`❌ Failed to find student ${targetId}`);
  }

  process.exit(0);
}

verify().catch(err => {
  console.error('❌ Verification Failed:', err);
  process.exit(1);
});
