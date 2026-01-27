import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import Student from '../src/models/Student';
import AcademicProfile from '../src/models/AcademicProfile';
import Address from '../src/models/Address';
import HostelDetails from '../src/models/HostelDetails';
import ParentGuardian from '../src/models/ParentGuardian';
import Subject from '../src/models/Subject';
import StudentSubject from '../src/models/StudentSubject';
import Skill from '../src/models/Skill';
import StudentSkill from '../src/models/StudentSkill';
import Project from '../src/models/Project';
import Assignment from '../src/models/Assignment';
import StudentAssignment from '../src/models/StudentAssignment';
import Assessment from '../src/models/Assessment';
import StudentAssessment from '../src/models/StudentAssessment';
import Internship from '../src/models/Internship';
import JobApplication from '../src/models/JobApplication';
import PerformanceScore from '../src/models/PerformanceScore';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function seed() {
  await dbConnect();
  console.log('🌱 Starting Extended Schema Seeding...');

  // 1. Core Student
  const student = await Student.findOneAndUpdate(
    { student_id: 'TEST_CRT_001' },
    {
      student_id: 'TEST_CRT_001',
      admission_no: 'ADM2024001',
      roll_no: '2024CRT001',
      name: 'John Doe',
      gender: 'Male',
      date_of_birth: new Date('2002-05-15'),
      email: 'john.doe.test@example.com',
      mobile_no: '9876543210',
      current_status: 'Active',
      branch_code: 'CSE',
      year: 3
    },
    { upsert: true, new: true }
  );
  console.log('✅ Student Created');

  // 2. Academic Profile
  await AcademicProfile.findOneAndUpdate(
    { student_id: student._id },
    {
      course: 'B.Tech',
      branch: 'Computer Science',
      current_semester: 6,
      cgpa: 8.5,
      ssc_percentage: 92,
      inter_percentage: 94,
      entrance_rank: 1540
    },
    { upsert: true }
  );
  console.log('✅ Academic Profile Created');

  // 3. Address & Hostel
  await Address.create({
    student_id: student._id,
    address_type: 'Permanent',
    full_address: '123 Test Street, Mock City',
    pincode: '500001'
  });
  await HostelDetails.findOneAndUpdate(
    { student_id: student._id },
    { hostel_name: 'Alpha Boys Hostel', room_no: 'B-302' },
    { upsert: true }
  );
  console.log('✅ Address & Hostel Created');

  // 4. Subjects & Skills
  const subject = await Subject.findOneAndUpdate(
    { subject_name: 'Data Structures' },
    { category: 'Core', semester: 3 },
    { upsert: true, new: true }
  );
  await StudentSubject.findOneAndUpdate(
    { student_id: student._id, subject_id: subject._id },
    { attendance_percentage: 88, internal_marks: 28, status: 'Passed' },
    { upsert: true }
  );

  const skill = await Skill.findOneAndUpdate(
    { skill_name: 'React.js' },
    { category: 'Technical' },
    { upsert: true, new: true }
  );
  await StudentSkill.findOneAndUpdate(
    { student_id: student._id, skill_id: skill._id },
    { proficiency_level: 'Intermediate', verified: true },
    { upsert: true }
  );
  console.log('✅ Subjects & Skills Created');

  // 5. Projects & Professional
  await Project.create({
    student_id: student._id,
    title: 'E-Commerce Platform',
    tech_stack: ['Node.js', 'React', 'MongoDB'],
    github_link: 'https://github.com/test/shop'
  });

  await Internship.create({
    student_id: student._id,
    company_name: 'Tech Corp',
    role: 'Frontend Intern',
    status: 'Completed'
  });

  await JobApplication.create({
    student_id: student._id,
    company_name: 'Google',
    job_role: 'Software Engineer',
    status: 'Applied',
    rounds: [{ round_name: 'Online Assessment', result: 'Passed' }]
  });
  console.log('✅ Projects & Professional Data Created');

  // 6. Performance Scores
  await PerformanceScore.findOneAndUpdate(
    { student_id: student._id },
    {
      aptitude_score: 85,
      coding_score: 78,
      communication_score: 90,
      overall_score: 84,
      ai_readiness_grade: 'B'
    },
    { upsert: true }
  );
  console.log('✅ Performance Scores Created');

  console.log('🚀 Seeding Completed Successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
