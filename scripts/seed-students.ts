import dbConnect from '../src/lib/mongodb';
import Student from '../src/models/Student';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedStudents() {
  await dbConnect();
  
  console.log("Cleaning existing students...");
  await Student.deleteMany({});

  const studentData = [];
  const branches = ['CSE-A', 'CSE-B', 'IT', 'ECE', 'MECH'];

  for (let i = 1; i <= 100; i++) {
    const branch = branches[Math.floor(Math.random() * branches.length)];
    
    // Generate related metrics for better correlation
    // Attendance around 75% normally
    const attendance = Math.min(100, Math.max(0, 75 + (Math.random() * 30 - 15)));
    
    // Performance usually correlates with attendance
    const performanceBase = (attendance * 0.8) + (Math.random() * 20 - 10);
    const academic_score = Math.min(100, Math.max(0, performanceBase + (Math.random() * 10 - 5)));
    
    // CRT score
    const crt_score = Math.min(100, Math.max(0, performanceBase * 0.9 + (Math.random() * 15 - 7)));

    studentData.push({
      student_id: `2026_${branch}_${String(i).padStart(3, '0')}`,
      name: `Student ${i}`,
      branch_code: branch,
      year: 3,
      current_status: 'Active',
      // We will use these as custom fields in our analysis for now
      // Or map them to existing fields
      attendance_discipline_score: attendance,
      academic_gpa: (academic_score / 10), // Scale to 0-10
      tags: ['DSA', 'Web'],
      risk_level: attendance < 60 ? 'High' : (attendance < 75 ? 'Medium' : 'Low')
    });
  }

  await Student.insertMany(studentData);
  console.log(`✅ Seeded 100 students across ${branches.length} branches.`);
  process.exit(0);
}

seedStudents().catch(err => {
  console.error(err);
  process.exit(1);
});
