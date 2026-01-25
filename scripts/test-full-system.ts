import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';

// Core Models
import Student from '../src/models/Student';
import Faculty from '../src/models/Faculty';

// New System Models
import StudentGoal from '../src/models/StudentGoal';
import TrainingModule from '../src/models/TrainingModule';
import StudentTrainingProgress from '../src/models/StudentTrainingProgress';
import JobApplication from '../src/models/JobApplication';
import SelectionRound from '../src/models/SelectionRound';
import StudentGroup from '../src/models/StudentGroup';
import GroupMember from '../src/models/GroupMember';
import Notification from '../src/models/Notification';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runSystemIntegrationTest() {
  await dbConnect();
  console.log('🔄 Starting Education OS System Integration Test...');

  try {
    // 1. Setup Identities
    console.log('1️⃣  Creating Agents (Student & Faculty)...');
    const student = await Student.findOneAndUpdate(
      { student_id: 'SYS_TEST_STU_001' },
      {
        student_id: 'SYS_TEST_STU_001',
        roll_no: 'SYS_ROLL_001', 
        name: 'System Test User',
        email: 'systest@edu.co',
        current_status: 'Active'
      },
      { upsert: true, new: true }
    );

    const faculty = await Faculty.findOne({ faculty_id: 'FAC_2024_001' }) || 
                    await Faculty.create({
                      faculty_id: 'FAC_2024_001',
                      full_name: 'Dr. System Admin',
                      email: 'sysadmin@edu.co',
                      designation: 'Professor',
                      department: 'CSE'
                    });

    // 2. Goal Setting
    console.log('2️⃣  Setting Student Goals...');
    await StudentGoal.create({
      student_id: student._id,
      career_goal: 'Full Stack Engineer',
      dream_company: 'Google',
      target_role: 'SDE-1',
      target_package_lpa: 24,
      timeline_months: 12
    });

    // 3. Training Module Assignment
    console.log('3️⃣  Assigning Training...');
    const module = await TrainingModule.create({
      module_name: 'Advanced DSA 2024',
      category: 'Coding',
      difficulty: 'Advanced',
      duration_hours: 40
    });

    await StudentTrainingProgress.create({
      student_id: student._id,
      module_id: module._id,
      completion_percent: 45,
      status: 'In Progress'
    });

    // 4. Job Application & Rounds
    console.log('4️⃣  Simulating Placement Rounds...');
    const jobApp = await JobApplication.create({
      student_id: student._id,
      company_name: 'Tech Corp',
      job_role: 'Jr. Developer',
      status: 'Shortlisted',
      applied_date: new Date()
    });

    await SelectionRound.create({
      job_application_id: jobApp._id,
      round_name: 'Online Assessment',
      round_type: 'Coding',
      score: 85,
      result: 'Qualified',
      remarks: 'Strong array logic'
    });

    await SelectionRound.create({
      job_application_id: jobApp._id,
      round_name: 'Technical Interview 1',
      round_type: 'Technical',
      result: 'Pending',
      remarks: 'Scheduled for tomorrow'
    });

    // 5. Grouping & Mentorship
    console.log('5️⃣  Forming Mentorship Group...');
    const group = await StudentGroup.create({
      faculty_id: faculty._id,
      group_name: 'High Achievers Batch A',
      purpose: 'Mentorship',
      created_by: 'Admin'
    });

    await GroupMember.create({
      group_id: group._id,
      student_id: student._id
    });

    // 6. System Notification
    console.log('6️⃣  Triggering Notification...');
    await Notification.create({
      user_id: student.student_id,
      user_type: 'Student',
      message: 'You have cleared Round 1 for Tech Corp!',
      type: 'Achievement'
    });

    console.log('✅ System Integration Verified: All Modules Active');
    console.log('🧹 Cleaning up test data...');
    
    // Cleanup
    await Student.deleteOne({ _id: student._id });
    await StudentGoal.deleteMany({ student_id: student._id });
    await TrainingModule.deleteOne({ _id: module._id });
    await StudentTrainingProgress.deleteMany({ student_id: student._id });
    await JobApplication.deleteMany({ student_id: student._id });
    await SelectionRound.deleteMany({ job_application_id: jobApp._id });
    await StudentGroup.deleteOne({ _id: group._id });
    await GroupMember.deleteMany({ group_id: group._id });
    await Notification.deleteMany({ user_id: student.student_id });

    console.log('✨ System Clean & Ready');
    process.exit(0);

  } catch (error) {
    console.error('❌ Integration Failed:', error);
    process.exit(1);
  }
}

runSystemIntegrationTest();
