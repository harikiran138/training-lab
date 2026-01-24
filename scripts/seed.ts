import dbConnect from '../src/lib/mongodb';
import Branch from '../src/models/Branch';
import Week from '../src/models/Week';
import CRTWeeklyReport from '../src/models/CRTWeeklyReport';
import { AnalyticsService } from '../src/services/analytics/AnalyticsService';
import { generateWeeks, SEED_START_DATE, SEED_END_DATE } from '../src/utils/week-generator';
import { calculateSyllabusCompletion, calculateTestEffectiveness, calculateOverallScore } from '../src/services/metrics';
import * as dotenv from 'dotenv';
import { DataNormalizer } from '../src/services/ingestion/DataNormalizer';

dotenv.config({ path: '.env.local' });

const sampleBranches = [
  { branch_code: 'CSE-A', branch_name: 'Computer Science - A', total_students: 71, laptop_holders: 47 },
  { branch_code: 'CSE-B', branch_name: 'Computer Science - B', total_students: 68, laptop_holders: 42 },
  { branch_code: 'IT', branch_name: 'Information Technology', total_students: 65, laptop_holders: 40 },
  { branch_code: 'ECE', branch_name: 'Electronics & Communication', total_students: 72, laptop_holders: 35 },
  { branch_code: 'MECH', branch_name: 'Mechanical Engineering', total_students: 60, laptop_holders: 20 },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected.');

    console.log('Seeding Branches...');
    for (const branch of sampleBranches) {
      await Branch.findOneAndUpdate(
        { branch_code: branch.branch_code },
        branch,
        { upsert: true, new: true }
      );
    }
    console.log('Branches seeded.');

    // Note: Creating Week records if needed
    // const weeks = generateWeeks(SEED_START_DATE, SEED_END_DATE);
    // ... logic for week model ...

    console.log('Seeding Dummy Reports...');
    for (const branch of sampleBranches) {
      for (let i = 1; i <= 4; i++) {
        // Randomize performance
        let baseAtt = 70;
        let basePass = 50;
        
        if (branch.branch_code.includes('CSE')) { baseAtt = 85; basePass = 75; }
        if (branch.branch_code === 'MECH') { baseAtt = 50; basePass = 40; } // Intentionally low for risk testing

        const attendance_percent = Math.min(100, baseAtt + (Math.random() * 10 - 5));
        const test_attendance = Math.min(100, baseAtt + (Math.random() * 10 - 5));
        const test_pass = Math.min(100, basePass + (Math.random() * 20 - 10));
        
        const syllabus_total = 100;
        const syllabus_covered = i * 15;
        const coverage_percent = (syllabus_covered / syllabus_total) * 100;

        const riskLevel = DataNormalizer.getRiskLevel(attendance_percent, test_pass, 'On-Track');

        await CRTWeeklyReport.findOneAndUpdate(
          { branch_code: branch.branch_code, week_no: i },
          {
            branch_code: branch.branch_code,
            week_no: i,
            sessions: 5,
            attendance: { avg_attendance_percent: attendance_percent },
            tests: {
              avg_test_attendance_percent: test_attendance,
              avg_test_pass_percent: test_pass
            },
            syllabus: { 
                covered: syllabus_covered, 
                total: syllabus_total,
                coverage_percent: coverage_percent,
                status: 'On-Track'
            },
            computed: {
                attendance_score: 0, 
                test_score: 0, 
                overall_score: 0,
                risk_level: riskLevel
            }
          },
          { upsert: true }
        );
      }
    }
    console.log('Dummy reports seeded.');
    
    console.log('Refreshing Aggregates...');
    const result = await AnalyticsService.refreshAggregates();
    console.log(`Aggregates refreshed. Updated ${result.updated} records.`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
