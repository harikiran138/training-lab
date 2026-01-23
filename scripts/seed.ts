import mongoose from 'mongoose';
import Branch from '../src/models/Branch';
import Week from '../src/models/Week';
import { generateWeeks, SEED_START_DATE, SEED_END_DATE } from '../src/utils/week-generator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crt_analytics';

const sampleBranches = [
  { branch_code: 'CSE-A', branch_name: 'Computer Science - A', total_students: 71, laptop_holders: 47 },
  { branch_code: 'CSE-B', branch_name: 'Computer Science - B', total_students: 68, laptop_holders: 42 },
  { branch_code: 'IT', branch_name: 'Information Technology', total_students: 65, laptop_holders: 40 },
  { branch_code: 'ECE', branch_name: 'Electronics & Communication', total_students: 72, laptop_holders: 35 },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // Clear existing data (optional, but good for testing)
    // await Branch.deleteMany({});
    // await Week.deleteMany({});

    console.log('Seeding Branches...');
    for (const branch of sampleBranches) {
      await Branch.findOneAndUpdate(
        { branch_code: branch.branch_code },
        branch,
        { upsert: true, new: true }
      );
    }
    console.log('Branches seeded.');

    console.log('Generating and Seeding Weeks...');
    const weeks = generateWeeks(SEED_START_DATE, SEED_END_DATE);
    for (const week of weeks) {
      await Week.findOneAndUpdate(
        { week_no: week.week_no },
        week,
        { upsert: true, new: true }
      );
    }
    console.log(`Successfully seeded ${weeks.length} weeks.`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
