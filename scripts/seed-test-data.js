const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/training-lab';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Clear existing
        // await mongoose.connection.db.dropDatabase();

        // Create Users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const admin = {
            email: 'admin@test.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin',
            branches: [],
            active: true
        };

        const faculty = {
            email: 'faculty@test.com',
            password: hashedPassword,
            name: 'Faculty User',
            role: 'faculty',
            branches: ['CSE', 'ECE'],
            active: true
        };

        const viewer = {
            email: 'viewer@test.com',
            password: hashedPassword,
            name: 'Viewer User',
            role: 'viewer',
            branches: [],
            active: true
        };

        await mongoose.connection.collection('users').deleteMany({});
        await mongoose.connection.collection('users').insertMany([admin, faculty, viewer]);
        console.log('Users seeded');

        // Create a finalized report to test locking
        await mongoose.connection.collection('crtweeklyreports').updateOne(
            { branch_code: 'CSE', week_no: 1, semester: 'SEM1' },
            {
                $set: {
                    status: 'finalized',
                    locked_at: new Date(),
                    sessions: 10,
                    attendance: { avg_attendance_percent: 90 },
                    tests: { avg_test_attendance_percent: 80, avg_test_pass_percent: 70 },
                    syllabus: { covered: 5, total: 10 },
                    computed: { attendance_score: 90, test_score: 75, overall_score: 82.5 }
                }
            },
            { upsert: true }
        );
        console.log('Sample report seeded');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seed();
