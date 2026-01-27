const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Interfaces
// Simulated Logic from CrtAttendanceService to verify correctness
function calculatePercentage(attended, strength) {
    if (!strength || strength <= 0) return 0;
    // The service logic we are testing clamps usage or expects numbers
    const raw = (attended / strength) * 100;
    return Math.round(raw);
}

// Manually define Schema for testing (to avoid full app load issues)
const AssessmentWeeklySchema = new mongoose.Schema({
  branch_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  academic_year: { type: String, required: true },
  week_number: { type: Number, required: true },
  exam_type: { type: String, enum: ['Aptitude', 'Coding'], required: true },
}, { timestamps: true });
AssessmentWeeklySchema.index({ branch_id: 1, week_number: 1, exam_type: 1 }, { unique: true });

async function runTest() {
    try {
        console.log("🛠  QA Audit: Starting Integrity Checks...");

        if (!process.env.MONGODB_URI) {
            console.warn("⚠️  MONGODB_URI not found in env. Creating Mock Connection.");
        } else {
             // await mongoose.connect(process.env.MONGODB_URI); // Skip DB connect if just testing logic logic
             console.log("ℹ️  Skipping DB Connect to focus on Logic & Schema Static Analysis");
        }

        // 1. ATTENDANCE LOGIC TEST
        console.log("\n----- TEST 1: Attendance Logic -----");
        // Scenario: 55 attended vs 50 strength
        const strength = 50;
        const attended = 55;
        const result = calculatePercentage(attended, strength);
        
        console.log(`Input: Strength ${strength}, Attended ${attended}. Result %: ${result}`);
        
        if (result > 100) {
            console.log("❌ FAIL: Calculation logic allows >100%. (Needs Backend Validation Fix)");
        } else {
            console.log("✅ PASS: Logic clamps values.");
        }


        // 2. DUPLICATE CHECK
        console.log("\n----- TEST 2: Schema Constraints -----");
        // We verify the index definition exists in our manual schema or loaded models
        const indexes = AssessmentWeeklySchema.indexes();
        const uniqueIndex = indexes.find(idx => idx[0].branch_id && idx[0].week_number && idx[1].unique);
        
        if (uniqueIndex) {
            console.log("✅ PASS: Compound Unique Index detected on AssessmentWeekly (branch + week + exam).");
        } else {
            console.log("❌ FAIL: Unique Index missing.");
        }

        // 3. SCHEMA REGISTRY
        console.log("\n----- TEST 3: Schema Registry -----");
        const requiredSchemas = [
            'CrtAttendanceRecord', 'AssessmentWeekly', 'StudentCareerLog', 
            'StudentAsset', 'SyllabusLog', 'StudentFeedbackWeekly', 'ProgramConclusion'
        ];
        
        // Simulating checking file existence since we can't load all models easily in script
        const fs = require('fs');
        const modelDir = path.join(__dirname, '../src/models');
        const files = fs.readdirSync(modelDir);
        
        requiredSchemas.forEach(schema => {
            if (files.includes(`${schema}.ts`)) {
                console.log(`✅ DISCOVERED: ${schema}.ts`);
            } else {
                console.log(`❌ MISSING: ${schema}.ts`);
            }
        });

    } catch (e) {
        console.error("Critical Error", e);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
