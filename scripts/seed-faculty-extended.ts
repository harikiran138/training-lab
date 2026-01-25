import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import Student from '../src/models/Student';
import Faculty from '../src/models/Faculty';
import FacultyEducation from '../src/models/FacultyEducation';
import FacultySubject from '../src/models/FacultySubject';
import Timetable from '../src/models/Timetable';
import FacultyStudentInteraction from '../src/models/FacultyStudentInteraction';
import FacultyClassStat from '../src/models/FacultyClassStat';
import FacultyCRTSession from '../src/models/FacultyCRTSession';
import FacultyTrainingOutcome from '../src/models/FacultyTrainingOutcome';
import FacultyFeedback from '../src/models/FacultyFeedback';
import FacultyPlacementImpact from '../src/models/FacultyPlacementImpact';
import FacultyPerformanceScore from '../src/models/FacultyPerformanceScore';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function seedFaculty() {
  await dbConnect();
  console.log('🌱 Starting Faculty 360° Seeding...');

  // 1. Core Student (Fetch existing or create)
  const student = await Student.findOne({ student_id: 'TEST_CRT_001' });
  if (!student) throw new Error("Run student seed first!");

  // 2. Core Faculty
  const faculty = await Faculty.findOneAndUpdate(
    { faculty_id: 'FAC_2024_001' },
    {
      faculty_id: 'FAC_2024_001',
      full_name: 'Dr. Sarah Wilson',
      gender: 'Female',
      email: 'sarah.wilson@academic.edu',
      mobile_no: '9988776655',
      designation: 'Associate Professor',
      department: 'CSE',
      highest_qualification: 'PhD in AI',
      specialization: 'Artificial Intelligence & Data Science',
      experience_years: 12,
      employment_type: 'Permanent',
      status: 'Active'
    },
    { upsert: true, new: true }
  );
  console.log('✅ Faculty Created');

  // 3. Education & Background
  await FacultyEducation.create({
    faculty_id: faculty._id,
    degree: 'PhD',
    specialization: 'Neural Networks',
    institution: 'Stanford University',
    year_of_passing: 2015
  });

  // 4. Subjects & Timetable
  const subject = await FacultySubject.findOneAndUpdate(
    { faculty_id: faculty._id, subject_name: 'Machine Learning' },
    { course: 'B.Tech', branch: 'CSE', semester: 6, academic_year: '2024-25' },
    { upsert: true }
  );

  await Timetable.create({
    faculty_id: faculty._id,
    day_of_week: 'Monday',
    period_no: 2,
    start_time: '10:00 AM',
    end_time: '11:00 AM',
    subject_name: 'Machine Learning',
    class_section: 'CSE-A',
    room_no: 'LH-305'
  });
  console.log('✅ Subjects & Timetable Linked');

  // 5. Interactions & Stats
  await FacultyStudentInteraction.create({
    faculty_id: faculty._id,
    student_id: student._id,
    interaction_type: 'Mentoring',
    duration_minutes: 45,
    remarks: 'Discussed career path in Data Science'
  });

  await FacultyClassStat.create({
    faculty_id: faculty._id,
    subject_name: 'Machine Learning',
    semester: 6,
    average_attendance: 92,
    pass_percentage: 95
  });
  console.log('✅ Interactions & Stats Created');

  // 6. CRT & Placement Impact
  await FacultyCRTSession.create({
    faculty_id: faculty._id,
    session_topic: 'Coding Interview Prep',
    session_type: 'Coding',
    students_attended: 120
  });

  await FacultyTrainingOutcome.create({
    faculty_id: faculty._id,
    batch: '2021-25',
    students_trained: 150,
    students_placed: 135,
    avg_package_lpa: 8.5
  });

  await FacultyPlacementImpact.create({
    faculty_id: faculty._id,
    academic_year: '2023-24',
    students_guided: 25,
    internships_secured: 20,
    placements_secured: 18
  });
  console.log('✅ CRT & Placement Impact Recorded');

  // 7. Feedback & Score
  await FacultyFeedback.create({
    faculty_id: faculty._id,
    student_id: student._id,
    rating: 5,
    comments: 'Excellent mentor, very helpful sessions.'
  });

  await FacultyPerformanceScore.findOneAndUpdate(
    { faculty_id: faculty._id },
    {
      teaching_score: 95,
      student_feedback_score: 98,
      crt_effectiveness_score: 90,
      placement_contribution_score: 92,
      overall_score: 94,
      faculty_grade: 'A+'
    },
    { upsert: true }
  );
  console.log('✅ Performance Scores Verified');

  console.log('🚀 Faculty Seeding Completed Successfully!');
  process.exit(0);
}

seedFaculty().catch(err => {
  console.error('❌ Faculty Seeding Failed:', err);
  process.exit(1);
});
