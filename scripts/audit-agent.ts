import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/training-lab";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_FILE = 'MASTER_AUDIT_REPORT.md';

const MASTER_PROMPT = `
You are a Senior QA Architect + Security Auditor + AI Systems Tester.

Objective:
Perform a COMPLETE, END-TO-END audit of a college web application.

You must:
- Visit EVERY page
- Test EVERY route
- Validate EVERY input
- Check EVERY role
- Verify EVERY permission
- Inspect EVERY API
- Identify EVERY bug, edge case, loophole, or risk

DO NOT STOP until the entire system is covered.

════════════════════════════
SCOPE
════════════════════════════
Modules to audit:
- Authentication & Authorization
- Student Module
- Faculty Module
- CRT / Training Module
- Placement & Internship Module
- Events, Notifications, Banners
- Reports & Dashboards
- AI Integration
- File Uploads & OCR
- Admin & Configuration
- Database Integrity
- Performance & Security

════════════════════════════
TESTING INSTRUCTIONS
════════════════════════════

1. ROUTE & PAGE TESTING
For each route:
- Check unauthenticated access
- Check wrong role access
- Check broken redirects
- Check infinite loaders
- Check missing error states

2. FORM & INPUT VALIDATION
For every input field:
- Empty input
- Invalid format
- Max length overflow
- SQL injection attempt
- XSS attempt
- Unicode / emoji input

3. CRUD OPERATIONS
For every Create / Read / Update / Delete:
- Permission validation
- Partial failure handling
- Rollback on error
- Audit log generation

4. ROLE-BASED ACCESS CONTROL
Verify:
- Student cannot access faculty/admin routes
- Faculty can only access assigned students
- Admin actions are logged
- Privilege escalation is impossible

5. AI INTEGRATION CHECK
Ensure:
- AI never directly accesses database
- AI only receives scoped JSON
- Prompt injection is prevented
- Outputs are validated before display

6. FILE & IMAGE HANDLING
Test:
- Invalid file types
- Oversized uploads
- OCR mis-reads
- Manual override flows

7. DATA CONSISTENCY
Verify:
- No orphan records
- Foreign key integrity
- Soft deletes where required
- Historical data preserved

8. PERFORMANCE
Test:
- Large student datasets
- Concurrent logins
- Report generation load
- AI request throttling

════════════════════════════
OUTPUT REQUIREMENTS
════════════════════════════

Produce a MASTER AUDIT REPORT with:

- ✅ Passed checks
- ❌ Failed checks
- ⚠️ Risk warnings
- 🐞 Bugs (with steps to reproduce)
- 🔐 Security gaps
- 📈 Performance bottlenecks
- 🧠 AI reliability risks

For each issue provide:
{
  "module": "",
  "severity": "Critical / High / Medium / Low",
  "description": "",
  "root_cause": "",
  "fix_recommendation": "",
  "priority": ""
}

End with:
- Overall System Health Score (0–10)
- Deployment Readiness Verdict
- Mandatory Fixes Before Go-Live
`;

async function main() {
  console.log("🚀 Starting Master Audit Agent...");

  // 1. Fetch System Schema & Sample Data (Simulation for the Agent)
  const schemaSummary = await extractDatabaseSchema();
  
  // 2. Construct Prompt
  const fullPrompt = `${MASTER_PROMPT}\n\nHere is the current database schema and data summary of the system you are auditing:\n${schemaSummary}\n\nGenerate the MASTER AUDIT REPORT based on this architecture. Check for missing critical fields, potential bottlenecks, and security gaps in this schema structure.`;

  // 3. Call AI
  try {
    let reportContent = "";

    if (!GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY not found. Running in MOCK MODE.");
      console.log("🧠 Simulating AI analysis...");
      
      // MOCK RESPONSE
      reportContent = `# MASTER AUDIT REPORT (MOCK)
      
## ✅ Passed Checks
- Database connection established.
- Basic schema structure exists.
- 5 Critical modules detected (AuditLog, Document, RiskFlag, Announcement, SystemRule).

## ❌ Failed Checks
- [MOCK] API Key verification failed.
- [MOCK] Production environment variables missing.

## ⚠️ Risk Warnings
- **Role-Based Access Control**: Ensure middleware verifies roles on every route.
- **Input Sanitization**: API endpoints must sanitize 'prompt' inputs.

## 🐞 Bugs
- No real bugs detected in Mock Mode. Connect valid API Key for full audit.

## 🧠 AI Reliability Risks
- Current audit is a simulation. 

## Overall System Health Score: 5/10 (Mock)
## Deployment Readiness Verdict: PENDING AUDIT
      `;
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));

    } else {
      console.log("🧠 Analyzing system architecture... (this may take a minute)");
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      reportContent = response.text();
    }

    // 4. Save Report
    const outputPath = path.join(process.cwd(), OUTPUT_FILE);
    fs.writeFileSync(outputPath, reportContent);
    
    console.log(`✅ Audit Complete! Report saved to: ${outputPath}`);
    
  } catch (error) {
    console.error("❌ AI Generation Failed:", error);
  }
}

async function extractDatabaseSchema(): Promise<string> {
  // Use Mongoose to get the native client
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    
    // Wait for connection to be established if it's connecting
    if (mongoose.connection.readyState === 2) {
       await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    const admin = mongoose.connection.db?.admin();
    if (!admin) return "Could not access database admin.";

    const db = mongoose.connection.db;
    if (!db) return "Could not access database instance.";

    const collections = await db.listCollections().toArray();
    
    let summary = "DATABASE SCHEMA SNAPSHOT:\n";
    
    for (const col of collections) {
      summary += `\nCollection: ${col.name}\n`;
      // Sample one document
      const sample = await db.collection(col.name).findOne({});
      if (sample) {
        summary += `Sample Record Keys: ${Object.keys(sample).join(', ')}\n`;
      } else {
        summary += `(Empty Collection)\n`;
      }
    }
    
    return summary;

  } catch (error) {
    console.error("Error retrieving schema:", error);
    return "Error retrieving database schema.";
  } finally {
     await mongoose.disconnect();
  }
}

main();
